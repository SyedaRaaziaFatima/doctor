<img width="1366" height="768" alt="1" src="https://github.com/user-attachments/assets/f0458458-8cea-46a4-a29d-cf107f96ebd4" />
<img width="1366" height="768" alt="12" src="https://github.com/user-attachments/assets/d9965b15-d80c-439c-838c-bdfcc1fab73b" />
<img width="1366" height="768" alt="2" src="https://github.com/user-attachments/assets/fe354fbb-07a8-416a-8366-24db79b8b2a7" />
<img width="1366" height="768" alt="3" src="https://github.com/user-attachments/assets/9e9eb021-0e1c-4a6b-b736-e77086e43ec4" />
<img width="1366" height="768" alt="4" src="https://github.com/user-attachments/assets/29ca6c30-b9e9-40fa-b68a-92af0739a826" />
<img width="1366" height="768" alt="5" src="https://github.com/user-attachments/assets/b7c2a5d1-ecbd-474f-932a-acbf2c369280" />
<img width="1366" height="768" alt="6" src="https://github.com/user-attachments/assets/929418b4-dc1d-4a4d-8f7c-dc751485454b" />
<img width="1366" height="768" alt="9" src="https://github.com/user-attachments/assets/461a1b83-a4b9-46b8-9029-a21a6e061844" />
<img width="1366" height="768" alt="10" src="https://github.com/user-attachments/assets/66d38578-ff8b-455e-a94a-ece8dc754932" />
<img width="1366" height="768" alt="10" src="https://github.com/user-attachments/assets/9e6bcb1e-fce9-40a5-992c-24228e2527c2" />





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

3. Disable email confirmation in Supabase:

```text
Authentication > Sign In / Providers > Email > Confirm email = off
```

This project is configured for immediate registration/login and does not require email verification.

4. In Supabase SQL Editor, run:

```text
supabase/schema.sql
supabase/policies.sql
```

5. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

6. Start the app:

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
