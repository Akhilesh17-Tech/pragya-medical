package models

import (
"time"

"github.com/google/uuid"
)

type ReminderLog struct {
ID        uuid.UUID `json:"id"         gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
PatientID uuid.UUID `json:"patient_id" gorm:"type:uuid;not null"`
UserID    uuid.UUID `json:"user_id"    gorm:"type:uuid;not null"`
Channel   string    `json:"channel"    gorm:"default:whatsapp"`
Status    string    `json:"status"     gorm:"default:sent"`
SentAt    time.Time `json:"sent_at"    gorm:"default:now()"`
}
