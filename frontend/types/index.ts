export type DosageForm =
  | "tablet"
  | "capsule"
  | "syrup"
  | "powder"
  | "drops"
  | "injection"
  | "inhaler"
  | "cream"
  | "other";

export type ReminderStatus = "pending" | "sent" | "purchased" | "ignored";
export type PatientTag = "urgent" | "today" | "upcoming" | "missed" | "ok";
export type DeliveryStatus =
  | ""
  | "requested"
  | "out_for_delivery"
  | "delivered";

export interface Medicine {
  id?: string;
  patient_id?: string;
  brand: string;
  composition: string;
  company: string;
  strength: string;
  dosage_form: DosageForm;
  qty: number;
  dose_per_day: number;
  start_date: string;
  days_left?: number;
  end_date?: string;
}

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  area: string;
  address: string;
  primary_disease: string;
  diseases: string[];
  doctor: string;
  doctor_spec?: string;
  clinic?: string;
  delivery: boolean;
  delivery_status: DeliveryStatus;
  delivery_date?: string;
  delivery_boy?: string;
  reminder_status: ReminderStatus;
  insurance?: string;
  insurance_date?: string;
  monthly_expense: number;
  purchaser?: string;
  purchaser_name?: string;
  purchaser_mobile?: string;
  store_preference?: string;
  other_store_name?: string;
  is_draft: boolean;
  notes?: string;
  medicines: Medicine[];
  days_left: number;
  tag: PatientTag;
  created_at: string;
}

export interface Invoice {
  id: string;
  patient_id: string;
  invoice_no: string;
  subtotal: number;
  discount: number;
  grand_total: number;
  purchase_status: "purchased_us" | "purchased_other" | "pending";
  next_reminder_date?: string;
  purchaser?: string;
  notes?: string;
  created_at: string;
  items?: InvoiceItem[];
  patient?: Patient;
}

export interface InvoiceItem {
  id?: string;
  brand: string;
  composition?: string;
  strength?: string;
  qty: number;
  dose_per_day: number;
  consumption_days?: number;
  unit_price: number;
  total_price: number;
  finish_date?: string;
  reminder_date?: string;
}

export interface Analytics {
  total_patients: number;
  urgent: number;
  today: number;
  upcoming: number;
  missed: number;
  total_monthly_revenue: number;
  reminders_this_month: number;
  insurance_expiring: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pharmacy_name: string;
}

export interface Settings {
  auto_reminder_on: boolean;
  remind_before_days: number;
  reminder_mode: "whatsapp" | "sms" | "call";
  reminder_time: "morning" | "afternoon" | "evening";
  daily_auto: boolean;
  scheduled_time: string;
  wa_template: string;
}

export interface InventoryItem {
  id: string;
  brand: string;
  composition: string;
  company: string;
  strength: string;
  dosage_form: string;
  category: string;
  current_stock: number;
  min_stock_alert: number;
  unit: string;
  purchase_price: number;
  selling_price: number;
  low_stock: boolean;
  created_at: string;
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  type: "add" | "deduct" | "adjustment";
  quantity: number;
  reason: string;
  notes: string;
  created_at: string;
}
