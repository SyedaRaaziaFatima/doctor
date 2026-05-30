import { Card } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/utils";

export function SetupWarning() {
  if (isSupabaseConfigured()) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 text-amber-900">
      <p className="font-semibold">Supabase is not connected yet.</p>
      <p className="mt-2 text-sm">
        Create a free Supabase project, run the SQL files in the `supabase` folder, then add
        `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
      </p>
    </Card>
  );
}
