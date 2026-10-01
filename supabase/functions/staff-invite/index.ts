import {createClient} from 'npm:@supabase/supabase-js@2.117.2';
import {environment,serverKey,origins,json,cors,body} from '../_shared/http.ts';
Deno.serve(async (req: Request): Promise<Response>=>{
 const origin=req.headers.get('origin')||'';
 if(!origin||!origins().includes(origin))return new Response('Origin not allowed',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=='POST')return json(origin,405,{error:'Method not allowed.'});
 const url=environment('SUPABASE_URL'),key=serverKey(),authorization=req.headers.get('authorization')||'';
 if(!authorization.startsWith('Bearer ')||!url||!key)return json(origin,401,{error:'Sign in as an administrator.'});
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=authorization.slice(7),{data:{user},error}=await admin.auth.getUser(token);
 if(error||!user)return json(origin,401,{error:'Sign in again.'});
 const {data:profile}=await admin.from('staff_profiles').select('role,active').eq('user_id',user.id).single();
 if(!profile?.active||profile.role!=='admin')return json(origin,403,{error:'Only administrators can invite staff.'});
 try{
  const data=await body(req),{email,name,role,redirectTo}=data;
  if(typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof name!=='string'||name.trim().length<1||name.length>120||typeof role!=='string'||!['admin','loan_officer','cashier','viewer'].includes(role))throw Error('Enter a valid name, email and role.');
  if(typeof redirectTo!=='string'||redirectTo!==environment('STAFF_REDIRECT_URL'))throw Error('Invitation redirect is not configured for this desk.');
  const {data:invited,error:inviteError}=await admin.auth.admin.inviteUserByEmail(email.trim(),{redirectTo});
  if(inviteError||!invited.user)return json(origin,400,{error:'Invitation could not be sent. Check email delivery settings and whether this account already exists.'});
  // Use the caller JWT so the database checks the current administrator role again.
  const caller=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {error:registrationError}=await caller.rpc('register_staff',{p_user:invited.user.id,p_name:name.trim(),p_role:role});
  if(registrationError)return json(origin,409,{error:'Invitation sent, but staff access was not granted. Ask the project administrator to register this user after checking the account.'});
  return json(origin,201,{ok:true});
 }catch(error){return json(origin,400,{error:error instanceof Error?error.message:'Could not invite user.'});}
});
