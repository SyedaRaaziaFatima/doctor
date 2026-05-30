import { Activity, CalendarCheck, FileText, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { ButtonLink, Card, Container } from "@/components/ui";
import { SetupWarning } from "@/components/setup-warning";

const features = [
  { title: "Doctor Search", text: "Filter doctors by disease, city, specialization, and treatment type.", icon: Stethoscope },
  { title: "Appointment Booking", text: "Patients book visits and upload payment proof before confirmation.", icon: CalendarCheck },
  { title: "Medical History", text: "Reports, history, and prescriptions remain protected and append-only.", icon: FileText },
  { title: "Assistant Verification", text: "Assistants verify payments and keep bookings moving.", icon: Users },
  { title: "Role Security", text: "Patient, doctor, assistant, admin, and super admin access is separated.", icon: ShieldCheck },
  { title: "Reports", text: "Admins can track users, appointments, payments, and system activity.", icon: Activity }
];

export default function Home() {
  return (
    <main>
      <Container className="py-10">
        <SetupWarning />
      </Container>
      <section className="py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 ring-1 ring-teal-200">
              Final semester healthcare platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Doctor Hub connects patients, doctors, assistants, and admins.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Search doctors by disease and treatment type, book appointments, verify payments, manage medical history, and preserve prescriptions securely.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/doctors">Find a Doctor</ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                Create Account
              </ButtonLink>
            </div>
          </div>
          <Card className="bg-slate-950 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Live Workflow</p>
            <div className="mt-8 grid gap-4">
              {["Search doctor", "Book appointment", "Upload payment proof", "Assistant verifies", "Doctor adds prescription"].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-400 font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <section id="features" className="py-12">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <Icon className="mb-5 text-teal-600" size={30} />
                  <h2 className="text-xl font-bold text-slate-950">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="workflow" className="py-16">
        <Container>
          <Card>
            <h2 className="text-3xl font-bold text-slate-950">Appointment Workflow</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-5">
              {["Patient searches", "Filters doctor", "Books slot", "Uploads payment", "Assistant confirms"].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
