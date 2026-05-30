"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function saveDoctorProfileAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "doctor") redirect("/login");

  const diseases = value(formData, "diseases")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error: doctorError } = await supabase
    .from("doctors")
    .upsert(
      {
        user_id: user.id,
        specialization: value(formData, "specialization"),
        treatment_type: value(formData, "treatmentType"),
        diseases,
        city: value(formData, "city"),
        experience_years: Number(value(formData, "experienceYears") || 0),
        consultation_fee: Number(value(formData, "consultationFee") || 0),
        bio: value(formData, "bio"),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  if (doctorError) {
    redirect(`/dashboard/doctor?message=${encodeURIComponent(doctorError.message)}`);
  }

  const { error: clinicError } = await supabase
    .from("clinics")
    .upsert(
      {
        doctor_id: user.id,
        name: value(formData, "clinicName") || "Main Clinic",
        address: value(formData, "clinicAddress") || "Not set",
        fee: Number(value(formData, "consultationFee") || 0)
      },
      { onConflict: "doctor_id" }
    );

  if (clinicError) {
    redirect(`/dashboard/doctor?message=${encodeURIComponent(clinicError.message)}`);
  }

  revalidatePath("/dashboard/doctor");
  revalidatePath("/doctors");
  redirect("/dashboard/doctor?message=Doctor profile updated");
}

export async function bookAppointmentAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "patient") redirect("/login");

  const doctorId = value(formData, "doctorId");

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: doctorId,
      appointment_date: value(formData, "appointmentDate"),
      appointment_time: value(formData, "appointmentTime"),
      reason: value(formData, "reason"),
      status: "pending_payment"
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    redirect(`/doctors?message=${encodeURIComponent(error?.message || "Booking failed")}`);
  }

  redirect(`/appointments/${data.id}`);
}

export async function uploadPaymentAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "patient") redirect("/login");

  const appointmentId = value(formData, "appointmentId");
  const file = formData.get("paymentProof");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/appointments/${appointmentId}?message=Please upload payment proof`);
  }

  const path = `${user.id}/${appointmentId}-${Date.now()}-${file.name}`;
  const upload = await supabase.storage.from("payment-proofs").upload(path, file, {
    upsert: true
  });

  if (upload.error) {
    redirect(`/appointments/${appointmentId}?message=${encodeURIComponent(upload.error.message)}`);
  }

  await supabase.from("payments").upsert({
    appointment_id: appointmentId,
    patient_id: user.id,
    proof_path: path,
    amount: Number(value(formData, "amount") || 0),
    status: "pending"
  });

  await supabase
    .from("appointments")
    .update({ status: "payment_uploaded" })
    .eq("id", appointmentId)
    .eq("patient_id", user.id);

  redirect(`/appointments/${appointmentId}?message=Payment proof uploaded`);
}

export async function verifyPaymentAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || !profile || !["assistant", "admin", "super_admin"].includes(profile.role)) {
    redirect("/login");
  }

  const paymentId = value(formData, "paymentId");
  const appointmentId = value(formData, "appointmentId");
  const decision = value(formData, "decision") === "approved" ? "approved" : "rejected";

  await supabase
    .from("payments")
    .update({
      status: decision,
      verified_by: user.id,
      verified_at: new Date().toISOString()
    })
    .eq("id", paymentId);

  await supabase
    .from("appointments")
    .update({ status: decision === "approved" ? "confirmed" : "pending_payment" })
    .eq("id", appointmentId);

  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard/admin");
}

export async function addMedicalHistoryAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "patient") redirect("/login");

  await supabase.from("medical_history").insert({
    patient_id: user.id,
    title: value(formData, "title"),
    details: value(formData, "details"),
    created_by: user.id
  });

  revalidatePath("/dashboard/patient");
}

export async function uploadReportAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "patient") redirect("/login");

  const file = formData.get("reportFile");
  if (!(file instanceof File) || file.size === 0) redirect("/dashboard/patient");

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const upload = await supabase.storage.from("medical-reports").upload(path, file, {
    upsert: true
  });

  if (!upload.error) {
    await supabase.from("reports").insert({
      patient_id: user.id,
      title: value(formData, "title") || file.name,
      file_path: path
    });
  }

  revalidatePath("/dashboard/patient");
}

export async function addPrescriptionAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getCurrentProfile();
  if (!supabase || !user || profile?.role !== "doctor") redirect("/login");

  const patientId = value(formData, "patientId");
  const { error } = await supabase.from("prescriptions").insert({
    appointment_id: value(formData, "appointmentId"),
    patient_id: patientId,
    doctor_id: user.id,
    diagnosis: value(formData, "diagnosis"),
    medicines: value(formData, "medicines"),
    notes: value(formData, "notes")
  });

  if (error) {
    redirect(`/dashboard/doctor?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/doctor");
  revalidatePath("/dashboard/patient");
}

export async function updateUserRoleAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentProfile();
  if (!supabase || !profile || !["admin", "super_admin"].includes(profile.role)) redirect("/login");

  await supabase
    .from("profiles")
    .update({ role: value(formData, "role") })
    .eq("id", value(formData, "userId"));

  revalidatePath("/dashboard/admin");
}

export async function assignAssistantAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentProfile();
  if (!supabase || !profile || !["admin", "super_admin"].includes(profile.role)) redirect("/login");

  await supabase.from("assistants").upsert({
    user_id: value(formData, "assistantId"),
    doctor_id: value(formData, "doctorId")
  });

  await supabase.from("profiles").update({ role: "assistant" }).eq("id", value(formData, "assistantId"));

  revalidatePath("/dashboard/admin");
}
