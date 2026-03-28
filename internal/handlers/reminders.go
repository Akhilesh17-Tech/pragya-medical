package handlers

import (
"sort"
"time"

"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
"github.com/gin-gonic/gin"
"github.com/google/uuid"
)

// ── GET /api/v1/reminders ────────────────────────────────────────
// ?tab=urgent|today|upcoming|missed|all
// ?sort=days_left|area|medicine

func GetReminders(c *gin.Context) {
userID := c.GetString("userID")
tab := c.DefaultQuery("tab", "urgent")
sortBy := c.DefaultQuery("sort", "days_left")

var patients []models.Patient
config.DB.
Where("user_id = ? AND is_draft = false", userID).
Preload("Medicines").
Find(&patients)

// Build response with days_left + tag
var rows []models.PatientResponse
for _, p := range patients {
dl := models.PatientDaysLeft(p.Medicines)
tag := models.GetTag(dl)

if tab == "all" {
if tag != "ok" {
rows = append(rows, models.PatientResponse{Patient: p, DaysLeft: dl, Tag: tag})
}
} else {
if tag == tab {
rows = append(rows, models.PatientResponse{Patient: p, DaysLeft: dl, Tag: tag})
}
}
}

// Sort — same as your HTML setReminderSort()
sort.Slice(rows, func(i, j int) bool {
switch sortBy {
case "area":
return rows[i].Area < rows[j].Area
case "medicine":
bi, bj := "", ""
if len(rows[i].Medicines) > 0 {
bi = rows[i].Medicines[0].Brand
}
if len(rows[j].Medicines) > 0 {
bj = rows[j].Medicines[0].Brand
}
return bi < bj
default: // days_left
return rows[i].DaysLeft < rows[j].DaysLeft
}
})

helpers.SuccessWithMeta(c, rows, len(rows))
}

// ── PUT /api/v1/reminders/:patient_id ────────────────────────────
// Body: { "status": "sent" | "purchased" | "ignored" | "pending" }

func UpdateReminderStatus(c *gin.Context) {
userID := c.GetString("userID")
patientID := c.Param("patient_id")

var body struct {
Status string `json:"status" binding:"required"`
}
if err := c.ShouldBindJSON(&body); err != nil {
helpers.BadRequest(c, "Status is required")
return
}

// Update patient reminder_status
result := config.DB.Model(&models.Patient{}).
Where("id = ? AND user_id = ?", patientID, userID).
Update("reminder_status", body.Status)

if result.RowsAffected == 0 {
helpers.NotFound(c, "Patient not found")
return
}

// Log this reminder action
uid, _ := uuid.Parse(userID)
pid, _ := uuid.Parse(patientID)
log := models.ReminderLog{
PatientID: pid,
UserID:    uid,
Channel:   "whatsapp",
Status:    body.Status,
SentAt:    time.Now(),
}
config.DB.Create(&log)

helpers.Success(c, gin.H{"message": "Reminder status updated to " + body.Status})
}
