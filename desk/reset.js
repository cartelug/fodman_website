import * as api from './api.js';

const form=document.querySelector('#resetPassword'),error=document.querySelector('#resetError');
let tokenHash=null,verified=false,busy=false;
// Keep the recovery token out of browser history and later navigation. Opening the
// page never consumes it; verification happens only when the owner submits the form.
function takeRecoveryLink(){
 if(busy)return;
 tokenHash=new URLSearchParams(location.hash.slice(1)).get('token_hash');verified=false;
 history.replaceState(null,'',location.pathname);
 const ready=api.configured()&&!location.hostname.endsWith('github.io')&&/^[A-Za-z0-9_-]{32,256}$/.test(tokenHash||'');
 form.reset();error.textContent='';form.hidden=!ready;
 document.querySelector('#resetUnavailable').hidden=ready;
 document.querySelector('#resetHelp').hidden=!ready;
 document.querySelector('#resetSuccess').hidden=true;
}
takeRecoveryLink();window.addEventListener('hashchange',takeRecoveryLink);

form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 error.textContent='';
 const data=new FormData(form),password=String(data.get('password')||''),confirm=String(data.get('confirm')||'');
 if(password.length<12){error.textContent='Use at least 12 characters.';return;}
 if(password!==confirm){error.textContent='The passwords do not match. Enter the same password twice.';return;}
 busy=true;const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Saving your password…';
 try{
  if(!verified){await api.verifyRecovery(tokenHash);verified=true;tokenHash=null;}
  await api.changePassword(password);
  form.reset();form.hidden=true;document.querySelector('#resetHelp').hidden=true;
  document.querySelector('#resetSuccess').hidden=false;
 }catch(e){error.textContent=e.message||'Your password could not be updated. Please try again.';}
 finally{busy=false;button.disabled=false;button.textContent='Save new password →';if(location.hash)takeRecoveryLink();}
});
