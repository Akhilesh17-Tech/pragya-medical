package middleware

import (
"os"
"strings"

"github.com/gin-gonic/gin"
"github.com/golang-jwt/jwt/v5"
"github.com/Akhilesh17-Tech/pragya-medical/internal/helpers"
)

type Claims struct {
UserID string `json:"user_id"`
Email  string `json:"email"`
jwt.RegisteredClaims
}

func AuthRequired() gin.HandlerFunc {
return func(c *gin.Context) {
authHeader := c.GetHeader("Authorization")

if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
helpers.Unauthorized(c)
c.Abort()
return
}

tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
claims := &Claims{}

token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
return []byte(os.Getenv("JWT_SECRET")), nil
})

if err != nil || !token.Valid {
helpers.Unauthorized(c)
c.Abort()
return
}

// Store userID in context — handlers read it with c.GetString("userID")
c.Set("userID", claims.UserID)
c.Next()
}
}
