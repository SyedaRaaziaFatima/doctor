import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPath } from "@/lib/auth";
import { signInAction } from "@/lib/actions/auth";
import { Card, Container, Field, SubmitButton } from "@/components/ui";

export default async function LoginPage({
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
      <Container className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold text-slate-950">Login</h1>
          <p className="mt-2 text-slate-600">Access your Doctor Hub dashboard.</p>
          {params.message ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{params.message}</p>
          ) : null}
          <form action={signInAction} className="mt-8 grid gap-5">
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <SubmitButton>Login</SubmitButton>
          </form>
          <div className="mt-6 flex justify-between text-sm text-slate-600">
            <Link href="/forgot-password" className="font-semibold text-teal-700">
              Forgot password?
            </Link>
            <Link href="/register" className="font-semibold text-teal-700">
              Create account
            </Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
