(function(){
 'use strict';
 const cfg=window.FODMAN_CONFIG||{},form=document.getElementById('loanApplication'),error=document.getElementById('applyError'),button=form.querySelector('[type=submit]');
 const ready=/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl)&&/^sb_publishable_[\w-]+$/.test(cfg.publishableKey)&&/^[\w-]{10,100}$/.test(cfg.turnstileSiteKey||'');
 let widget=null,token='',busy=false;
 const purpose=new URLSearchParams(location.search).get('purpose');if(purpose&&[...form.elements.purpose.options].some(o=>o.value===purpose))form.elements.purpose.value=purpose;
 if(ready){
  document.getElementById('applyIntroText').textContent='Send your request directly to Fodman’s lending desk. An officer will review it and explain the requirements and terms before any commitment.';
  button.innerHTML='Submit application <span>→</span>';
  document.getElementById('applyFormNote').textContent='Your information is used to review this request and contact you. Do not submit ID documents or payment details here.';
  document.getElementById('applyStepOne').textContent='Submit your application';document.getElementById('applyStepOneText').textContent='Keep the reference shown after your request is received.';
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=()=>{widget=window.turnstile.render('#applyVerification',{sitekey:cfg.turnstileSiteKey,action:'loan-application',callback:t=>{token=t;},'expired-callback':()=>{token='';},'error-callback':()=>{token='';error.textContent='Verification could not load. Refresh the page or contact Fodman.';}});};
  script.onerror=()=>{error.textContent='Verification could not load. Refresh the page or contact Fodman.';};document.head.appendChild(script);
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;error.textContent='';if(form.elements.website.value||!form.reportValidity())return;
  const data=new FormData(form),amount=Number(data.get('amount')),months=Number(data.get('term')),phone=String(data.get('phone')).trim().replace(/[ ()-]/g,''),name=String(data.get('name')).trim();
  if(!Number.isSafeInteger(amount)||amount<1||amount>1000000000||!Number.isInteger(months)||months<1||months>60){error.textContent='Enter a whole UGX amount and a term between 1 and 60 months.';return;}
  if(!/^\+?[0-9]{7,15}$/.test(phone)||name.length<2){error.textContent='Enter your full name and a valid phone number, including country code.';return;}
  const application={name,phone,amount,months,purpose:String(data.get('purpose')),consent:data.get('consent')==='on'};
  if(!ready){const ref='WEB-'+Date.now().toString(36).toUpperCase(),msg=['*FODMAN FINANCIAL SERVICES ENQUIRY*','Reference: '+ref,'','Name: '+name,'Phone: '+phone,'Amount requested: UGX '+amount.toLocaleString('en-US'),'Preferred term: '+months+' months','Purpose: '+application.purpose,'','I understand that assessment and terms apply.'].join('\n');window.open('https://wa.me/'+String(cfg.supportPhone||'+256775858924').replace(/\D/g,'')+'?text='+encodeURIComponent(msg),'_blank','noopener');document.getElementById('applyFormNote').textContent='WhatsApp draft prepared. Review it and tap Send. This enquiry is received only when you send the message.';return;}
  if(!token){error.textContent='Please complete the verification before submitting.';return;}
  busy=true;button.disabled=true;const oldText=button.innerHTML;button.textContent='Submitting…';
  try{
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(application))))].map(n=>n.toString(16).padStart(2,'0')).join('');
   let retry;try{retry=JSON.parse(sessionStorage.getItem('fodman-application-retry'));}catch{}
   if(!retry||retry.hash!==hash)retry={hash,key:crypto.randomUUID()};sessionStorage.setItem('fodman-application-retry',JSON.stringify(retry));
   const res=await fetch(cfg.supabaseUrl+'/functions/v1/lending-intake',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({application,requestKey:retry.key,turnstileToken:token}),signal:AbortSignal.timeout(25000)});
   const saved=await res.json();if(!res.ok)throw Error(saved.error||'Could not submit. Please try again.');if(!/^APP-[A-Z0-9]{16}$/.test(saved.reference||''))throw Error('We could not confirm receipt. Please contact Fodman.');
   sessionStorage.removeItem('fodman-application-retry');form.reset();form.hidden=true;const success=document.getElementById('applySuccess');success.hidden=false;document.getElementById('applicationReference').textContent=saved.reference;success.focus();
  }catch(err){error.textContent=err.name==='TimeoutError'?'The connection timed out. Please retry with the same details; your request will not be duplicated.':err.message;}
  finally{busy=false;button.disabled=false;button.innerHTML=oldText;token='';if(widget!==null)window.turnstile.reset(widget);}
 });
})();
