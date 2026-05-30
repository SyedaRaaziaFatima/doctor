import { requireRole } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/data";
import { assignAssistantAction, updateUserRoleAction } from "@/lib/actions/workflow";
import { Badge, Card, SubmitButton } from "@/components/ui";
import { DashboardShell, StatCard } from "@/components/dashboard";
import { formatRole } from "@/lib/utils";

type Row = Record<string, string | number | null | string[] | Record<string, unknown>>;

export default async function AdminDashboardPage() {
  const { profile } = await requireRole(["admin", "super_admin"]);
  if (!profile) return null;

  const data = await getAdminDashboard();
  const profiles = data.profiles as Row[];
  const doctors = data.doctors as Row[];
  const appointments = data.appointments as Row[];
  const payments = data.payments as Row[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <StatCard label="Users" value={profiles.length} />
        <StatCard label="Doctors" value={doctors.length} />
        <StatCard label="Appointments" value={appointments.length} />
        <StatCard label="Payments" value={payments.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Users</h2>
          <div className="mt-5 grid gap-3">
            {profiles.map((user) => (
              <div key={String(user.id)} className="grid gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{String(user.full_name)}</p>
                  <p className="text-sm text-slate-600">{String(user.email)}</p>
                </div>
                <Badge>{formatRole(String(user.role))}</Badge>
                </div>
                <form action={updateUserRoleAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="userId" value={String(user.id)} />
                  <select name="role" defaultValue={String(user.role)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal-500/20 focus:ring-4">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="assistant">Assistant</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <SubmitButton>Update Role</SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Doctors</h2>
          <div className="mt-5 grid gap-3">
            {doctors.map((doctor) => {
              const profileData = doctor.profiles as { full_name?: string; email?: string } | undefined;
              return (
                <div key={String(doctor.id)} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{profileData?.full_name || "Doctor"}</p>
                      <p className="text-sm text-slate-600">{String(doctor.specialization)} in {String(doctor.city)}</p>
                    </div>
                    <Badge tone="teal">{String(doctor.treatment_type)}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Appointment Status</h2>
          <div className="mt-5 grid gap-3">
            {["pending_payment", "payment_uploaded", "confirmed", "completed", "cancelled"].map((status) => (
              <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">{status}</span>
                <span className="text-2xl font-bold text-slate-950">{appointments.filter((item) => item.status === status).length}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Payment Status</h2>
          <div className="mt-5 grid gap-3">
            {["pending", "approved", "rejected"].map((status) => (
              <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">{status}</span>
                <span className="text-2xl font-bold text-slate-950">{payments.filter((item) => item.status === status).length}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Assign Assistant</h2>
          <p className="mt-2 text-sm text-slate-600">Create a normal user first, then assign that user as a doctor's assistant.</p>
          <form action={assignAssistantAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Assistant user
              <select name="assistantId" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 focus:ring-4">
                {profiles.map((user) => (
                  <option key={String(user.id)} value={String(user.id)}>
                    {String(user.full_name)} - {String(user.email)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Doctor
              <select name="doctorId" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 focus:ring-4">
                {doctors.map((doctor) => {
                  const doctorProfile = doctor.profiles as { full_name?: string } | undefined;
                  return (
                    <option key={String(doctor.user_id)} value={String(doctor.user_id)}>
                      {doctorProfile?.full_name || "Doctor"} - {String(doctor.specialization)}
                    </option>
                  );
                })}
              </select>
            </label>
            <SubmitButton>Assign Assistant</SubmitButton>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
