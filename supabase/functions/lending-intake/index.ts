import {environment,serverKey,origins,json,cors,body,digest,serviceHeaders} from '../_shared/http.ts';
Deno.serve(async (req: Request): Promise<Response>=>{
 const origin=req.headers.get('origin')||'';
 if(!origin||!origins().includes(origin))return new Response('Origin not allowed',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=='POST')return json(origin,405,{error:'Method not allowed.'});
 const key=serverKey(),secret=environment('TURNSTILE_SECRET_KEY'),salt=environment('INTAKE_IP_SALT'),url=environment('SUPABASE_URL');
 if(!key||!secret||!salt||!url)return json(origin,503,{error:'Online applications are being set up. Please contact Fodman.'});
 try{
  const data=await body(req),app=data.application as Record<string,unknown>,requestKey=data.requestKey;
  if(typeof requestKey!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey))throw Error('Invalid application reference.');
  if(!app||Array.isArray(app)||typeof app!=='object'||typeof app.name!=='string'||app.name.trim().length<2||app.name.length>160||typeof app.phone!=='string'||!/^\+?[0-9]{7,15}$/.test(app.phone)||!Number.isSafeInteger(app.amount)||Number(app.amount)<1||Number(app.amount)>1000000000||!Number.isInteger(app.months)||Number(app.months)<1||Number(app.months)>60||typeof app.purpose!=='string'||app.purpose.trim().length<2||app.purpose.length>1000||app.consent!==true)throw Error('Check your name, phone, amount, term, purpose and consent.');
  if(typeof data.turnstileToken!=='string'||data.turnstileToken.length<1||data.turnstileToken.length>2048)throw Error('Please complete the verification and try again.');
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:data.turnstileToken,idempotency_key:requestKey}),signal:AbortSignal.timeout(12000)});
  const result=await verify.json();
  if(!result.success||result.action!=='loan-application'||result.hostname!==new URL(origin).hostname)throw Error('Verification expired or failed. Please try again.');
  // Trust only the proxy's forwarded IP; never a value supplied in the JSON body.
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim();if(!ip)return json(origin,503,{error:'Online applications are temporarily unavailable. Please call Fodman.'});
  const response=await fetch(url+'/rest/v1/rpc/website_application',{method:'POST',headers:serviceHeaders(key),body:JSON.stringify({p_key:requestKey,p_data:{name:app.name.trim(),phone:app.phone,amount:app.amount,months:app.months,purpose:app.purpose.trim(),consent:true},p_ip_hash:await digest(salt+':'+ip)}),signal:AbortSignal.timeout(15000)});
  const saved=await response.json();if(!response.ok){if(String(saved.message||'').includes('Too many'))return json(origin,429,{error:'Too many requests. Please call Fodman for help.'});return json(origin,400,{error:'Could not submit this request. Check the details or contact Fodman.'});}
  return json(origin,201,{reference:saved.reference});
 }catch(error){const message=error instanceof Error?error.message:'Please try again.';return json(origin,400,{error:message.includes('fetch')||message.includes('timeout')?'Connection interrupted. Please try again with the same details.':message});}
});
