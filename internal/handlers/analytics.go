package handlers

import (
"time"

"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
"github.com/gin-gonic/gin"
)

// ── GET /api/v1/analytics ────────────────────────────────────────

func GetAnalytics(c *gin.Context) {
userID := c.GetString("userID")

var patients []models.Patient
config.DB.
Where("user_id = ? AND is_draft = false", userID).
Preload("Medicines").
Find(&patients)

urgent, today, upcoming, missed := 0, 0, 0, 0
totalRevenue := 0
insuranceExpiring := 0

now := time.Now()
in30 := now.AddDate(0, 0, 30)

for _, p := range patients {
totalRevenue += p.MonthlyExpense

dl := models.PatientDaysLeft(p.Medicines)
switch models.GetTag(dl) {
case "urgent":
urgent++
case "today":
today++
case "upcoming":
upcoming++
case "missed":
missed++
}

if p.InsuranceDate != nil &&
p.InsuranceDate.After(now) &&
p.InsuranceDate.Before(in30) {
insuranceExpiring++
}
}

// Reminders sent this month
var remindersThisMonth int64
firstOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
config.DB.Model(&models.ReminderLog{}).
Joins("JOIN patients ON patients.id = reminder_logs.patient_id").
Where("patients.user_id = ? AND reminder_logs.sent_at >= ?", userID, firstOfMonth).
Count(&remindersThisMonth)

helpers.Success(c, gin.H{
"total_patients":        len(patients),
"urgent":                urgent,
"today":                 today,
"upcoming":              upcoming,
"missed":                missed,
"total_monthly_revenue": totalRevenue,
"reminders_this_month":  remindersThisMonth,
"insurance_expiring":    insuranceExpiring,
})
}
