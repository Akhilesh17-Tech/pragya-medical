package models

import (
	"math"
	"time"

	"github.com/google/uuid"
)

type Medicine struct {
	ID          uuid.UUID `json:"id"           gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	PatientID   uuid.UUID `json:"patient_id"   gorm:"type:uuid;not null"`
	Brand       string    `json:"brand"        gorm:"not null"`
	Composition string    `json:"composition"`
	Company     string    `json:"company"`
	Strength    string    `json:"strength"`
	DosageForm  string    `json:"dosage_form"  gorm:"default:tablet"`
	Qty         float64   `json:"qty"`
	DosePerDay  float64   `json:"dose_per_day"`
	StartDate   time.Time `json:"start_date"`
	CreatedAt   time.Time `json:"created_at"`
}

// DaysLeft — exact same logic as your HTML calcMedDaysLeft()
func (m *Medicine) DaysLeft() int {
	if m.Qty == 0 || m.DosePerDay == 0 || m.StartDate.IsZero() {
		return 0
	}
	totalDays := int(math.Ceil(m.Qty / m.DosePerDay))
	end := m.StartDate.AddDate(0, 0, totalDays)
	today := time.Now().Truncate(24 * time.Hour)
	diff := end.Sub(today).Hours() / 24
	return int(math.Floor(diff))
}

// EndDate — when this batch finishes
func (m *Medicine) EndDate() string {
	if m.Qty == 0 || m.DosePerDay == 0 || m.StartDate.IsZero() {
		return ""
	}
	totalDays := int(math.Ceil(m.Qty / m.DosePerDay))
	end := m.StartDate.AddDate(0, 0, totalDays)
	return end.Format("2006-01-02")
}

// GetTag — same logic as your HTML getTag()
func GetTag(daysLeft int) string {
	switch {
	case daysLeft <= 0:
		return "missed"
	case daysLeft <= 2:
		return "urgent"
	case daysLeft == 3:
		return "today"
	case daysLeft <= 7:
		return "upcoming"
	default:
		return "ok"
	}
}

// PatientDaysLeft — minimum days left across all medicines
func PatientDaysLeft(medicines []Medicine) int {
	if len(medicines) == 0 {
		return 0
	}
	min := math.MaxInt32
	for _, m := range medicines {
		d := m.DaysLeft()
		if d < min {
			min = d
		}
	}
	if min == math.MaxInt32 {
		return 0
	}
	return min
}
