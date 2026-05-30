alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.clinics enable row level security;
alter table public.doctor_schedules enable row level security;
alter table public.assistants enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.medical_history enable row level security;
alter table public.reports enable row level security;
alter table public.prescriptions enable row level security;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'super_admin')
$$;

create or replace function public.is_assigned_assistant(doctor uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.assistants
    where user_id = auth.uid() and doctor_id = doctor
  )
$$;

create policy "profiles read related"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.appointments
    where (patient_id = auth.uid() and doctor_id = profiles.id)
       or (doctor_id = auth.uid() and patient_id = profiles.id)
  )
);

create policy "profiles update own"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "profiles insert own"
on public.profiles for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

create policy "patients manage own"
on public.patients for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "doctors are public"
on public.doctors for select
to anon, authenticated
using (true);

create policy "doctors manage own"
on public.doctors for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "clinics are public"
on public.clinics for select
to anon, authenticated
using (true);

create policy "clinics manage owner"
on public.clinics for all
to authenticated
using (doctor_id = auth.uid() or public.is_admin())
with check (doctor_id = auth.uid() or public.is_admin());

create policy "schedules are public"
on public.doctor_schedules for select
to anon, authenticated
using (true);

create policy "schedules manage owner"
on public.doctor_schedules for all
to authenticated
using (doctor_id = auth.uid() or public.is_admin())
with check (doctor_id = auth.uid() or public.is_admin());

create policy "assistants read related"
on public.assistants for select
to authenticated
using (user_id = auth.uid() or doctor_id = auth.uid() or public.is_admin());

create policy "assistants admin manage"
on public.assistants for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "appointments read related"
on public.appointments for select
to authenticated
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.is_assigned_assistant(doctor_id)
  or public.is_admin()
);

create policy "patients create appointments"
on public.appointments for insert
to authenticated
with check (patient_id = auth.uid() and public.current_role() = 'patient');

create policy "appointments update workflow"
on public.appointments for update
to authenticated
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.is_assigned_assistant(doctor_id)
  or public.is_admin()
)
with check (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.is_assigned_assistant(doctor_id)
  or public.is_admin()
);

create policy "payments read related"
on public.payments for select
to authenticated
using (
  patient_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.id = payments.appointment_id
      and (a.doctor_id = auth.uid() or public.is_assigned_assistant(a.doctor_id))
  )
  or public.is_admin()
);

create policy "patients upload payments"
on public.payments for insert
to authenticated
with check (patient_id = auth.uid());

create policy "payments update verifier"
on public.payments for update
to authenticated
using (
  exists (
    select 1 from public.appointments a
    where a.id = payments.appointment_id
      and (public.is_assigned_assistant(a.doctor_id) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.appointments a
    where a.id = payments.appointment_id
      and (public.is_assigned_assistant(a.doctor_id) or public.is_admin())
  )
);

create policy "history read related"
on public.medical_history for select
to authenticated
using (
  patient_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.patient_id = medical_history.patient_id
      and (a.doctor_id = auth.uid() or public.is_assigned_assistant(a.doctor_id))
  )
  or public.is_admin()
);

create policy "history append"
on public.medical_history for insert
to authenticated
with check (
  patient_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.patient_id = medical_history.patient_id and a.doctor_id = auth.uid()
  )
  or public.is_admin()
);

create policy "reports read related"
on public.reports for select
to authenticated
using (
  patient_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.patient_id = reports.patient_id and a.doctor_id = auth.uid()
  )
  or public.is_admin()
);

create policy "patients upload reports"
on public.reports for insert
to authenticated
with check (patient_id = auth.uid());

create policy "prescriptions read related"
on public.prescriptions for select
to authenticated
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.is_admin()
);

create policy "doctors append prescriptions"
on public.prescriptions for insert
to authenticated
with check (
  doctor_id = auth.uid()
  and exists (
    select 1 from public.appointments a
    where a.id = prescriptions.appointment_id
      and a.doctor_id = auth.uid()
      and a.patient_id = prescriptions.patient_id
  )
);

create policy "payment proof owner upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "medical report owner upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage read related"
on storage.objects for select
to authenticated
using (
  owner = auth.uid()
  or public.is_admin()
  or bucket_id in ('payment-proofs', 'medical-reports')
);
