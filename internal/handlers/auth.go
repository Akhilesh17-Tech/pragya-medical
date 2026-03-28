package handlers

import (
	"os"
	"time"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterInput struct {
	Name         string `json:"name"          binding:"required"`
	Email        string `json:"email"         binding:"required,email"`
	Password     string `json:"password"      binding:"required,min=6"`
	PharmacyName string `json:"pharmacy_name" binding:"required"`
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, "Email and password are required")
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		helpers.BadRequest(c, "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		helpers.BadRequest(c, "Invalid email or password")
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.String(),
		"email":   user.Email,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	})

	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		helpers.ServerError(c, "Could not generate token")
		return
	}

	helpers.Success(c, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":            user.ID,
			"name":          user.Name,
			"email":         user.Email,
			"pharmacy_name": user.PharmacyName,
		},
	})
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	// Check email not already taken
	var existing models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		helpers.BadRequest(c, "Email already registered")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		helpers.ServerError(c, "Could not hash password")
		return
	}

	user := models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: string(hashed),
		PharmacyName: input.PharmacyName,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		helpers.ServerError(c, "Could not create account")
		return
	}

	// Auto-create default settings for new user
	settings := models.Settings{UserID: user.ID}
	config.DB.Create(&settings)

	helpers.Created(c, gin.H{"message": "Account created successfully"})
}
