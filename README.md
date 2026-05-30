# Doctor Hub

Doctor Hub is a free full-stack healthcare consultation app built with Next.js, Supabase, and Vercel.

## Features

- Patient and doctor registration.
- Login, logout, and forgot password through Supabase Auth.
- Role dashboards for patient, doctor, assistant, admin, and super admin.
- Doctor search by disease, treatment type, and city.
- Appointment booking with payment proof upload.
- Assistant payment verification.
- Medical history, report uploads, and immutable prescriptions.
- Admin stats, role management, and assistant assignment.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a free Supabase project.

3. In Supabase SQL Editor, run:

```text
supabase/schema.sql
supabase/policies.sql
```

4. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

5. Start the app:

```bash
npm run dev
```

## Create First Admin

Register a normal user in the app, then run this in Supabase SQL Editor:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-email@example.com';
```

After that, the admin dashboard can update user roles and assign assistants.

## Free Deployment

1. Push this project to GitHub.
2. Create a free Vercel account.
3. Import the GitHub repo into Vercel.
4. Add these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

5. Deploy.

The project is designed to work on Vercel free tier and Supabase free tier for a semester project/demo.
