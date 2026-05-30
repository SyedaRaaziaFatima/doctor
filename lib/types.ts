export type UserRole = "patient" | "doctor" | "assistant" | "admin" | "super_admin";

export type TreatmentType = "allopathic" | "homeopathic" | "herbal";

export type AppointmentStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
};

export type Doctor = {
  id: string;
  user_id: string;
  full_name?: string;
  specialization: string;
  treatment_type: TreatmentType;
  diseases: string[];
  city: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string | null;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id?: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: AppointmentStatus;
  created_at: string;
};
