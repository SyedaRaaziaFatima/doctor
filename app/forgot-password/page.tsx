import { headers } from "next/headers";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Card, Container, Field, SubmitButton } from "@/components/ui";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "";

  return (
    <main className="py-16">
      <Container className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold text-slate-950">Reset Password</h1>
          <p className="mt-2 text-slate-600">Enter your email and Supabase will send a password reset link.</p>
          {params.message ? (
            <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{params.message}</p>
          ) : null}
          <form action={resetPasswordAction} className="mt-8 grid gap-5">
            <input type="hidden" name="origin" value={origin} />
            <Field label="Email" name="email" type="email" required />
            <SubmitButton>Send Reset Link</SubmitButton>
          </form>
        </Card>
      </Container>
    </main>
  );
}
