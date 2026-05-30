import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { user: null, profile: null, configured: false };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, configured: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, configured: true };
}

export async function requireRole(roles: UserRole[]) {
  const { user, profile, configured } = await getCurrentProfile();

  if (!configured) {
    return { user: null, profile: null, configured };
  }

  if (!user || !profile) {
    redirect("/login");
  }

  if (!roles.includes(profile.role)) {
    redirect(`/dashboard/${profile.role}`);
  }

  return { user, profile, configured };
}

export function dashboardPath(role?: UserRole | null) {
  switch (role) {
    case "patient":
      return "/dashboard/patient";
    case "doctor":
      return "/dashboard/doctor";
    case "assistant":
      return "/dashboard/assistant";
    case "admin":
    case "super_admin":
      return "/dashboard/admin";
    default:
      return "/login";
  }
}
