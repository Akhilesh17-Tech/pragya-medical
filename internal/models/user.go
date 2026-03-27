package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"            gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name         string    `json:"name"          gorm:"not null"`
	Email        string    `json:"email"         gorm:"uniqueIndex;not null"`
	PasswordHash string    `json:"-"             gorm:"column:password_hash;not null"`
	PharmacyName string    `json:"pharmacy_name" gorm:"default:Pragya Medical"`
	CreatedAt    time.Time `json:"created_at"`
}
