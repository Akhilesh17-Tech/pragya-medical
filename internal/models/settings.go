package models

import (
"time"

"github.com/google/uuid"
)

type Settings struct {
ID                uuid.UUID `json:"id"                  gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
UserID            uuid.UUID `json:"user_id"             gorm:"type:uuid;not null;uniqueIndex"`
AutoReminderOn    bool      `json:"auto_reminder_on"    gorm:"default:true"`
RemindBeforeDays  int       `json:"remind_before_days"  gorm:"default:5"`
ReminderMode      string    `json:"reminder_mode"       gorm:"default:whatsapp"`
ReminderTime      string    `json:"reminder_time"       gorm:"default:morning"`
DailyAuto         bool      `json:"daily_auto"          gorm:"default:true"`
ScheduledTime     string    `json:"scheduled_time"      gorm:"default:'09:00'"`
WaTemplate        string    `json:"wa_template"         gorm:"default:'Namaste {name} ji'"`
UpdatedAt         time.Time `json:"updated_at"`
}
