package handlers

import (
	"strings"
	"time"

	"github.com/Akhilesh17-Tech/pragya-medical/internal/config"
	"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ── Models ────────────────────────────────────────────────────────

type Inventory struct {
	ID            uuid.UUID `json:"id"               gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID        uuid.UUID `json:"user_id"          gorm:"type:uuid;not null"`
	Brand         string    `json:"brand"            gorm:"not null"`
	Composition   string    `json:"composition"`
	Company       string    `json:"company"`
	Strength      string    `json:"strength"`
	DosageForm    string    `json:"dosage_form"      gorm:"default:tablet"`
	Category      string    `json:"category"`
	CurrentStock  float64   `json:"current_stock"    gorm:"default:0"`
	MinStockAlert float64   `json:"min_stock_alert"  gorm:"default:10"`
	Unit          string    `json:"unit"             gorm:"default:tablets"`
	PurchasePrice float64   `json:"purchase_price"   gorm:"default:0"`
	SellingPrice  float64   `json:"selling_price"    gorm:"default:0"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type StockMovement struct {
	ID          uuid.UUID  `json:"id"           gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	InventoryID uuid.UUID  `json:"inventory_id" gorm:"type:uuid;not null"`
	UserID      uuid.UUID  `json:"user_id"      gorm:"type:uuid;not null"`
	Type        string     `json:"type"`
	Quantity    float64    `json:"quantity"`
	Reason      string     `json:"reason"`
	PatientID   *uuid.UUID `json:"patient_id"   gorm:"type:uuid"`
	InvoiceID   *uuid.UUID `json:"invoice_id"   gorm:"type:uuid"`
	Notes       string     `json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (Inventory) TableName() string     { return "inventory" }
func (StockMovement) TableName() string { return "stock_movements" }

// ── GET /api/v1/inventory ─────────────────────────────────────────

func GetInventory(c *gin.Context) {
	userID := c.GetString("userID")
	search := c.Query("search")
	category := c.Query("category")
	lowStock := c.Query("low_stock")

	var items []Inventory
	q := config.DB.Where("user_id = ?", userID).Order("brand ASC")

	if search != "" {
		like := "%" + search + "%"
		q = q.Where("brand ILIKE ? OR composition ILIKE ? OR company ILIKE ?", like, like, like)
	}
	if category != "" && category != "All" {
		q = q.Where("category = ?", category)
	}
	if lowStock == "true" {
		q = q.Where("current_stock <= min_stock_alert")
	}

	q.Find(&items)

	// Add low_stock flag
	type ItemWithFlag struct {
		Inventory
		LowStock bool `json:"low_stock"`
	}
	result := make([]ItemWithFlag, len(items))
	for i, item := range items {
		result[i] = ItemWithFlag{
			Inventory: item,
			LowStock:  item.CurrentStock <= item.MinStockAlert,
		}
	}
	helpers.SuccessWithMeta(c, result, len(result))
}

// ── GET /api/v1/inventory/search?q=norv ──────────────────────────
// Used for autocomplete in Add Patient / Add Medicine forms

func SearchInventory(c *gin.Context) {
	userID := c.GetString("userID")
	q := c.Query("q")
	field := c.DefaultQuery("field", "brand") // brand or composition

	if len(q) < 2 {
		helpers.Success(c, []interface{}{})
		return
	}

	like := "%" + strings.ToLower(q) + "%"
	var items []Inventory

	if field == "composition" {
		config.DB.Where("user_id = ? AND LOWER(composition) LIKE ?", userID, like).
			Order("composition ASC").Limit(8).Find(&items)
	} else {
		config.DB.Where("user_id = ? AND LOWER(brand) LIKE ?", userID, like).
			Order("brand ASC").Limit(8).Find(&items)
	}

	helpers.Success(c, items)
}

// ── POST /api/v1/inventory ────────────────────────────────────────

func CreateInventoryItem(c *gin.Context) {
	userID := c.GetString("userID")
	uid, _ := uuid.Parse(userID)

	var input Inventory
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}
	input.ID = uuid.Nil
	input.UserID = uid

	if err := config.DB.Create(&input).Error; err != nil {
		helpers.ServerError(c, "Could not create inventory item")
		return
	}
	helpers.Created(c, input)
}

// ── PUT /api/v1/inventory/:id ─────────────────────────────────────

func UpdateInventoryItem(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var item Inventory
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		helpers.NotFound(c, "Item not found")
		return
	}

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}
	delete(updates, "id")
	delete(updates, "user_id")
	delete(updates, "created_at")

	config.DB.Model(&item).Updates(updates)
	config.DB.Where("id = ?", item.ID).First(&item)
	helpers.Success(c, item)
}

// ── DELETE /api/v1/inventory/:id ─────────────────────────────────

func DeleteInventoryItem(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	result := config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&Inventory{})
	if result.RowsAffected == 0 {
		helpers.NotFound(c, "Item not found")
		return
	}
	helpers.Success(c, gin.H{"message": "Item deleted"})
}

// ── POST /api/v1/inventory/:id/stock ─────────────────────────────
// Add or deduct stock

func UpdateStock(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")
	uid, _ := uuid.Parse(userID)

	var input struct {
		Type     string  `json:"type"` // add | deduct | adjustment
		Quantity float64 `json:"quantity"`
		Reason   string  `json:"reason"`
		Notes    string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.BadRequest(c, err.Error())
		return
	}

	var item Inventory
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		helpers.NotFound(c, "Item not found")
		return
	}

	// Update stock
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		switch input.Type {
		case "add":
			item.CurrentStock += input.Quantity
		case "deduct":
			if item.CurrentStock < input.Quantity {
				return nil // allow negative — just warn
			}
			item.CurrentStock -= input.Quantity
		case "adjustment":
			item.CurrentStock = input.Quantity
		}
		if err := tx.Save(&item).Error; err != nil {
			return err
		}

		invID, _ := uuid.Parse(id)
		movement := StockMovement{
			InventoryID: invID,
			UserID:      uid,
			Type:        input.Type,
			Quantity:    input.Quantity,
			Reason:      input.Reason,
			Notes:       input.Notes,
		}
		return tx.Create(&movement).Error
	})

	if err != nil {
		helpers.ServerError(c, "Failed to update stock")
		return
	}

	helpers.Success(c, gin.H{
		"current_stock": item.CurrentStock,
		"low_stock":     item.CurrentStock <= item.MinStockAlert,
		"message":       "Stock updated",
	})
}

// ── GET /api/v1/inventory/:id/movements ──────────────────────────

func GetStockMovements(c *gin.Context) {
	id := c.Param("id")

	var movements []StockMovement
	config.DB.Where("inventory_id = ?", id).Order("created_at DESC").Limit(50).Find(&movements)
	helpers.Success(c, movements)
}
