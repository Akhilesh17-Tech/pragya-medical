package main

import (
	"log"
	"os"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from system env")
	}

	// Connect DB
	config.ConnectDB()

	// Router
	r := gin.Default()

	// CORS — allow frontend to call this API
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL"), "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check — test this first
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Pragya Medical API is running",
		})
	})

	// All routes under /api/v1
	api := r.Group("/api/v1")

	// Public routes (no auth needed)
	api.POST("/auth/login", authLogin)
	api.POST("/auth/register", authRegister)

	// Protected routes (JWT required)
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())
	{
		// Patients
		protected.GET("/patients", getPatients)
		protected.POST("/patients", createPatient)
		protected.GET("/patients/:id", getPatient)
		protected.PUT("/patients/:id", updatePatient)
		protected.DELETE("/patients/:id", deletePatient)

		// Medicines
		protected.POST("/patients/:id/medicines", addMedicine)
		protected.PUT("/medicines/:id", updateMedicine)
		protected.DELETE("/medicines/:id", deleteMedicine)
		protected.POST("/medicines/:id/refill", refillMedicine)

		// Reminders
		protected.GET("/reminders", getReminders)
		protected.PUT("/reminders/:patient_id", updateReminderStatus)

		// Invoices
		protected.GET("/invoices", getInvoices)
		protected.POST("/invoices", createInvoice)
		protected.GET("/invoices/:id", getInvoice)
		protected.PUT("/invoices/:id", updateInvoice)

		// Analytics
		protected.GET("/analytics", getAnalytics)

		// Settings
		protected.GET("/settings", getSettings)
		protected.PUT("/settings", updateSettings)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s", port)
	r.Run(":" + port)
}

// Placeholder functions — we replace these one by one next
func authLogin(c *gin.Context)            {}
func authRegister(c *gin.Context)         {}
func getPatients(c *gin.Context)          {}
func createPatient(c *gin.Context)        {}
func getPatient(c *gin.Context)           {}
func updatePatient(c *gin.Context)        {}
func deletePatient(c *gin.Context)        {}
func addMedicine(c *gin.Context)          {}
func updateMedicine(c *gin.Context)       {}
func deleteMedicine(c *gin.Context)       {}
func refillMedicine(c *gin.Context)       {}
func getReminders(c *gin.Context)         {}
func updateReminderStatus(c *gin.Context) {}
func getInvoices(c *gin.Context)          {}
func createInvoice(c *gin.Context)        {}
func getInvoice(c *gin.Context)           {}
func updateInvoice(c *gin.Context)        {}
func getAnalytics(c *gin.Context)         {}
func getSettings(c *gin.Context)          {}
func updateSettings(c *gin.Context)       {}
