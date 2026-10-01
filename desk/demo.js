import {schedule,allocate,businessDate} from './finance.js';
export function createDemo(){
  const today=businessDate(),uid=()=>crypto.randomUUID();
  const staff={user_id:uid(),name:'Francis',email:'Demo administrator',role:'admin',active:true};
  const borrowers=[{id:uid(),name:'Demo • Amina Traders',phone:'+256700000001',address:'Fictional borrower'},{id:uid(),name:'Demo • David Kato',phone:'+256700000002',address:'Fictional borrower'}];
  const a={id:uid(),reference:'DEMO-001',name:'Demo • Sarah N.',phone:'+256700000003',amount:800000,months:3,purpose:'Business stock',source:'website',status:'New',created_at:new Date().toISOString(),request_key:uid()};
  const loans=borrowers.map((b,i)=>({id:uid(),reference:'DEMO-L00'+(i+1),borrower_id:b.id,principal:i?600000:1500000,rate_bps:250,months:3,disbursed_on:i?today:'2026-07-31',schedule:schedule(i?600000:1500000,250,3,i?today:'2026-07-31'),created_at:new Date().toISOString()}));
  const payment={id:uid(),reference:'DEMO-R001',loan_id:loans[0].id,amount:300000,paid_on:today,method:'Cash',external_ref:'',created_at:new Date().toISOString(),recorded_by:staff.user_id,voided_at:null};
  loans[0].schedule=allocate(loans[0].schedule,payment.amount);
  const state={profile:staff,staff:[staff],settings:{company:'Fodman International Limited',terms_ready:true,min_amount:10000,max_amount:100000000,rate_bps:250,max_months:12,two_person:false},applications:[a],borrowers,loans,payments:[payment],audit:[],server_time:new Date().toISOString()};
  const log=(action,id)=>state.audit.unshift({id:uid(),actor_id:staff.user_id,action,entity_id:id,created_at:new Date().toISOString()});
  return {snapshot:()=>structuredClone(state),async rpc(name,p){
    const app=state.applications.find(a=>a.id===p.p_id);
    if(name==='lending_snapshot')return this.snapshot();
    if(name==='staff_application'){const old=state.applications.find(a=>a.request_key===p.p_key);if(old)return old;const a={id:uid(),reference:'DEMO-A'+String(state.applications.length+1).padStart(3,'0'),...p.p_data,status:'New',source:'staff',request_key:p.p_key,created_at:new Date().toISOString()};state.applications.unshift(a);log('application_created',a.id);return a;}
    if(name==='review_application'){if(app.status==='New')app.status='Under review';app.reviewed_by=staff.user_id;log('application_reviewed',app.id);return app;}
    if(name==='decide_application'){if(!['New','Under review'].includes(app.status))throw Error('Application already decided.');app.status=p.p_approve?'Approved':'Rejected';app.decision_note=p.p_note;Object.assign(app,p.p_approve?{approved_principal:p.p_principal,approved_rate_bps:p.p_rate_bps,approved_months:p.p_months,approved_at:new Date().toISOString()}:{decision_note:p.p_note});log('application_'+app.status.toLowerCase(),app.id);return app;}
    if(name==='disburse_application'){const old=state.loans.find(l=>l.application_id===app.id);if(old)return old;if(app.status!=='Approved')throw Error('Approve this application first.');let b=state.borrowers.find(b=>b.phone===app.phone);if(!b){b={id:uid(),name:app.name,phone:app.phone,address:app.address||''};state.borrowers.unshift(b);}const l={id:uid(),reference:'DEMO-L'+String(state.loans.length+1).padStart(3,'0'),application_id:app.id,borrower_id:b.id,principal:app.approved_principal,rate_bps:app.approved_rate_bps,months:app.approved_months,disbursed_on:p.p_date,schedule:schedule(app.approved_principal,app.approved_rate_bps,app.approved_months,p.p_date),disbursement_method:p.p_method,disbursement_ref:p.p_ref,created_at:new Date().toISOString()};state.loans.unshift(l);app.status='Disbursed';log('loan_disbursed',l.id);return l;}
    if(name==='record_payment'){const old=state.payments.find(x=>x.request_key===p.p_key);if(old)return old;const l=state.loans.find(l=>l.id===p.p_loan);const rows=allocate(l.schedule,p.p_amount);const pay={id:uid(),reference:'DEMO-R'+String(state.payments.length+1).padStart(3,'0'),loan_id:l.id,amount:p.p_amount,method:p.p_method,external_ref:p.p_ref,paid_on:p.p_date,request_key:p.p_key,recorded_by:staff.user_id,created_at:new Date().toISOString()};l.schedule=rows;state.payments.unshift(pay);log('payment_recorded',pay.id);return pay;}
    if(name==='reverse_payment'){const pay=state.payments.find(x=>x.id===p.p_id);pay.voided_at=new Date().toISOString();pay.void_reason=p.p_reason;const l=state.loans.find(l=>l.id===pay.loan_id),sum=state.payments.filter(x=>x.loan_id===l.id&&!x.voided_at).reduce((s,x)=>s+x.amount,0);l.schedule=allocate(l.schedule.map(r=>({...r,paid:0})),sum);log('payment_reversed',pay.id);return pay;}
    if(name==='save_lending_settings'){Object.assign(state.settings,p.p_data);log('settings_updated','settings');return state.settings;}
    if(name==='manage_staff'){const s=state.staff.find(s=>s.user_id===p.p_user);Object.assign(s,{role:p.p_role,active:p.p_active});return s;}
    throw Error('This operation needs a live connection.');
  }};
}
