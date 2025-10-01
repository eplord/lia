# Test Script for Lia API

Write-Host "🧪 Testing Lia Authentication API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Register User
Write-Host "Test 2: Register New User" -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "SecurePass123!"
    name = "Test User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
    $token = $register.data.token
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    $register.data.user | ConvertTo-Json
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Login
Write-Host "Test 3: Login User" -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $login.data.token
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Current User (Protected Route)
Write-Host "Test 4: Get Current User (Protected)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $me = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Got current user!" -ForegroundColor Green
    $me.data.user | ConvertTo-Json
} catch {
    Write-Host "❌ Get user failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing complete!" -ForegroundColor Cyan
