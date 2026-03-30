package config

import (
	"log"
	"os"
	"strings"

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

	// Disable prepared statement caching to avoid "already exists" errors with concurrent connections
	if !strings.Contains(dsn, "statement_cache_mode") {
		if strings.Contains(dsn, "?") {
			dsn += "&statement_cache_mode=describe"
		} else {
			dsn += "?statement_cache_mode=describe"
		}
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Info),
		SkipDefaultTransaction: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Connection pool settings — important for serverless later
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get sql.DB:", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)

	DB = db
	log.Println("✅ Database connected successfully")
}
