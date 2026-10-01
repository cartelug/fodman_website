// Flat monthly interest. Whole UGX; remainder belongs to the final instalment.
export const businessDate = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Kampala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function monthDate(start,months){
  const [y,m,d]=start.split('-').map(Number);
  const first=new Date(Date.UTC(y,m-1+months,1));
  const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  return `${first.getUTCFullYear()}-${String(first.getUTCMonth()+1).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`;
}
export function schedule(principal,rateBps,months,start){
  if(!Number.isSafeInteger(principal)||principal<1||principal>1e9||!Number.isInteger(rateBps)||rateBps<0||rateBps>10000||!Number.isInteger(months)||months<1||months>60||!/^\d{4}-\d{2}-\d{2}$/.test(start))throw Error('Invalid loan terms.');
  const interest=Number((BigInt(principal)*BigInt(rateBps)*BigInt(months)+5000n)/10000n);
  const p=Math.floor(principal/months),i=Math.floor(interest/months);
  return Array.from({length:months},(_,n)=>({n:n+1,due_date:monthDate(start,n+1),principal:n===months-1?principal-p*n:p,interest:n===months-1?interest-i*n:i,paid:0})).map(x=>({...x,total:x.principal+x.interest}));
}
export function allocate(rows,amount){
  if(!Number.isSafeInteger(amount)||amount<0)throw Error('Invalid payment.');
  const due=rows.reduce((s,r)=>s+r.total-r.paid,0);if(amount>due)throw Error('Payment exceeds outstanding balance.');
  return rows.map(r=>{const take=Math.min(r.total-r.paid,amount);amount-=take;return {...r,paid:r.paid+take};});
}
export function loanFigures(loan,today=businessDate()){
  const rows=loan.schedule||[],total=rows.reduce((s,r)=>s+r.total,0),paid=rows.reduce((s,r)=>s+r.paid,0);
  const overdue=rows.filter(r=>r.due_date<today).reduce((s,r)=>s+r.total-r.paid,0);
  return {total,paid,balance:total-paid,overdue,status:total===paid?'Cleared':overdue>0?'Overdue':'Active',next:rows.find(r=>r.paid<r.total)};
}
