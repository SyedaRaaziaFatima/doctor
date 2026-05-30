import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
          <h1 className="mt-6 text-2xl font-bold text-slate-950">Connecting to Doctor Hub</h1>
          <p className="mt-2 text-sm text-slate-600">Please wait while we contact the server and database.</p>
        </div>
      </Container>
    </main>
  );
}
