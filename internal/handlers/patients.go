package handlers

import (
	"encoding/json"
	"time"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// ── helper ───────────────────────────────────────────────────────

func buildPatientResponse(p models.Patient) models.PatientResponse {
	dl := models.PatientDaysLeft(p.Medicines)
	return models.PatientResponse{
		Patient:  p,
		DaysLeft: dl,
		Tag:      models.GetTag(dl),
	}
}

// parseDate safely parses "2006-01-02" — returns nil if empty or invalid
func parseDate(s string) *time.Time {
	if s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil
	}
	return &t
}

// ── Input structs with string dates ──────────────────────────────

type MedicineInput struct {
	Brand       string  `json:"brand"`
	Composition string  `json:"composition"`
	Company     string  `json:"company"`
	Strength    string  `json:"strength"`
	DosageForm  string  `json:"dosage_form"`
	Qty         float64 `json:"qty"`
	DosePerDay  float64 `json:"dose_per_day"`
	StartDate   string  `json:"start_date"` // string — we parse manually
}

type CreatePatientInput struct {
	Name           string          `json:"name"`
	Mobile         string          `json:"mobile"`
	WhatsApp       string          `json:"whatsapp"`
	Age            int             `json:"age"`
	Gender         string          `json:"gender"`
	Area           string          `json:"area"`
	Address        string          `json:"address"`
	Doctor         string          `json:"doctor"`
	PrimaryDisease string          `json:"primary_disease"`
	Diseases       pq.StringArray  `json:"diseases"`
	Delivery       bool            `json:"delivery"`
	DeliveryStatus string          `json:"delivery_status"`
	DeliveryBoy    string          `json:"delivery_boy"`
	Insurance      string          `json:"insurance"`
	InsuranceDate  string          `json:"insurance_date"` // string — we parse manually
	MonthlyExpense int             `json:"monthly_expense"`
	Notes          string          `json:"notes"`
	IsDraft        bool            `json:"is_draft"`
	Medicines      []MedicineInput `json:"medicines"`
}

// ── GET /api/v1/patients ─────────────────────────────────────────

func GetPatients(c *gin.Context) {
	userID := c.GetString("userID")
	search := c.Query("search")
	disease := c.Query("disease")
	draft := c.Query("draft")

	var patients []models.Patient
	q := config.DB.Where("user_id = ?", userID).
		Preload("Medicines").
		Order("created_at DESC")

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

func CreatePatient(c *gin.Context) {
	userID := c.GetString("userID")

	// Read raw body so we control date parsing
	var input CreatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, "Invalid request body: "+err.Error())
		return
	}

	if input.Name == "" {
		helpers.BadRequest(c, "Patient name is required")
		return
	}

	uid, _ := uuid.Parse(userID)

	patient := models.Patient{
		UserID:         uid,
		Name:           input.Name,
		Mobile:         input.Mobile,
		WhatsApp:       input.WhatsApp,
		Age:            input.Age,
		Gender:         input.Gender,
		Area:           input.Area,
		Address:        input.Address,
		Doctor:         input.Doctor,
		PrimaryDisease: input.PrimaryDisease,
		Diseases:       input.Diseases,
		Delivery:       input.Delivery,
		DeliveryStatus: input.DeliveryStatus,
		DeliveryBoy:    input.DeliveryBoy,
		Insurance:      input.Insurance,
		InsuranceDate:  parseDate(input.InsuranceDate),
		MonthlyExpense: input.MonthlyExpense,
		Notes:          input.Notes,
		IsDraft:        input.IsDraft,
		ReminderStatus: "pending",
	}

	// Ensure diseases is never nil
	if len(patient.Diseases) == 0 && input.PrimaryDisease != "" {
		patient.Diseases = pq.StringArray{input.PrimaryDisease}
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&patient).Error; err != nil {
			return err
		}

		// Convert MedicineInput → models.Medicine
		today := time.Now().Truncate(24 * time.Hour)
		for _, mi := range input.Medicines {
			if mi.Brand == "" {
				continue // skip empty medicine rows
			}
			startDate := today
			if mi.StartDate != "" {
				if t := parseDate(mi.StartDate); t != nil {
					startDate = *t
				}
			}
			med := models.Medicine{
				PatientID:   patient.ID,
				Brand:       mi.Brand,
				Composition: mi.Composition,
				Company:     mi.Company,
				Strength:    mi.Strength,
				DosageForm:  mi.DosageForm,
				Qty:         mi.Qty,
				DosePerDay:  mi.DosePerDay,
				StartDate:   startDate,
			}
			if med.DosageForm == "" {
				med.DosageForm = "tablet"
			}
			if err := tx.Create(&med).Error; err != nil {
				return err
			}
			patient.Medicines = append(patient.Medicines, med)
		}
		return nil
	})

	if err != nil {
		helpers.ServerError(c, "Could not create patient: "+err.Error())
		return
	}

	helpers.Created(c, buildPatientResponse(patient))
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

	// Decode into a raw map to handle date strings
	var raw map[string]json.RawMessage
	if err := c.ShouldBindJSON(&raw); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	updates := map[string]any{}

	stringFields := []string{
		"name", "mobile", "whatsapp", "gender", "area", "address",
		"doctor", "doctor_spec", "clinic", "primary_disease",
		"delivery_status", "delivery_boy", "insurance",
		"reminder_status", "notes", "purchaser", "store_preference",
		"other_store_name",
	}
	for _, f := range stringFields {
		if v, ok := raw[f]; ok {
			var s string
			if json.Unmarshal(v, &s) == nil {
				updates[f] = s
			}
		}
	}

	boolFields := []string{"delivery", "is_draft"}
	for _, f := range boolFields {
		if v, ok := raw[f]; ok {
			var b bool
			if json.Unmarshal(v, &b) == nil {
				updates[f] = b
			}
		}
	}

	intFields := []string{"age", "monthly_expense"}
	for _, f := range intFields {
		if v, ok := raw[f]; ok {
			var n int
			if json.Unmarshal(v, &n) == nil {
				updates[f] = n
			}
		}
	}

	// Date fields — parse safely
	for _, f := range []string{"insurance_date", "delivery_date"} {
		if v, ok := raw[f]; ok {
			var s string
			if json.Unmarshal(v, &s) == nil {
				updates[f] = parseDate(s) // nil if empty
			}
		}
	}

	delete(updates, "id")
	delete(updates, "user_id")
	delete(updates, "created_at")
	delete(updates, "medicines")

	if err := config.DB.Model(&patient).Updates(updates).Error; err != nil {
		helpers.ServerError(c, "Could not update patient")
		return
	}

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
