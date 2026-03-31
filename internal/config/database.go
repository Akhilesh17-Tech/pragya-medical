package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set in .env")
	}

	// Add prefer_simple_protocol to disable prepared statements
	// This is required for Supabase which uses PgBouncer pooling
	if len(dsn) > 0 {
		if dsn[len(dsn)-1] == '/' {
			dsn = dsn + "?prefer_simple_protocol=true"
		} else {
			// Check if query params already exist
			hasParams := false
			for _, c := range dsn {
				if c == '?' {
					hasParams = true
					break
				}
			}
			if hasParams {
				dsn = dsn + "&prefer_simple_protocol=true"
			} else {
				dsn = dsn + "?prefer_simple_protocol=true"
			}
		}
	}

	fmt.Println("Connecting to database...")

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // disables prepared statements
	}), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Info),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get sql.DB:", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)

	DB = db
	log.Println("✅ Database connected successfully")
}
