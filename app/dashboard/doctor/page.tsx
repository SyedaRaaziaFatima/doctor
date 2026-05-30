import { addPrescriptionAction, saveDoctorProfileAction } from "@/lib/actions/workflow";
import { requireRole } from "@/lib/auth";
import { getDoctorDashboard } from "@/lib/data";
import { Badge, Card, Field, SubmitButton, TextArea } from "@/components/ui";
import { DashboardShell, StatCard } from "@/components/dashboard";

type Row = Record<string, string | number | null | Record<string, unknown>>;

export default async function DoctorDashboardPage() {
  const { user, profile } = await requireRole(["doctor"]);
  if (!user || !profile) return null;

  const data = await getDoctorDashboard(user.id);
  const doctor = data.doctor as Row | null;
  const appointments = data.appointments as Row[];
  const prescriptions = data.prescriptions as Row[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard label="Appointments" value={appointments.length} />
        <StatCard label="Prescriptions" value={prescriptions.length} />
        <StatCard label="Fee" value={`Rs. ${doctor?.consultation_fee || 0}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Doctor Profile and Clinic</h2>
          <form action={saveDoctorProfileAction} className="mt-5 grid gap-4">
            <Field label="Specialization" name="specialization" required defaultValue={String(doctor?.specialization || "General Physician")} />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Treatment type
              <select name="treatmentType" defaultValue={String(doctor?.treatment_type || "allopathic")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 focus:ring-4">
                <option value="allopathic">Allopathic</option>
                <option value="homeopathic">Homeopathic</option>
                <option value="herbal">Herbal</option>
              </select>
            </label>
            <Field label="Diseases handled" name="diseases" required placeholder="Fever, Diabetes, Skin Allergy" defaultValue={Array.isArray(doctor?.diseases) ? (doctor?.diseases as string[]).join(", ") : ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" required defaultValue={String(doctor?.city || "")} />
              <Field label="Experience years" name="experienceYears" type="number" defaultValue={Number(doctor?.experience_years || 0)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Consultation fee" name="consultationFee" type="number" defaultValue={Number(doctor?.consultation_fee || 0)} />
              <Field label="Clinic name" name="clinicName" placeholder="Main Clinic" />
            </div>
            <Field label="Clinic address" name="clinicAddress" />
            <TextArea label="Bio" name="bio" defaultValue={String(doctor?.bio || "")} />
            <SubmitButton>Save Profile</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-950">Appointments and Prescriptions</h2>
          <div className="mt-5 grid gap-5">
            {appointments.map((appointment) => {
              const patient = appointment.profiles as { full_name?: string; email?: string } | undefined;
              return (
                <div key={String(appointment.id)} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{patient?.full_name || "Patient"}</p>
                      <p className="text-sm text-slate-600">{String(appointment.reason)}</p>
                    </div>
                    <Badge tone={appointment.status === "confirmed" ? "teal" : "amber"}>{String(appointment.status)}</Badge>
                  </div>
                  <form action={addPrescriptionAction} className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4">
                    <input type="hidden" name="appointmentId" value={String(appointment.id)} />
                    <input type="hidden" name="patientId" value={String(appointment.patient_id)} />
                    <Field label="Diagnosis" name="diagnosis" required />
                    <TextArea label="Medicines" name="medicines" required placeholder="Medicine name, dose, timing" />
                    <TextArea label="Notes" name="notes" placeholder="Advice or follow-up" />
                    <SubmitButton>Add Prescription</SubmitButton>
                  </form>
                </div>
              );
            })}
            {appointments.length === 0 ? <p className="text-sm text-slate-600">No appointments yet.</p> : null}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
