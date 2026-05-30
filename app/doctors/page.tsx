import { Search } from "lucide-react";
import { bookAppointmentAction } from "@/lib/actions/workflow";
import { getCurrentProfile } from "@/lib/auth";
import { getDoctors } from "@/lib/data";
import { Badge, Card, Container, Field, TextArea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

type DoctorRow = {
  user_id: string;
  specialization: string;
  treatment_type: string;
  diseases: string[];
  city: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string | null;
  profiles?: { full_name?: string; phone?: string; email?: string } | null;
};

export default async function DoctorsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; disease?: string; treatment?: string; city?: string; message?: string }>;
}) {
  const params = await searchParams;
  const doctors = (await getDoctors(params)) as DoctorRow[];
  const { profile } = await getCurrentProfile();
  const canBook = profile?.role === "patient";

  return (
    <main className="py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-950">Find Doctors</h1>
          <p className="mt-3 text-slate-600">Search by disease, treatment type, city, and specialization.</p>
          {params.message ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{params.message}</p>
          ) : null}
        </div>

        <Card className="mb-8">
          <form className="grid gap-4 md:grid-cols-4">
            <Field
              label="Search doctor or disease"
              name="q"
              placeholder="Doctor name, fever, skin, cardiology..."
              defaultValue={params.q || params.disease}
            />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Treatment
              <select name="treatment" defaultValue={params.treatment || ""} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 focus:ring-4">
                <option value="">Any</option>
                <option value="allopathic">Allopathic</option>
                <option value="homeopathic">Homeopathic</option>
                <option value="herbal">Herbal</option>
              </select>
            </label>
            <Field label="City" name="city" placeholder="Lahore" defaultValue={params.city} />
            <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              <Search size={18} /> Search
            </button>
          </form>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <Card key={doctor.user_id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">{doctor.profiles?.full_name || "Doctor"}</h2>
                  <p className="mt-1 text-sm font-semibold text-teal-700">{doctor.specialization}</p>
                </div>
                <Badge tone="teal">{doctor.treatment_type}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{doctor.bio || "Available for consultation through Doctor Hub."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {doctor.diseases?.map((disease) => (
                  <Badge key={disease}>{disease}</Badge>
                ))}
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                <span>City: {doctor.city}</span>
                <span>Experience: {doctor.experience_years} years</span>
                <span>Fee: Rs. {doctor.consultation_fee}</span>
              </div>
              {canBook ? (
                <form action={bookAppointmentAction} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4">
                  <input type="hidden" name="doctorId" value={doctor.user_id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date" name="appointmentDate" type="date" required />
                    <Field label="Time" name="appointmentTime" type="time" required />
                  </div>
                  <TextArea label="Reason" name="reason" placeholder="Describe your problem" required />
                  <SubmitButton>Book Appointment</SubmitButton>
                </form>
              ) : (
                <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Login as a patient to book an appointment.
                </p>
              )}
            </Card>
          ))}
          {doctors.length === 0 ? (
            <Card className="lg:col-span-2 text-center">
              <h2 className="text-2xl font-bold text-slate-950">No doctors found</h2>
              <p className="mt-2 text-sm text-slate-600">
                Try searching with a doctor name, disease, specialization, or a different city.
              </p>
            </Card>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
