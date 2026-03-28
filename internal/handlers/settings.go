package handlers

import (
"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
"github.com/gin-gonic/gin"
"github.com/google/uuid"
)

func GetSettings(c *gin.Context) {
userID := c.GetString("userID")

var settings models.Settings
if err := config.DB.Where("user_id = ?", userID).First(&settings).Error; err != nil {
// Auto-create if doesn't exist
uid, _ := uuid.Parse(userID)
settings = models.Settings{UserID: uid}
config.DB.Create(&settings)
}

helpers.Success(c, settings)
}

func UpdateSettings(c *gin.Context) {
userID := c.GetString("userID")

var settings models.Settings
if err := config.DB.Where("user_id = ?", userID).First(&settings).Error; err != nil {
helpers.NotFound(c, "Settings not found")
return
}

var updates map[string]any
if err := c.ShouldBindJSON(&updates); err != nil {
helpers.BadRequest(c, err.Error())
return
}

delete(updates, "id")
delete(updates, "user_id")

config.DB.Model(&settings).Updates(updates)
helpers.Success(c, settings)
}
