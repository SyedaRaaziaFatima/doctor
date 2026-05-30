"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dashboardPath } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const allowedSelfRegisterRoles: UserRole[] = ["patient", "doctor"];

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/register?message=Supabase is not configured");

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "patient") as UserRole;

  if (!allowedSelfRegisterRoles.includes(role)) {
    redirect("/register?message=Only patients and doctors can self register");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role
      }
    }
  });

  if (error || !data.user) {
    redirect(`/register?message=${encodeURIComponent(error?.message || "Sign up failed")}`);
  }

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      redirect(
        `/register?message=${encodeURIComponent(
          "Registration is blocked by Supabase email confirmation. In Supabase, go to Authentication > Sign In / Providers > Email and turn off Confirm email."
        )}`
      );
    }
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    email,
    phone,
    role
  });

  if (role === "patient") {
    await supabase.from("patients").upsert({ user_id: data.user.id });
  }

  if (role === "doctor") {
    await supabase.from("doctors").upsert({
      user_id: data.user.id,
      specialization: "General Physician",
      treatment_type: "allopathic",
      diseases: ["General illness"],
      city: "Not set",
      experience_years: 0,
      consultation_fee: 0
    });
  }

  redirect(dashboardPath(role));
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?message=Supabase is not configured");

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single<{ role: UserRole }>();

  redirect(dashboardPath(profile?.role));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/forgot-password?message=Supabase is not configured");

  const email = String(formData.get("email") || "").trim();
  const origin = String(formData.get("origin") || "");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`
  });

  if (error) {
    redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?message=Password reset email sent");
}
