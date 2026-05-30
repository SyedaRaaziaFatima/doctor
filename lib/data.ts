import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getDoctors(filters?: { disease?: string; treatment?: string; city?: string }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("doctors")
    .select("*, profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (filters?.treatment) query = query.eq("treatment_type", filters.treatment);
  if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters?.disease) query = query.contains("diseases", [filters.disease]);

  const { data } = await query;
  return data || [];
}

export async function getPatientDashboard(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { appointments: [], history: [], reports: [], prescriptions: [] };

  const [appointments, history, reports, prescriptions] = await Promise.all([
    supabase.from("appointments").select("*, doctors(*, profiles(full_name))").eq("patient_id", userId).order("created_at", { ascending: false }),
    supabase.from("medical_history").select("*").eq("patient_id", userId).order("created_at", { ascending: false }),
    supabase.from("reports").select("*").eq("patient_id", userId).order("created_at", { ascending: false }),
    supabase.from("prescriptions").select("*, doctors(profiles(full_name))").eq("patient_id", userId).order("created_at", { ascending: false })
  ]);

  return {
    appointments: appointments.data || [],
    history: history.data || [],
    reports: reports.data || [],
    prescriptions: prescriptions.data || []
  };
}

export async function getDoctorDashboard(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { doctor: null, appointments: [], prescriptions: [] };

  const [doctor, appointments, prescriptions] = await Promise.all([
    supabase.from("doctors").select("*").eq("user_id", userId).single(),
    supabase.from("appointments").select("*, profiles!appointments_patient_id_fkey(full_name, email, phone)").eq("doctor_id", userId).order("created_at", { ascending: false }),
    supabase.from("prescriptions").select("*").eq("doctor_id", userId).order("created_at", { ascending: false })
  ]);

  return {
    doctor: doctor.data,
    appointments: appointments.data || [],
    prescriptions: prescriptions.data || []
  };
}

export async function getAssistantDashboard(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { payments: [] };

  const { data: assignments } = await supabase.from("assistants").select("doctor_id").eq("user_id", userId);
  const doctorIds = (assignments || []).map((item) => item.doctor_id);

  let query = supabase
    .from("payments")
    .select("*, appointments(*, doctors(profiles(full_name)), profiles!payments_patient_id_fkey(full_name, email))")
    .order("created_at", { ascending: false });

  if (doctorIds.length > 0) {
    query = query.in("appointments.doctor_id", doctorIds);
  }

  const { data } = await query;
  return { payments: data || [] };
}

export async function getAdminDashboard() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { profiles: [], doctors: [], appointments: [], payments: [] };
  }

  const [profiles, doctors, appointments, payments] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("doctors").select("*, profiles(full_name, email)").order("created_at", { ascending: false }),
    supabase.from("appointments").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false })
  ]);

  return {
    profiles: profiles.data || [],
    doctors: doctors.data || [],
    appointments: appointments.data || [],
    payments: payments.data || []
  };
}

export async function getAppointment(appointmentId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("appointments")
    .select("*, doctors(*, profiles(full_name, email, phone)), payments(*)")
    .eq("id", appointmentId)
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
    .single();

  return data;
}
