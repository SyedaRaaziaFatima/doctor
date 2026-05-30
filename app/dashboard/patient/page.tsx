import Link from "next/link";
import { addMedicalHistoryAction, uploadReportAction } from "@/lib/actions/workflow";
import { requireRole } from "@/lib/auth";
import { getPatientDashboard } from "@/lib/data";
import { Badge, Card, Field, TextArea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DashboardShell, EmptyState, StatCard } from "@/components/dashboard";

type Row = Record<string, string | number | null | Record<string, unknown> | Array<Record<string, unknown>>>;

export default async function PatientDashboardPage() {
  const { user, profile } = await requireRole(["patient"]);
  if (!user || !profile) return null;

  const data = await getPatientDashboard(user.id);
  const appointments = data.appointments as Row[];
  const prescriptions = data.prescriptions as Row[];
  const history = data.history as Row[];
  const reports = data.reports as Row[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <StatCard label="Appointments" value={appointments.length} />
        <StatCard label="Doctor Responses" value={prescriptions.length} />
        <StatCard label="History Records" value={history.length} />
        <StatCard label="Reports" value={reports.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Doctor Response</h2>
                <p className="mt-1 text-sm text-slate-600">Prescriptions and advice from your doctors.</p>
              </div>
              <Badge tone={prescriptions.length > 0 ? "teal" : "amber"}>
                {prescriptions.length > 0 ? `${prescriptions.length} response(s)` : "Waiting"}
              </Badge>
            </div>

            <div className="grid gap-4">
              {prescriptions.map((item) => {
                const doctorProfile = item.doctor_profile as { full_name?: string } | null;
                const appointment = item.appointment as {
                  reason?: string;
                  appointment_date?: string;
                  appointment_time?: string;
                } | null;

                return (
                  <div key={String(item.id)} className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-teal-700">
                          Dr. {String(doctorProfile?.full_name || "Doctor")}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-slate-950">{String(item.diagnosis)}</h3>
                        {appointment ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {String(appointment.reason || "Consultation")} | {String(appointment.appointment_date || "")}{" "}
                            {String(appointment.appointment_time || "")}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone="teal">Prescription</Badge>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-bold text-slate-950">Medicines</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{String(item.medicines)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-bold text-slate-950">Doctor Notes</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {String(item.notes || "No extra notes added.")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {prescriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <h3 className="font-bold text-slate-950">No doctor response yet</h3>
                  <p className="mt-2 text-sm text-slate-600">When your doctor writes a prescription, it will appear here.</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">My Appointments</h2>
              <Link href="/doctors" className="text-sm font-semibold text-teal-700">Book New</Link>
            </div>
            <div className="grid gap-4">
              {appointments.length === 0 ? (
                <EmptyState title="No appointments yet" text="Find a doctor and book your first consultation." />
              ) : (
                appointments.map((appointment) => (
                  <Link key={String(appointment.id)} href={`/appointments/${appointment.id}`} className="rounded-2xl border border-slate-200 p-4 transition hover:border-teal-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{String(appointment.reason || "Consultation")}</p>
                      <Badge tone={appointment.status === "confirmed" ? "teal" : "amber"}>{String(appointment.status)}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{String(appointment.appointment_date)} at {String(appointment.appointment_time)}</p>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">Add Medical History</h2>
            <form action={addMedicalHistoryAction} className="mt-5 grid gap-4">
              <Field label="Title" name="title" required placeholder="Diabetes, allergy, surgery..." />
              <TextArea label="Details" name="details" required />
              <SubmitButton>Save History</SubmitButton>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Upload Report</h2>
            <form action={uploadReportAction} className="mt-5 grid gap-4">
              <Field label="Report title" name="title" placeholder="Blood test" />
              <input name="reportFile" type="file" required className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
              <SubmitButton>Upload Report</SubmitButton>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">History and Reports</h2>
            <div className="mt-5 grid gap-4">
              {[...history, ...reports].map((item) => (
                <div key={String(item.id)} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{String(item.title)}</p>
                  <p className="mt-2 text-sm text-slate-600">{String(item.details || item.file_path || "")}</p>
                </div>
              ))}
              {history.length + reports.length === 0 ? <p className="text-sm text-slate-600">No medical records yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
