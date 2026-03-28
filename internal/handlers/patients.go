package handlers

import (
"time"

"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
"github.com/gin-gonic/gin"
"github.com/google/uuid"
"gorm.io/gorm"
)

// ── helpers ──────────────────────────────────────────────────────

func buildPatientResponse(p models.Patient) models.PatientResponse {
dl := models.PatientDaysLeft(p.Medicines)
return models.PatientResponse{
Patient:  p,
DaysLeft: dl,
Tag:      models.GetTag(dl),
}
}

// ── GET /api/v1/patients ─────────────────────────────────────────

func GetPatients(c *gin.Context) {
userID := c.GetString("userID")
search := c.Query("search")   // ?search=ram
disease := c.Query("disease") // ?disease=BP
draft := c.Query("draft")     // ?draft=true

var patients []models.Patient
q := config.DB.Where("user_id = ?", userID).
Preload("Medicines").
Order("created_at DESC")

// By default only show real patients, not drafts
if draft == "true" {
q = q.Where("is_draft = true")
} else {
q = q.Where("is_draft = false")
}

if search != "" {
like := "%" + search + "%"
q = q.Where(
"name ILIKE ? OR mobile LIKE ? OR area ILIKE ? OR doctor ILIKE ?",
like, like, like, like,
)
}

if disease != "" && disease != "All" {
if disease == "Insurance" {
q = q.Where("insurance != '' AND insurance IS NOT NULL")
} else if disease == "Delivery" {
q = q.Where("delivery = true")
} else {
q = q.Where("? = ANY(diseases)", disease)
}
}

if err := q.Find(&patients).Error; err != nil {
helpers.ServerError(c, "Could not fetch patients")
return
}

result := make([]models.PatientResponse, len(patients))
for i, p := range patients {
result[i] = buildPatientResponse(p)
}

helpers.SuccessWithMeta(c, result, len(result))
}

// ── GET /api/v1/patients/:id ─────────────────────────────────────

func GetPatient(c *gin.Context) {
userID := c.GetString("userID")
id := c.Param("id")

var patient models.Patient
if err := config.DB.
Where("id = ? AND user_id = ?", id, userID).
Preload("Medicines").
First(&patient).Error; err != nil {
helpers.NotFound(c, "Patient not found")
return
}

helpers.Success(c, buildPatientResponse(patient))
}

// ── POST /api/v1/patients ────────────────────────────────────────

type CreatePatientInput struct {
models.Patient
Medicines []models.Medicine `json:"medicines"`
}

func CreatePatient(c *gin.Context) {
userID := c.GetString("userID")

var input CreatePatientInput
if err := c.ShouldBindJSON(&input); err != nil {
helpers.BadRequest(c, err.Error())
return
}

uid, _ := uuid.Parse(userID)
input.Patient.UserID = uid

// Use transaction — patient + medicines saved together or not at all
err := config.DB.Transaction(func(tx *gorm.DB) error {
if err := tx.Create(&input.Patient).Error; err != nil {
return err
}
for i := range input.Medicines {
input.Medicines[i].PatientID = input.Patient.ID
if input.Medicines[i].StartDate.IsZero() {
input.Medicines[i].StartDate = time.Now().Truncate(24 * time.Hour)
}
}
if len(input.Medicines) > 0 {
if err := tx.Create(&input.Medicines).Error; err != nil {
return err
}
}
return nil
})

if err != nil {
helpers.ServerError(c, "Could not create patient")
return
}

// Return with days_left computed
input.Patient.Medicines = input.Medicines
helpers.Created(c, buildPatientResponse(input.Patient))
}

// ── PUT /api/v1/patients/:id ─────────────────────────────────────

func UpdatePatient(c *gin.Context) {
userID := c.GetString("userID")
id := c.Param("id")

var patient models.Patient
if err := config.DB.
Where("id = ? AND user_id = ?", id, userID).
First(&patient).Error; err != nil {
helpers.NotFound(c, "Patient not found")
return
}

// Only update fields that are sent — ignore zero values
var updates map[string]any
if err := c.ShouldBindJSON(&updates); err != nil {
helpers.BadRequest(c, err.Error())
return
}

// Remove fields that should not be overwritten
delete(updates, "id")
delete(updates, "user_id")
delete(updates, "created_at")
delete(updates, "medicines") // medicines updated separately

if err := config.DB.Model(&patient).Updates(updates).Error; err != nil {
helpers.ServerError(c, "Could not update patient")
return
}

// Reload with medicines for response
config.DB.Where("id = ?", patient.ID).Preload("Medicines").First(&patient)
helpers.Success(c, buildPatientResponse(patient))
}

// ── DELETE /api/v1/patients/:id ──────────────────────────────────

func DeletePatient(c *gin.Context) {
userID := c.GetString("userID")
id := c.Param("id")

result := config.DB.
Where("id = ? AND user_id = ?", id, userID).
Delete(&models.Patient{})

if result.RowsAffected == 0 {
helpers.NotFound(c, "Patient not found")
return
}

helpers.Success(c, gin.H{"message": "Patient deleted"})
}
