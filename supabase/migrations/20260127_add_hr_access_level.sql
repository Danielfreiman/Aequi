-- Add access level for HR employees
alter table public.hr_employees
  add column if not exists access_level text not null default 'full' check (access_level in ('full','ponto_only'));

create index if not exists idx_hr_employees_profile_access on public.hr_employees(profile_id, access_level);
