import { notFound } from "next/navigation";
import { uploadPaymentAction } from "@/lib/actions/workflow";
import { getCurrentProfile } from "@/lib/auth";
import { getAppointment } from "@/lib/data";
import { Badge, Card, Container, Field, SubmitButton } from "@/components/ui";

type AppointmentDetail = {
  id: string;
  reason: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  doctors?: {
    consultation_fee?: number;
    specialization?: string;
    profiles?: { full_name?: string; email?: string; phone?: string };
  };
  payments?: Array<{ status?: string; amount?: number; proof_path?: string }>;
};

export default async function AppointmentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) notFound();

  const appointment = (await getAppointment(id, user.id)) as AppointmentDetail | null;
  if (!appointment) notFound();

  const latestPayment = appointment.payments?.[0];

  return (
    <main className="py-12">
      <Container className="max-w-4xl">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Appointment Detail</h1>
              <p className="mt-2 text-slate-600">{appointment.reason}</p>
            </div>
            <Badge tone={appointment.status === "confirmed" ? "teal" : "amber"}>{appointment.status}</Badge>
          </div>
          {query.message ? (
            <p className="mt-5 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{query.message}</p>
          ) : null}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Doctor</p>
              <p className="mt-1 font-bold text-slate-950">{appointment.doctors?.profiles?.full_name || "Doctor"}</p>
              <p className="text-sm text-slate-600">{appointment.doctors?.specialization}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Schedule</p>
              <p className="mt-1 font-bold text-slate-950">{appointment.appointment_date}</p>
              <p className="text-sm text-slate-600">{appointment.appointment_time}</p>
            </div>
          </div>

          {profile.role === "patient" && appointment.status !== "confirmed" ? (
            <form action={uploadPaymentAction} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-950">Upload Payment Proof</h2>
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <Field label="Amount" name="amount" type="number" defaultValue={appointment.doctors?.consultation_fee || 0} />
              <input name="paymentProof" type="file" required className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
              <SubmitButton>Submit Payment Proof</SubmitButton>
            </form>
          ) : null}

          {latestPayment ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-950">Payment</h2>
              <p className="mt-2 text-sm text-slate-600">Status: {latestPayment.status}</p>
              <p className="text-sm text-slate-600">Amount: Rs. {latestPayment.amount}</p>
              <p className="text-xs text-slate-500">Proof path: {latestPayment.proof_path}</p>
            </div>
          ) : null}
        </Card>
      </Container>
    </main>
  );
}
