package main

import (
	"log"
	"os"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/handlers"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from system env")
	}

	config.ConnectDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL"), "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Pragya Medical API is running"})
	})

	api := r.Group("/api/v1")

	// Public
	api.POST("/auth/login", handlers.Login)
	api.POST("/auth/register", handlers.Register)

	// Protected
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())
	{
		protected.GET("/patients", handlers.GetPatients)
		protected.POST("/patients", handlers.CreatePatient)
		protected.GET("/patients/:id", handlers.GetPatient)
		protected.PUT("/patients/:id", handlers.UpdatePatient)
		protected.DELETE("/patients/:id", handlers.DeletePatient)
		protected.POST("/patients/:id/medicines", handlers.AddMedicine)
		protected.PUT("/medicines/:id", handlers.UpdateMedicine)
		protected.DELETE("/medicines/:id", handlers.DeleteMedicine)
		protected.POST("/medicines/:id/refill", handlers.RefillMedicine)
		protected.GET("/reminders", handlers.GetReminders)
		protected.PUT("/reminders/:patient_id", handlers.UpdateReminderStatus)
		protected.GET("/invoices", handlers.GetInvoices)
		protected.POST("/invoices", handlers.CreateInvoice)
		protected.GET("/invoices/:id", handlers.GetInvoice)
		protected.PUT("/invoices/:id", handlers.UpdateInvoice)
		protected.GET("/analytics", handlers.GetAnalytics)
		protected.GET("/settings", handlers.GetSettings)
		protected.PUT("/settings", handlers.UpdateSettings)
		// Inventory
		protected.GET("/inventory", handlers.GetInventory)
		protected.GET("/inventory/search", handlers.SearchInventory)
		protected.POST("/inventory", handlers.CreateInventoryItem)
		protected.PUT("/inventory/:id", handlers.UpdateInventoryItem)
		protected.DELETE("/inventory/:id", handlers.DeleteInventoryItem)
		protected.POST("/inventory/:id/stock", handlers.UpdateStock)
		protected.GET("/inventory/:id/movements", handlers.GetStockMovements)
		protected.DELETE("/invoices/:id", handlers.DeleteInvoice)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on http://localhost:%s", port)
	r.Run(":" + port)
}
