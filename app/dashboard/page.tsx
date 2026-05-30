import { redirect } from "next/navigation";
import { dashboardPath, getCurrentProfile } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const { profile } = await getCurrentProfile();
  redirect(dashboardPath(profile?.role));
}
