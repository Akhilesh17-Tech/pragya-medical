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

	var input models.Medicine
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	pid, err := uuid.Parse(patientID)
	if err != nil {
		helpers.BadRequest(c, "Invalid patient ID")
		return
	}

	input.PatientID = pid
	if input.StartDate.IsZero() {
		input.StartDate = time.Now().Truncate(24 * time.Hour)
	}

	if err := config.DB.Create(&input).Error; err != nil {
		helpers.ServerError(c, "Could not add medicine")
		return
	}

	helpers.Created(c, gin.H{
		"medicine":  input,
		"days_left": input.DaysLeft(),
		"end_date":  input.EndDate(),
	})
}

func UpdateMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine models.Medicine
	if err := config.DB.Where("id = ?", id).First(&medicine).Error; err != nil {
		helpers.NotFound(c, "Medicine not found")
		return
	}

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	delete(updates, "id")
	delete(updates, "patient_id")
	delete(updates, "created_at")

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
