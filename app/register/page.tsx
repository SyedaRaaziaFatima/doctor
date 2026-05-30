import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPath } from "@/lib/auth";
import { signUpAction } from "@/lib/actions/auth";
import { Card, Container, Field, SubmitButton } from "@/components/ui";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const params = await searchParams;

  if (profile) {
    redirect(dashboardPath(profile.role));
  }

  return (
    <main className="py-16">
      <Container className="max-w-2xl">
        <Card>
          <h1 className="text-3xl font-bold text-slate-950">Create Account</h1>
          <p className="mt-2 text-slate-600">Patients and doctors can register directly. Assistants and admins are created by admin users.</p>
          {params.message ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{params.message}</p>
          ) : null}
          <form action={signUpAction} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full name" name="fullName" required />
              <Field label="Phone" name="phone" />
            </div>
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Account type
              <select name="role" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 focus:ring-4">
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </label>
            <SubmitButton>Create Account</SubmitButton>
          </form>
        </Card>
      </Container>
    </main>
  );
}
