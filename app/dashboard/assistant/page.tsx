import { verifyPaymentAction } from "@/lib/actions/workflow";
import { requireRole } from "@/lib/auth";
import { getAssistantDashboard } from "@/lib/data";
import { Badge, Card } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DashboardShell, StatCard } from "@/components/dashboard";

type PaymentRow = {
  id: string;
  appointment_id: string;
  amount: number;
  proof_path: string;
  status: string;
  appointments?: {
    reason?: string;
    appointment_date?: string;
    appointment_time?: string;
    doctors?: { profiles?: { full_name?: string } };
    profiles?: { full_name?: string; email?: string };
  };
};

export default async function AssistantDashboardPage() {
  const { user, profile } = await requireRole(["assistant"]);
  if (!user || !profile) return null;

  const data = await getAssistantDashboard(user.id);
  const payments = data.payments as PaymentRow[];
  const pending = payments.filter((payment) => payment.status === "pending");

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard label="Payments" value={payments.length} />
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Verified" value={payments.length - pending.length} />
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-slate-950">Payment Verification</h2>
        <div className="mt-6 grid gap-5">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{payment.appointments?.profiles?.full_name || "Patient"}</p>
                  <p className="mt-1 text-sm text-slate-600">{payment.appointments?.reason}</p>
                  <p className="mt-1 text-sm text-slate-600">Amount: Rs. {payment.amount}</p>
                  <p className="mt-1 text-xs text-slate-500">Proof: {payment.proof_path}</p>
                </div>
                <Badge tone={payment.status === "approved" ? "teal" : payment.status === "rejected" ? "red" : "amber"}>{payment.status}</Badge>
              </div>
              {payment.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={verifyPaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="appointmentId" value={payment.appointment_id} />
                    <input type="hidden" name="decision" value="approved" />
                    <SubmitButton>Approve</SubmitButton>
                  </form>
                  <form action={verifyPaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="appointmentId" value={payment.appointment_id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
                      Reject
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
          {payments.length === 0 ? <p className="text-sm text-slate-600">No payments assigned yet.</p> : null}
        </div>
      </Card>
    </DashboardShell>
  );
}
