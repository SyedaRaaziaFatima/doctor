import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { ButtonLink, Container } from "@/components/ui";
import { formatRole } from "@/lib/utils";

export async function SiteNav() {
  const { profile } = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-slate-900">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white">
            <HeartPulse size={24} />
          </span>
          <span>Doctor Hub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/doctors">Find Doctors</Link>
          <Link href="/#workflow">Workflow</Link>
          <Link href="/#features">Features</Link>
        </nav>
        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <Link href={`/dashboard/${profile.role === "super_admin" ? "admin" : profile.role}`} className="hidden text-sm font-semibold text-slate-700 sm:inline">
                {formatRole(profile.role)}
              </Link>
              <form action={signOutAction}>
                <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-700">
                Login
              </Link>
              <ButtonLink href="/register">Register</ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
