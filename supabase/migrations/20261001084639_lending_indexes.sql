begin;

-- Cover staff and borrower foreign keys without changing lending behaviour.
create index applications_approved_by on public.applications(approved_by);
create index applications_reviewed_by on public.applications(reviewed_by);
create index loans_borrower_id on public.loans(borrower_id);
create index loans_created_by on public.loans(created_by);
create index payments_recorded_by on public.payments(recorded_by);
create index payments_voided_by on public.payments(voided_by);

-- Internal rate-limit events are written only through the protected intake RPC.
alter table lending_private.intake_attempts
 add column id bigint generated always as identity primary key;

commit;
