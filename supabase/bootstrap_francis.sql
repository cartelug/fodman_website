-- Run once, privately, after Francis's verified Auth account exists.
-- Replace the placeholder locally. Do not commit his email or credentials.
begin;
do $$
declare account uuid; email_to_register text:='FRANCIS_LOGIN_EMAIL';
begin
 if email_to_register='FRANCIS_LOGIN_EMAIL' then raise exception 'Set Francis''s verified login email first.';end if;
 if exists(select 1 from public.staff_profiles) then raise exception 'Staff access already exists. Use the administrator account to add users.';end if;
 select id into strict account from auth.users where lower(email)=lower(email_to_register) and email_confirmed_at is not null;
 insert into public.staff_profiles(user_id,name,role) values(account,'Francis','admin');
 insert into public.lending_audit(actor_id,action,entity_id,detail) values(account,'administrator_bootstrapped',account::text,'{"name":"Francis"}');
end$$;
commit;
