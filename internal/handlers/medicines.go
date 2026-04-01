package handlers

import (
	"time"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AddMedicine(c *gin.Context) {
    patientID := c.Param("id")

    var input MedicineInput  // ← Use string-based input
    if err := c.ShouldBindJSON(&input); err != nil {
        helpers.BadRequest(c, err.Error())
        return
    }

    pid, err := uuid.Parse(patientID)
    if err != nil {
        helpers.BadRequest(c, "Invalid patient ID")
        return
    }

    // Parse the date string
    startDate := time.Now().Truncate(24 * time.Hour)
    if input.StartDate != "" {
        if parsed := parseDate(input.StartDate); parsed != nil {
            startDate = *parsed
        }
    }

    medicine := models.Medicine{
        PatientID:   pid,
        Brand:       input.Brand,
        Composition: input.Composition,
        Company:     input.Company,
        Strength:    input.Strength,
        DosageForm:  input.DosageForm,
        Qty:         input.Qty,
        DosePerDay:  input.DosePerDay,
        StartDate:   startDate,
    }

    if err := config.DB.Create(&medicine).Error; err != nil {
        helpers.ServerError(c, "Could not add medicine")
        return
    }

    helpers.Created(c, gin.H{
        "medicine":  medicine,
        "days_left": medicine.DaysLeft(),
        "end_date":  medicine.EndDate(),
    })
}

func UpdateMedicine(c *gin.Context) {
    id := c.Param("id")

    var medicine models.Medicine
    if err := config.DB.Where("id = ?", id).First(&medicine).Error; err != nil {
        helpers.NotFound(c, "Medicine not found")
        return
    }

    var input MedicineInput
    if err := c.ShouldBindJSON(&input); err != nil {
        helpers.BadRequest(c, err.Error())
        return
    }

    // Build updates map with proper type handling
    updates := map[string]any{
        "brand":       input.Brand,
        "composition": input.Composition,
        "company":     input.Company,
        "strength":    input.Strength,
        "dosage_form": input.DosageForm,
        "qty":         input.Qty,
        "dose_per_day": input.DosePerDay,
    }

    // Parse the date string if provided
    if input.StartDate != "" {
        if parsed := parseDate(input.StartDate); parsed != nil {
            updates["start_date"] = *parsed
        }
    }

    if err := config.DB.Model(&medicine).Updates(updates).Error; err != nil {
        helpers.ServerError(c, "Could not update medicine")
        return
    }

    config.DB.Where("id = ?", medicine.ID).First(&medicine)
    helpers.Success(c, gin.H{
        "medicine":  medicine,
        "days_left": medicine.DaysLeft(),
        "end_date":  medicine.EndDate(),
    })
}

func DeleteMedicine(c *gin.Context) {
	id := c.Param("id")

	result := config.DB.Where("id = ?", id).Delete(&models.Medicine{})
	if result.RowsAffected == 0 {
		helpers.NotFound(c, "Medicine not found")
		return
	}

	helpers.Success(c, gin.H{"message": "Medicine deleted"})
}

func RefillMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine models.Medicine
	if err := config.DB.Where("id = ?", id).First(&medicine).Error; err != nil {
		helpers.NotFound(c, "Medicine not found")
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	if err := config.DB.Model(&medicine).Update("start_date", today).Error; err != nil {
		helpers.ServerError(c, "Could not refill medicine")
		return
	}

	medicine.StartDate = today
	helpers.Success(c, gin.H{
		"medicine":  medicine,
		"days_left": medicine.DaysLeft(),
		"end_date":  medicine.EndDate(),
		"message":   medicine.Brand + " refilled successfully",
	})
}
