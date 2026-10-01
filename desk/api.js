const cfg=window.FODMAN_CONFIG||{};
let session=null,refreshing=null;
const STORAGE='fodman-staff-session-v1';
export const configured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl)&&/^sb_publishable_[\w-]+$/.test(cfg.publishableKey);
async function request(path,body,token,method='POST'){
  const res=await fetch(cfg.supabaseUrl+path,{method,signal:AbortSignal.timeout(20000),headers:{apikey:cfg.publishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(method!=='GET'?{body:JSON.stringify(body)}:{})});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw Error(data?.message||data?.error_description||data?.msg||data?.error||'Could not save. Please try again.');
  return data;
}
function save(value){session=value;if(value)sessionStorage.setItem(STORAGE,JSON.stringify(value));else sessionStorage.removeItem(STORAGE);}
export async function signIn(email,password){const s=await request('/auth/v1/token?grant_type=password',{email,password});save({...s,expires_at:Date.now()+s.expires_in*1000});return s;}
export async function recover(email){return request('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+location.pathname),{email});}
export async function changePassword(password){return request('/auth/v1/user',{password},await token(),'PUT');}
export function restore(){try{session=JSON.parse(sessionStorage.getItem(STORAGE));}catch{save(null);}return session;}
export function acceptInvite(){const hash=new URLSearchParams(location.hash.slice(1));if(hash.has('access_token')){save({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_at:Date.now()+Number(hash.get('expires_in')||3600)*1000});history.replaceState(null,'',location.pathname);return true;}return false;}
async function token(){
  if(!session)throw Error('Please sign in again.');
  if(session.expires_at-Date.now()<60000){
    if(!refreshing)refreshing=request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(s=>save({...s,expires_at:Date.now()+s.expires_in*1000})).catch(e=>{save(null);throw e;}).finally(()=>{refreshing=null;});
    await refreshing;
  }
  return session.access_token;
}
export async function rpc(name,args={}){return request('/rest/v1/rpc/'+name,args,await token());}
export async function invite(email,name,role){return request('/functions/v1/staff-invite',{email,name,role,redirectTo:location.origin+location.pathname},await token());}
export async function signOut(){try{if(session)await request('/auth/v1/logout',{},session.access_token);}catch{}finally{save(null);}}
