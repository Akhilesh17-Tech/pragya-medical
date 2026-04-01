package handlers

import (
	"fmt"
	"time"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ── GET /api/v1/invoices ─────────────────────────────────────────

func GetInvoices(c *gin.Context) {
	userID := c.GetString("userID")
	status := c.Query("status")        // ?status=purchased_us
	patientID := c.Query("patient_id") // ?patient_id=uuid

	var invoices []models.Invoice
	q := config.DB.
		Where("invoices.user_id = ?", userID).
		Preload("Items").
		Preload("Patient").
		Order("invoices.created_at DESC")

	if status != "" {
		q = q.Where("purchase_status = ?", status)
	}
	if patientID != "" {
		q = q.Where("invoices.patient_id = ?", patientID)
	}

	q.Find(&invoices)
	helpers.SuccessWithMeta(c, invoices, len(invoices))
}

// ── GET /api/v1/invoices/:id ─────────────────────────────────────

func GetInvoice(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var invoice models.Invoice
	if err := config.DB.
		Where("id = ? AND user_id = ?", id, userID).
		Preload("Items").
		Preload("Patient").
		First(&invoice).Error; err != nil {
		helpers.NotFound(c, "Invoice not found")
		return
	}

	helpers.Success(c, invoice)
}

// ── POST /api/v1/invoices ────────────────────────────────────────

type CreateInvoiceInput struct {
	PatientID      string               `json:"patient_id"       binding:"required"`
	Subtotal       float64              `json:"subtotal"`
	Discount       float64              `json:"discount"`
	GrandTotal     float64              `json:"grand_total"`
	PurchaseStatus string               `json:"purchase_status"`
	Purchaser      string               `json:"purchaser"`
	Notes          string               `json:"notes"`
	Items          []models.InvoiceItem `json:"items"`
}

func CreateInvoice(c *gin.Context) {
	userID := c.GetString("userID")

	var input CreateInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	uid, _ := uuid.Parse(userID)
	pid, _ := uuid.Parse(input.PatientID)

	// Auto-generate invoice number: INV-20250328-1234
	invoiceNo := fmt.Sprintf("INV-%s-%d",
		time.Now().Format("20060102"),
		time.Now().UnixMilli()%10000,
	)

	invoice := models.Invoice{
		PatientID:      pid,
		UserID:         uid,
		InvoiceNo:      invoiceNo,
		Subtotal:       input.Subtotal,
		Discount:       input.Discount,
		GrandTotal:     input.GrandTotal,
		PurchaseStatus: input.PurchaseStatus,
		Purchaser:      input.Purchaser,
		Notes:          input.Notes,
	}

	if invoice.PurchaseStatus == "" {
		invoice.PurchaseStatus = "purchased_us"
	}

	if err := config.DB.Create(&invoice).Error; err != nil {
		helpers.ServerError(c, "Could not create invoice")
		return
	}

	// Save line items
	for i := range input.Items {
		input.Items[i].InvoiceID = invoice.ID
	}
	if len(input.Items) > 0 {
		config.DB.Create(&input.Items)
		invoice.Items = input.Items
	}

	helpers.Created(c, invoice)
}

// ── PUT /api/v1/invoices/:id ─────────────────────────────────────

func UpdateInvoice(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var invoice models.Invoice
	if err := config.DB.
		Where("id = ? AND user_id = ?", id, userID).
		First(&invoice).Error; err != nil {
		helpers.NotFound(c, "Invoice not found")
		return
	}

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	delete(updates, "id")
	delete(updates, "user_id")
	delete(updates, "patient_id")
	delete(updates, "invoice_no")
	delete(updates, "created_at")

	config.DB.Model(&invoice).Updates(updates)
	config.DB.Where("id = ?", invoice.ID).Preload("Items").Preload("Patient").First(&invoice)

	helpers.Success(c, invoice)
}

func DeleteInvoice(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")
	result := config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Invoice{})
	if result.RowsAffected == 0 {
		helpers.NotFound(c, "Invoice not found")
		return
	}
	helpers.Success(c, gin.H{"message": "Invoice deleted"})
}
