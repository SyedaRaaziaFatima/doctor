import {
  addPrescriptionAction,
  manageDoctorAppointmentAction,
  saveDoctorProfileAction
} from "@/lib/actions/workflow";
import { requireRole } from "@/lib/auth";
import { getDoctorDashboard } from "@/lib/data";
import { Badge, Card, Field, TextArea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DashboardShell, StatCard } from "@/components/dashboard";

type PaymentProof = {
  id?: string;
  status?: string;
  amount?: number;
  proof_path?: string;
  proof_url?: string | null;
};

type Row = Record<string, string | number | null | Record<string, unknown> | PaymentProof[]>;

export default async function DoctorDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { user, profile } = await requireRole(["doctor"]);
  if (!user || !profile) return null;
  const params = await searchParams;

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
          {params.message ? (
            <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{params.message}</p>
          ) : null}
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
              const payments = (appointment.payments as PaymentProof[] | undefined) || [];
              const latestPayment = payments[0];
              const appointmentStatus = String(appointment.status);
              const isFinalAppointment = ["confirmed", "cancelled", "completed"].includes(appointmentStatus);
              return (
                <div key={String(appointment.id)} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{patient?.full_name || "Patient"}</p>
                      <p className="text-sm text-slate-600">{String(appointment.reason)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {String(appointment.appointment_date || "")} {String(appointment.appointment_time || "")}
                      </p>
                    </div>
                    <Badge tone={appointmentStatus === "confirmed" ? "teal" : appointmentStatus === "cancelled" ? "red" : "amber"}>
                      {appointmentStatus === "confirmed"
                        ? "Confirmed"
                        : appointmentStatus === "cancelled"
                          ? "Rejected"
                          : appointmentStatus}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">Appointment Management</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Payment: {latestPayment?.status || "not uploaded"} | Appointment:{" "}
                          {appointmentStatus === "confirmed"
                            ? "confirmed"
                            : appointmentStatus === "cancelled"
                              ? "rejected"
                              : appointmentStatus}
                        </p>
                      </div>
                      {isFinalAppointment ? (
                        <div
                          className={
                            appointmentStatus === "confirmed"
                              ? "rounded-full bg-teal-100 px-5 py-3 text-sm font-bold text-teal-800 ring-1 ring-teal-200"
                              : "rounded-full bg-red-100 px-5 py-3 text-sm font-bold text-red-800 ring-1 ring-red-200"
                          }
                        >
                          {appointmentStatus === "confirmed" ? "Confirmed" : "Rejected"}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <form action={manageDoctorAppointmentAction}>
                            <input type="hidden" name="appointmentId" value={String(appointment.id)} />
                            <input type="hidden" name="decision" value="confirm" />
                            <SubmitButton loadingText="Confirming...">Confirm</SubmitButton>
                          </form>
                          <form action={manageDoctorAppointmentAction}>
                            <input type="hidden" name="appointmentId" value={String(appointment.id)} />
                            <input type="hidden" name="decision" value="reject" />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                    {appointmentStatus === "confirmed" ? (
                      <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">
                        This appointment has been confirmed. Decision buttons are now hidden.
                      </p>
                    ) : appointmentStatus === "cancelled" ? (
                      <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
                        This appointment has been rejected or cancelled. Decision buttons are now hidden.
                      </p>
                    ) : !latestPayment ? (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        The patient has not uploaded payment proof yet. You can wait for payment before confirming.
                      </p>
                    ) : latestPayment.status !== "approved" ? (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Payment is {latestPayment.status || "pending"}. Review the screenshot before confirming.
                      </p>
                    ) : (
                      <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">
                        Payment is approved. This appointment is ready to confirm.
                      </p>
                    )}
                  </div>

                  {latestPayment ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">Payment Proof</p>
                          <p className="text-sm text-slate-600">
                            Status: {latestPayment.status || "pending"} | Amount: Rs. {latestPayment.amount || 0}
                          </p>
                        </div>
                        {latestPayment.proof_url ? (
                          <a
                            href={latestPayment.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-amber-300 transition hover:bg-amber-400"
                          >
                            Open Full Image
                          </a>
                        ) : null}
                      </div>
                      {latestPayment.proof_url ? (
                        <img
                          src={latestPayment.proof_url}
                          alt="Uploaded payment proof"
                          className="mt-4 max-h-72 w-full rounded-2xl border border-slate-200 object-contain"
                        />
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">Payment proof image is not available yet.</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Patient has not uploaded payment proof yet.
                    </p>
                  )}
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
