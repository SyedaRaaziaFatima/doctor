import { createSupabaseServerClient } from "@/lib/supabase/server";

type DoctorSearchFilters = {
  q?: string;
  disease?: string;
  treatment?: string;
  city?: string;
};

type DoctorSearchRow = {
  specialization?: string | null;
  diseases?: string[] | null;
  city?: string | null;
  bio?: string | null;
  profiles?: { full_name?: string | null; email?: string | null; phone?: string | null } | null;
};

type PaymentRecord = {
  proof_path?: string | null;
  [key: string]: unknown;
};

function includesSearch(value: string | null | undefined, search: string) {
  return (value || "").toLowerCase().includes(search);
}

function doctorMatchesSearch(doctor: DoctorSearchRow, search: string) {
  if (!search) return true;

  return (
    includesSearch(doctor.profiles?.full_name, search) ||
    includesSearch(doctor.specialization, search) ||
    includesSearch(doctor.city, search) ||
    includesSearch(doctor.bio, search) ||
    (doctor.diseases || []).some((disease) => includesSearch(disease, search))
  );
}

async function addPaymentProofUrls<T extends PaymentRecord>(payments: T[]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return payments.map((payment) => ({ ...payment, proof_url: null }));
  }

  return Promise.all(
    payments.map(async (payment) => {
      if (!payment.proof_path) {
        return { ...payment, proof_url: null };
      }

      const { data } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(payment.proof_path, 60 * 30);

      return {
        ...payment,
        proof_url: data?.signedUrl || null
      };
    })
  );
}

export async function getDoctors(filters?: DoctorSearchFilters) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const search = (filters?.q || filters?.disease || "").trim().toLowerCase();
  const city = (filters?.city || "").trim().toLowerCase();

  let query = supabase
    .from("doctors")
    .select("*, profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (filters?.treatment) query = query.eq("treatment_type", filters.treatment);

  const { data } = await query;
  return (data || []).filter((doctor) => {
    const matchesMainSearch = doctorMatchesSearch(doctor, search);
    const matchesCity = city ? includesSearch(doctor.city, city) : true;
    return matchesMainSearch && matchesCity;
  });
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
    supabase
      .from("appointments")
      .select("*, profiles!appointments_patient_id_fkey(full_name, email, phone)")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("prescriptions").select("*").eq("doctor_id", userId).order("created_at", { ascending: false })
  ]);

  const appointmentRows = appointments.data || [];
  const appointmentIds = appointmentRows.map((appointment) => appointment.id);
  const payments =
    appointmentIds.length > 0
      ? await supabase
          .from("payments")
          .select("*")
          .in("appointment_id", appointmentIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const paymentsWithProofs = await addPaymentProofUrls((payments.data || []) as PaymentRecord[]);

  const appointmentsWithProofs = await Promise.all(
    appointmentRows.map(async (appointment) => ({
      ...appointment,
      payments: paymentsWithProofs.filter((payment) => payment.appointment_id === appointment.id)
    }))
  );

  return {
    doctor: doctor.data,
    appointments: appointmentsWithProofs,
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
    .select("*, appointments(*), profiles!payments_patient_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  if (doctorIds.length > 0) {
    query = query.in("appointments.doctor_id", doctorIds);
  }

  const { data } = await query;
  return { payments: await addPaymentProofUrls((data || []) as PaymentRecord[]) };
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

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
    .single();

  if (error || !appointment) return null;

  const [doctor, doctorProfile, payments] = await Promise.all([
    supabase.from("doctors").select("*").eq("user_id", appointment.doctor_id).single(),
    supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", appointment.doctor_id)
      .single(),
    supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointment.id)
      .order("created_at", { ascending: false })
  ]);

  const paymentsWithProofs = await addPaymentProofUrls((payments.data || []) as PaymentRecord[]);

  return {
    ...appointment,
    doctors: doctor.data
      ? {
          ...doctor.data,
          profiles: doctorProfile.data
        }
      : null,
    payments: paymentsWithProofs
  };
}
