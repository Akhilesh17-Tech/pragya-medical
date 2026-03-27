package models

import (
"time"

"github.com/google/uuid"
)

type Invoice struct {
ID                    uuid.UUID     `json:"id"                      gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
PatientID             uuid.UUID     `json:"patient_id"              gorm:"type:uuid;not null"`
UserID                uuid.UUID     `json:"user_id"                 gorm:"type:uuid;not null"`
InvoiceNo             string        `json:"invoice_no"              gorm:"uniqueIndex;not null"`
Subtotal              float64       `json:"subtotal"                gorm:"default:0"`
Discount              float64       `json:"discount"                gorm:"default:0"`
GrandTotal            float64       `json:"grand_total"             gorm:"default:0"`
PurchaseStatus        string        `json:"purchase_status"         gorm:"default:pending"`
NextReminderDate      *time.Time    `json:"next_reminder_date"`
NextReminderBasis     string        `json:"next_reminder_basis"`
PatientConvenienceDate *time.Time   `json:"patient_convenience_date"`
Purchaser             string        `json:"purchaser"`
PurchasedByName       string        `json:"purchased_by_name"`
Notes                 string        `json:"notes"`
CreatedAt             time.Time     `json:"created_at"`

// Relations
Items   []InvoiceItem `json:"items,omitempty"   gorm:"foreignKey:InvoiceID"`
Patient *Patient      `json:"patient,omitempty" gorm:"foreignKey:PatientID"`
}

type InvoiceItem struct {
ID              uuid.UUID `json:"id"               gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
InvoiceID       uuid.UUID `json:"invoice_id"       gorm:"type:uuid;not null"`
Brand           string    `json:"brand"            gorm:"not null"`
Composition     string    `json:"composition"`
Strength        string    `json:"strength"`
Qty             float64   `json:"qty"`
DosePerDay      float64   `json:"dose_per_day"     gorm:"default:1"`
ConsumptionDays int       `json:"consumption_days"`
UnitPrice       float64   `json:"unit_price"       gorm:"default:0"`
TotalPrice      float64   `json:"total_price"      gorm:"default:0"`
FinishDate      *time.Time `json:"finish_date"`
ReminderDate    *time.Time `json:"reminder_date"`
}
