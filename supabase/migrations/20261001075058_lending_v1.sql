-- FODMAN Lending V1. New, dedicated Supabase project; no demo data.
begin;
create schema if not exists lending_private;
revoke all on schema lending_private from public, anon, authenticated;
create table public.staff_profiles (
 user_id uuid primary key references auth.users(id), name text not null check(length(name) between 1 and 120),
 role text not null check(role in ('admin','loan_officer','cashier','viewer')), active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.lending_settings (
 id boolean primary key default true check(id), company text not null default 'Fodman International Limited',
 min_amount bigint not null default 10000 check(min_amount>0), max_amount bigint not null default 100000000 check(max_amount between min_amount and 1000000000),
 rate_bps int check(rate_bps between 0 and 10000), max_months int not null default 12 check(max_months between 1 and 60),
 terms_ready boolean not null default false, two_person boolean not null default false,
 updated_at timestamptz not null default now(), check(not terms_ready or rate_bps is not null)
);
insert into public.lending_settings(id) values(true);
create table public.applications (
 id uuid primary key default gen_random_uuid(), request_key uuid not null unique,
 reference text not null unique default 'APP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 name text not null check(length(name) between 2 and 160), phone text not null check(phone ~ '^\+?[0-9]{7,15}$'),
 amount bigint not null check(amount between 1 and 1000000000), months int not null check(months between 1 and 60),
 purpose text not null check(length(purpose) between 2 and 1000), address text not null default '',
 consent_at timestamptz not null, source text not null check(source in ('website','staff')),
 status text not null default 'New' check(status in ('New','Under review','Approved','Rejected','Disbursed')),
 reviewed_by uuid references public.staff_profiles(user_id), approved_by uuid references public.staff_profiles(user_id), approved_at timestamptz,
 approved_principal bigint, approved_rate_bps int, approved_months int, decision_note text not null default '',
 created_at timestamptz not null default now()
);
create table public.borrowers (
 id uuid primary key default gen_random_uuid(), name text not null, phone text not null unique,
 address text not null default '', created_at timestamptz not null default now()
);
create table public.loans (
 id uuid primary key default gen_random_uuid(), application_id uuid not null unique references public.applications(id),
 reference text not null unique default 'LN-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 borrower_id uuid not null references public.borrowers(id), principal bigint not null check(principal>0),
 rate_bps int not null check(rate_bps between 0 and 10000), months int not null check(months between 1 and 60),
 disbursed_on date not null, disbursement_method text not null check(disbursement_method in ('Cash','MoMo','Bank')),
 disbursement_ref text not null default '', schedule jsonb not null check(jsonb_typeof(schedule)='array'),
 created_by uuid not null references public.staff_profiles(user_id), created_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), request_key uuid not null unique,
 reference text not null unique default 'RCPT-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 loan_id uuid not null references public.loans(id), amount bigint not null check(amount>0), paid_on date not null,
 method text not null check(method in ('Cash','MoMo','Bank')), external_ref text not null default '',
 recorded_by uuid not null references public.staff_profiles(user_id), created_at timestamptz not null default now(),
 voided_at timestamptz, voided_by uuid references public.staff_profiles(user_id), void_reason text
);
create unique index payment_external_reference on public.payments(method,lower(external_ref)) where external_ref<>'';
create index payments_loan_id on public.payments(loan_id);
create index applications_created on public.applications(created_at desc);
create table public.lending_audit (
 id uuid primary key default gen_random_uuid(), actor_id uuid, action text not null, entity_id text not null,
 detail jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table lending_private.intake_attempts(ip_hash text not null, created_at timestamptz not null default now());
create index intake_ip_created on lending_private.intake_attempts(ip_hash,created_at);

create function lending_private.business_date() returns date language sql stable set search_path='' as $$select (now() at time zone 'Africa/Kampala')::date$$;
create function lending_private.staff_role() returns text language sql stable security definer set search_path='' as $$select role from public.staff_profiles where user_id=auth.uid() and active$$;
create function lending_private.require_role(roles text[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce(lending_private.staff_role(),'')<>all(roles) then raise exception 'Permission denied: authorised staff only.' using errcode='42501'; end if;
end$$;
create function lending_private.audit(action text,entity text,detail jsonb default '{}') returns void language sql security definer set search_path='' as $$insert into public.lending_audit(actor_id,action,entity_id,detail) values(auth.uid(),action,entity,detail)$$;

-- Monthly flat interest only in V1. All money is exact integer UGX.
create function lending_private.make_schedule(p bigint,r int,n int,d date) returns jsonb language plpgsql immutable set search_path='' as $$
declare interest bigint; bp bigint; bi bigint; rows jsonb:='[]'; i int; pp bigint; ii bigint;
begin
 if p<1 or p>1000000000 or r<0 or r>10000 or n<1 or n>60 or d is null then raise exception 'Invalid loan terms.';end if;
 interest:=round(p::numeric*r*n/10000)::bigint; bp:=p/n; bi:=interest/n;
 for i in 1..n loop
  pp:=case when i=n then p-bp*(n-1) else bp end; ii:=case when i=n then interest-bi*(n-1) else bi end;
  rows:=rows||jsonb_build_array(jsonb_build_object('n',i,'due_date',(d+make_interval(months=>i))::date,'principal',pp,'interest',ii,'total',pp+ii,'paid',0));
 end loop;return rows;
end$$;
create function lending_private.allocate(rows jsonb,amount bigint) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb:='[]'; item jsonb; take bigint; balance bigint;
begin
 select coalesce(sum((v->>'total')::bigint-(v->>'paid')::bigint),0) into balance from jsonb_array_elements(rows) v;
 if amount<0 or amount>balance then raise exception 'Payment exceeds outstanding balance.';end if;
 for item in select value from jsonb_array_elements(rows) loop
  take:=least((item->>'total')::bigint-(item->>'paid')::bigint,amount);amount:=amount-take;
  result:=result||jsonb_build_array(jsonb_set(item,'{paid}',to_jsonb((item->>'paid')::bigint+take)));
 end loop;return result;
end$$;
create function lending_private.validate_application(data jsonb) returns void language plpgsql set search_path='' as $$
begin
 if data is null or jsonb_typeof(data)<>'object' or length(trim(coalesce(data->>'name',''))) not between 2 and 160
 or coalesce(data->>'phone','') !~ '^\+?[0-9]{7,15}$' or coalesce(data->>'amount','') !~ '^[0-9]{1,10}$'
 or (data->>'amount')::bigint not between 1 and 1000000000 or coalesce(data->>'months','') !~ '^[0-9]{1,2}$'
 or (data->>'months')::int not between 1 and 60 or length(trim(coalesce(data->>'purpose',''))) not between 2 and 1000
 or length(coalesce(data->>'address',''))>500 or coalesce(data->>'consent','false')<>'true'
 then raise exception 'Name, phone, whole UGX amount, term, purpose and consent are required.';end if;
end$$;
create function public.staff_application(p_key uuid,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.applications;
begin
 perform lending_private.require_role(array['admin','loan_officer']);perform lending_private.validate_application(p_data);
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into a from public.applications where request_key=p_key;
 if found then
  if a.name<>trim(p_data->>'name') or a.phone<>p_data->>'phone' or a.amount<>(p_data->>'amount')::bigint or a.months<>(p_data->>'months')::int or a.purpose<>trim(p_data->>'purpose') then raise exception 'Retry key already used for a different application.';end if;return to_jsonb(a);
 end if;
 insert into public.applications(request_key,name,phone,amount,months,purpose,address,consent_at,source)
 values(p_key,trim(p_data->>'name'),p_data->>'phone',(p_data->>'amount')::bigint,(p_data->>'months')::int,trim(p_data->>'purpose'),coalesce(p_data->>'address',''),now(),'staff') returning * into a;
 perform lending_private.audit('application_created',a.id::text);return to_jsonb(a);
end$$;
-- Only the protected intake Edge Function's server credential may call this.
create function public.website_application(p_key uuid,p_data jsonb,p_ip_hash text) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.applications; attempts int;
begin
 perform lending_private.validate_application(p_data);
 if p_ip_hash is null or length(p_ip_hash)<>64 then raise exception 'Invalid intake request.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into a from public.applications where request_key=p_key;
 if found then
  if a.source<>'website' or a.name<>trim(p_data->>'name') or a.phone<>p_data->>'phone' or a.amount<>(p_data->>'amount')::bigint or a.months<>(p_data->>'months')::int or a.purpose<>trim(p_data->>'purpose') then raise exception 'Retry key already used.';end if;
  return jsonb_build_object('reference',a.reference);
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_ip_hash,1));
 delete from lending_private.intake_attempts where created_at<now()-interval '1 day';
 select count(*) into attempts from lending_private.intake_attempts where ip_hash=p_ip_hash and created_at>now()-interval '1 hour';
 if attempts>=5 then raise exception 'Too many requests. Please call Fodman for help.';end if;
 insert into lending_private.intake_attempts(ip_hash) values(p_ip_hash);
 insert into public.applications(request_key,name,phone,amount,months,purpose,consent_at,source)
 values(p_key,trim(p_data->>'name'),p_data->>'phone',(p_data->>'amount')::bigint,(p_data->>'months')::int,trim(p_data->>'purpose'),now(),'website') returning * into a;
 perform lending_private.audit('website_application_created',a.id::text);return jsonb_build_object('reference',a.reference);
end$$;
create function public.review_application(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.applications;
begin
 perform lending_private.require_role(array['admin','loan_officer']);select * into strict a from public.applications where id=p_id for update;
 if a.status not in ('New','Under review') then raise exception 'Application is already decided.';end if;
 update public.applications set status='Under review',reviewed_by=auth.uid() where id=p_id returning * into a;
 perform lending_private.audit('application_reviewed',a.id::text);return to_jsonb(a);
end$$;
create function public.decide_application(p_id uuid,p_approve boolean,p_principal bigint,p_rate_bps int,p_months int,p_note text) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.applications; s public.lending_settings;
begin
 perform lending_private.require_role(array['admin']);select * into strict a from public.applications where id=p_id for update;
 if a.status not in ('New','Under review') then raise exception 'Application is already decided.';end if;
 select * into strict s from public.lending_settings where id;
 if length(trim(coalesce(p_note,'')))<5 or length(p_note)>2000 then raise exception 'Add a decision note (5–2000 characters).';end if;
 if p_approve then
  if not s.terms_ready then raise exception 'Confirm lending terms in Settings before approving.';end if;
  if p_principal is null or p_rate_bps is null or p_months is null or p_principal not between s.min_amount and s.max_amount or p_rate_bps not between 0 and 10000 or p_months not between 1 and s.max_months then raise exception 'Loan terms are outside configured limits.';end if;
  if s.two_person and (a.reviewed_by is null or a.reviewed_by=auth.uid()) then raise exception 'A different staff member must review this application first.';end if;
 end if;
 update public.applications set status=case when p_approve then 'Approved' else 'Rejected' end,
 approved_by=auth.uid(),approved_at=now(),approved_principal=case when p_approve then p_principal end,
 approved_rate_bps=case when p_approve then p_rate_bps end,approved_months=case when p_approve then p_months end,decision_note=trim(p_note)
 where id=p_id returning * into a;
 perform lending_private.audit(case when p_approve then 'application_approved' else 'application_rejected' end,a.id::text,jsonb_build_object('note',p_note,'principal',p_principal,'monthly_rate_bps',p_rate_bps,'months',p_months));return to_jsonb(a);
end$$;
create function public.disburse_application(p_id uuid,p_date date,p_method text,p_ref text,p_agreement boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.applications; l public.loans; b public.borrowers;
begin
 perform lending_private.require_role(array['admin']);select * into strict a from public.applications where id=p_id for update;
 select * into l from public.loans where application_id=p_id;
 if found then
  if l.disbursed_on<>p_date or l.disbursement_method<>p_method or l.disbursement_ref<>trim(coalesce(p_ref,'')) then raise exception 'This application already has a loan with different disbursement details.';end if;return to_jsonb(l);
 end if;
 if a.status<>'Approved' then raise exception 'Approve this application first.';end if;
 if p_agreement is distinct from true then raise exception 'Confirm signed agreement and funds sent.';end if;
 if p_date is null or p_date<(a.approved_at at time zone 'Africa/Kampala')::date or p_date>lending_private.business_date() then raise exception 'Disbursement date must be between approval and today.';end if;
 if p_method is null or p_method not in ('Cash','MoMo','Bank') or length(coalesce(p_ref,''))>120 or (p_method<>'Cash' and length(trim(coalesce(p_ref,'')))<3) then raise exception 'Choose a method and transaction reference.';end if;
 perform pg_advisory_xact_lock(hashtextextended(a.phone,2));select * into b from public.borrowers where phone=a.phone;
 if found then
  if lower(trim(b.name))<>lower(trim(a.name)) then raise exception 'This phone belongs to a borrower with a different name. Verify the application before proceeding.';end if;
 else insert into public.borrowers(name,phone,address) values(a.name,a.phone,a.address) returning * into b;end if;
 insert into public.loans(application_id,borrower_id,principal,rate_bps,months,disbursed_on,disbursement_method,disbursement_ref,schedule,created_by)
 values(a.id,b.id,a.approved_principal,a.approved_rate_bps,a.approved_months,p_date,p_method,trim(coalesce(p_ref,'')),lending_private.make_schedule(a.approved_principal,a.approved_rate_bps,a.approved_months,p_date),auth.uid()) returning * into l;
 update public.applications set status='Disbursed' where id=a.id;
 perform lending_private.audit('loan_disbursed',l.id::text,jsonb_build_object('principal',l.principal,'application',a.reference));return to_jsonb(l);
end$$;
create function public.record_payment(p_key uuid,p_loan uuid,p_amount bigint,p_date date,p_method text,p_ref text) returns jsonb language plpgsql security definer set search_path='' as $$
declare l public.loans; pay public.payments; rows jsonb;
begin
 perform lending_private.require_role(array['admin','cashier']);
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,3));
 select * into pay from public.payments where request_key=p_key;
 if found then
  if pay.loan_id<>p_loan or pay.amount<>p_amount or pay.paid_on<>p_date or pay.method<>p_method or pay.external_ref<>trim(coalesce(p_ref,'')) then raise exception 'Retry key already used for a different payment.';end if;return to_jsonb(pay);
 end if;
 select * into strict l from public.loans where id=p_loan for update;
 if p_amount is null or p_amount<=0 or p_amount>100000000000 then raise exception 'Enter a positive whole UGX amount.';end if;
 if p_date is null or p_date<l.disbursed_on or p_date>lending_private.business_date() then raise exception 'Payment date must be between disbursement and today.';end if;
 if p_method is null or p_method not in ('Cash','MoMo','Bank') or length(coalesce(p_ref,''))>120 or (p_method<>'Cash' and length(trim(coalesce(p_ref,'')))<3) then raise exception 'Choose a method and transaction reference.';end if;
 rows:=lending_private.allocate(l.schedule,p_amount);
 insert into public.payments(request_key,loan_id,amount,paid_on,method,external_ref,recorded_by) values(p_key,p_loan,p_amount,p_date,p_method,trim(coalesce(p_ref,'')),auth.uid()) returning * into pay;
 update public.loans set schedule=rows where id=l.id;
 perform lending_private.audit('payment_recorded',pay.id::text,jsonb_build_object('loan',l.reference,'amount',p_amount,'method',p_method));return to_jsonb(pay);
end$$;
create function public.reverse_payment(p_id uuid,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$
declare pay public.payments; l public.loans; amount bigint; rows jsonb;
begin
 perform lending_private.require_role(array['admin']);
 if length(trim(coalesce(p_reason,'')))<8 or length(p_reason)>2000 then raise exception 'Explain why this payment is being reversed (8–2000 characters).';end if;
 select * into strict pay from public.payments where id=p_id;
 select * into strict l from public.loans where id=pay.loan_id for update;
 select * into strict pay from public.payments where id=p_id for update;
 if pay.voided_at is not null then return to_jsonb(pay);end if;
 update public.payments set voided_at=now(),voided_by=auth.uid(),void_reason=trim(p_reason) where id=p_id returning * into pay;
 select coalesce(sum(p.amount),0) into amount from public.payments p where loan_id=l.id and voided_at is null;
 select jsonb_agg(jsonb_set(v,'{paid}','0'::jsonb) order by (v->>'n')::int) into rows from jsonb_array_elements(l.schedule) v;
 update public.loans set schedule=lending_private.allocate(rows,amount) where id=l.id;
 perform lending_private.audit('payment_reversed',pay.id::text,jsonb_build_object('reason',p_reason,'amount',pay.amount));return to_jsonb(pay);
end$$;
create function public.save_lending_settings(p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.lending_settings;
begin
 perform lending_private.require_role(array['admin']);
 if p_data is null or coalesce(p_data->>'terms_ready','false')<>'true' or length(trim(coalesce(p_data->>'company',''))) not between 2 and 160 then raise exception 'Confirm the approved lending terms and company name.';end if;
 if (p_data->>'two_person')::boolean and (select count(*) from public.staff_profiles where active and role in ('admin','loan_officer'))<2 then raise exception 'Add a second reviewer before enabling two-person approval.';end if;
 update public.lending_settings set company=trim(p_data->>'company'),min_amount=(p_data->>'min_amount')::bigint,max_amount=(p_data->>'max_amount')::bigint,
 rate_bps=(p_data->>'rate_bps')::int,max_months=(p_data->>'max_months')::int,terms_ready=true,two_person=coalesce((p_data->>'two_person')::boolean,false),updated_at=now() where id returning * into s;
 perform lending_private.audit('settings_updated','settings',p_data);return to_jsonb(s);
end$$;
create function public.manage_staff(p_user uuid,p_role text,p_active boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare staff public.staff_profiles;
begin
 perform lending_private.require_role(array['admin']);
 if p_role is null or p_role not in ('admin','loan_officer','cashier','viewer') or p_active is null then raise exception 'Choose a valid role and account state.';end if;
 if p_user=auth.uid() and (p_role<>'admin' or not p_active) then raise exception 'You cannot remove your own administrator access.';end if;
 if (select two_person from public.lending_settings where id) and (not p_active or p_role not in ('admin','loan_officer'))
 and (select count(*) from public.staff_profiles where active and role in ('admin','loan_officer') and user_id<>p_user)<2 then raise exception 'Disable two-person approval before removing this reviewer.';end if;
 update public.staff_profiles set role=p_role,active=p_active where user_id=p_user returning * into staff;
 if not found then raise exception 'Staff member not found.';end if;
 perform lending_private.audit('staff_updated',p_user::text,jsonb_build_object('role',p_role,'active',p_active));return to_jsonb(staff);
end$$;
-- Authenticated caller must be an administrator, even when invoked by Edge Function.
create function public.register_staff(p_user uuid,p_name text,p_role text) returns jsonb language plpgsql security definer set search_path='' as $$
declare staff public.staff_profiles;
begin
 perform lending_private.require_role(array['admin']);
 if length(trim(coalesce(p_name,''))) not between 1 and 120 or p_role is null or p_role not in ('admin','loan_officer','cashier','viewer') then raise exception 'Enter a name and valid role.';end if;
 insert into public.staff_profiles(user_id,name,role) values(p_user,trim(p_name),p_role) on conflict(user_id) do nothing returning * into staff;
 if staff.user_id is null then raise exception 'This user already has staff access. Use Manage staff.';end if;
 perform lending_private.audit('staff_added',p_user::text,jsonb_build_object('name',p_name,'role',p_role));return to_jsonb(staff);
end$$;
create function public.lending_snapshot() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; is_admin boolean;
begin
 perform lending_private.require_role(array['admin','loan_officer','cashier','viewer']);is_admin:=lending_private.staff_role()='admin';
 select jsonb_build_object(
 'profile',(select to_jsonb(s) from public.staff_profiles s where user_id=auth.uid()),
 'settings',(select to_jsonb(s)-'id' from public.lending_settings s where id),
 'staff',(select coalesce(jsonb_agg(to_jsonb(s)||jsonb_build_object('email',u.email) order by s.created_at),'[]') from public.staff_profiles s join auth.users u on u.id=s.user_id where is_admin or s.user_id=auth.uid()),
 'applications',(select coalesce(jsonb_agg(a order by a.created_at desc),'[]') from public.applications a),
 'borrowers',(select coalesce(jsonb_agg(b order by b.created_at desc),'[]') from public.borrowers b),
 'loans',(select coalesce(jsonb_agg(l order by l.created_at desc),'[]') from public.loans l),
 'payments',(select coalesce(jsonb_agg(p order by p.created_at desc),'[]') from public.payments p),
 'audit',(select coalesce(jsonb_agg(log order by log.created_at desc),'[]') from (select * from public.lending_audit where is_admin order by created_at desc limit 100) log),
 'server_time',now()) into result;return result;
end$$;

-- Read-only table grants. Mutations go through role-checked, atomic functions.
alter table public.staff_profiles enable row level security;
alter table public.lending_settings enable row level security;
alter table public.applications enable row level security;
alter table public.borrowers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;
alter table public.lending_audit enable row level security;
alter table lending_private.intake_attempts enable row level security;
revoke all on public.staff_profiles,public.lending_settings,public.applications,public.borrowers,public.loans,public.payments,public.lending_audit from public,anon,authenticated;
grant select on public.staff_profiles,public.lending_settings,public.applications,public.borrowers,public.loans,public.payments,public.lending_audit to authenticated;
grant select on public.staff_profiles to service_role;
grant usage on schema lending_private to authenticated;
create policy staff_read on public.staff_profiles for select to authenticated using((select lending_private.staff_role())='admin' or (user_id=(select auth.uid()) and active));
create policy settings_read on public.lending_settings for select to authenticated using((select lending_private.staff_role()) is not null);
create policy applications_read on public.applications for select to authenticated using((select lending_private.staff_role()) is not null);
create policy borrowers_read on public.borrowers for select to authenticated using((select lending_private.staff_role()) is not null);
create policy loans_read on public.loans for select to authenticated using((select lending_private.staff_role()) is not null);
create policy payments_read on public.payments for select to authenticated using((select lending_private.staff_role()) is not null);
create policy audit_read on public.lending_audit for select to authenticated using((select lending_private.staff_role())='admin');
revoke all on all functions in schema lending_private from public,anon,authenticated;
grant execute on function lending_private.staff_role() to authenticated;
revoke all on function public.website_application(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.website_application(uuid,jsonb,text) to service_role;
revoke all on function public.staff_application(uuid,jsonb),public.review_application(uuid),public.decide_application(uuid,boolean,bigint,int,int,text),public.disburse_application(uuid,date,text,text,boolean),public.record_payment(uuid,uuid,bigint,date,text,text),public.reverse_payment(uuid,text),public.save_lending_settings(jsonb),public.manage_staff(uuid,text,boolean),public.register_staff(uuid,text,text),public.lending_snapshot() from public,anon,authenticated;
grant execute on function public.staff_application(uuid,jsonb),public.review_application(uuid),public.decide_application(uuid,boolean,bigint,int,int,text),public.disburse_application(uuid,date,text,text,boolean),public.record_payment(uuid,uuid,bigint,date,text,text),public.reverse_payment(uuid,text),public.save_lending_settings(jsonb),public.manage_staff(uuid,text,boolean),public.register_staff(uuid,text,text),public.lending_snapshot() to authenticated;
commit;
