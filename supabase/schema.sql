create extension if not exists "pgcrypto";

create type public.user_role as enum ('patient', 'doctor', 'assistant', 'admin', 'super_admin');
create type public.treatment_type as enum ('allopathic', 'homeopathic', 'herbal');
create type public.appointment_status as enum ('pending_payment', 'payment_uploaded', 'confirmed', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  gender text,
  blood_group text,
  address text,
  created_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  specialization text not null,
  treatment_type public.treatment_type not null default 'allopathic',
  diseases text[] not null default '{}',
  city text not null,
  experience_years integer not null default 0,
  consultation_fee numeric(10,2) not null default 0,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  address text not null,
  fee numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week text not null,
  starts_at time not null,
  ends_at time not null,
  created_at timestamptz not null default now()
);

create table public.assistants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, doctor_id)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  reason text not null,
  status public.appointment_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  proof_path text not null,
  amount numeric(10,2) not null default 0,
  status public.payment_status not null default 'pending',
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.medical_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  details text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  diagnosis text not null,
  medicines text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index doctors_diseases_idx on public.doctors using gin (diseases);
create index doctors_treatment_city_idx on public.doctors (treatment_type, city);
create index appointments_patient_idx on public.appointments (patient_id, created_at desc);
create index appointments_doctor_idx on public.appointments (doctor_id, created_at desc);
create index payments_status_idx on public.payments (status);

insert into storage.buckets (id, name, public)
values
  ('payment-proofs', 'payment-proofs', false),
  ('medical-reports', 'medical-reports', false)
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.block_immutable_records()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Medical history and prescriptions are immutable';
end;
$$;

create trigger prevent_medical_history_update_delete
before update or delete on public.medical_history
for each row execute function public.block_immutable_records();

create trigger prevent_prescriptions_update_delete
before update or delete on public.prescriptions
for each row execute function public.block_immutable_records();
