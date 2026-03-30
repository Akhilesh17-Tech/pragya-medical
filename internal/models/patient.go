package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Patient struct {
	ID                     uuid.UUID      `json:"id"              gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID                 uuid.UUID      `json:"user_id"         gorm:"type:uuid;not null"`
	Name                   string         `json:"name"            gorm:"not null"`
	Mobile                 string         `json:"mobile"`
	WhatsApp               string         `json:"whatsapp"        gorm:"column:whatsapp"`
	Age                    int            `json:"age"`
	Gender                 string         `json:"gender"`
	Area                   string         `json:"area"`
	Address                string         `json:"address"`
	PrimaryDisease         string         `json:"primary_disease"`
	Diseases               pq.StringArray `json:"diseases"        gorm:"type:text[];default:'{}'"`
	Doctor                 string         `json:"doctor"`
	DoctorSpec             string         `json:"doctor_spec"`
	Clinic                 string         `json:"clinic"`
	Delivery               bool           `json:"delivery"        gorm:"default:false"`
	DeliveryStatus         string         `json:"delivery_status" gorm:"default:''"`
	DeliveryDate           *time.Time     `json:"delivery_date"  gorm:"type:date"`
	DeliveryBoy            string         `json:"delivery_boy"`
	ReminderStatus         string         `json:"reminder_status" gorm:"default:pending"`
	Insurance              string         `json:"insurance"`
	InsuranceDate          *time.Time     `json:"insurance_date" gorm:"type:date"`
	MonthlyExpense         int            `json:"monthly_expense" gorm:"default:0"`
	Purchaser              string         `json:"purchaser"       gorm:"default:Self"`
	PurchaserName          string         `json:"purchaser_name"`
	PurchaserMobile        string         `json:"purchaser_mobile"`
	PurchaserRel           string         `json:"purchaser_rel"`
	StorePreference        string         `json:"store_preference" gorm:"default:us"`
	OtherStoreName         string         `json:"other_store_name"`
	OtherStoreLastPurchase *time.Time     `json:"other_store_last_purchase"`
	IsDraft                bool           `json:"is_draft"        gorm:"default:false"`
	Notes                  string         `json:"notes"`
	CreatedAt              time.Time      `json:"created_at"`
	UpdatedAt              time.Time      `json:"updated_at"`

	// Preloaded relation — not a DB column
	Medicines []Medicine `json:"medicines,omitempty" gorm:"foreignKey:PatientID"`
}

// DaysLeft is computed at runtime — never stored
type PatientResponse struct {
	Patient
	DaysLeft int    `json:"days_left"`
	Tag      string `json:"tag"` // urgent | today | upcoming | missed | ok
}
