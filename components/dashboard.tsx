import Link from "next/link";
import type { ReactNode } from "react";
import { Card, Container } from "@/components/ui";
import { formatRole } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const roleLinks = {
  patient: [
    ["Dashboard", "/dashboard/patient"],
    ["Find Doctors", "/doctors"]
  ],
  doctor: [["Dashboard", "/dashboard/doctor"]],
  assistant: [["Dashboard", "/dashboard/assistant"]],
  admin: [["Dashboard", "/dashboard/admin"]],
  super_admin: [["Dashboard", "/dashboard/admin"]]
};

export function DashboardShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  return (
    <main className="py-10">
      <Container>
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">{formatRole(profile.role)}</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {profile.full_name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {roleLinks[profile.role].map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                {label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </Container>
    </main>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="text-center">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </Card>
  );
}

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}
