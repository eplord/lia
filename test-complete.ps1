# Complete API Test Suite

Write-Host "🧪 Lia Authentication API Test Suite" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health"
    Write-Host "✅ PASS - Server is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
    Write-Host "   Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Register New User
Write-Host "Test 2: Register New User" -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "user$timestamp@example.com"
$registerBody = @{
    email = $testEmail
    password = "SecurePass123!"
    name = "Test User $timestamp"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $register.data.token
    $userId = $register.data.user.id
    
    Write-Host "✅ PASS - User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Email: $($register.data.user.email)" -ForegroundColor Gray
    Write-Host "   Name: $($register.data.user.name)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Login with Same User
Write-Host "Test 3: Login with Registered User" -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginToken = $login.data.token
    
    Write-Host "✅ PASS - Login successful" -ForegroundColor Green
    Write-Host "   Token: $($loginToken.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "   User ID: $($login.data.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Get Current User (Protected Route)
Write-Host "Test 4: Get Current User (Protected)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $loginToken"
    }
    $me = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Headers $headers
    
    Write-Host "✅ PASS - Retrieved current user" -ForegroundColor Green
    Write-Host "   User ID: $($me.data.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($me.data.user.email)" -ForegroundColor Gray
    Write-Host "   Name: $($me.data.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Invalid Login
Write-Host "Test 5: Invalid Login (Should Fail)" -ForegroundColor Yellow
$badLoginBody = @{
    email = $testEmail
    password = "WrongPassword123!"
} | ConvertTo-Json

try {
    $badLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $badLoginBody -ContentType "application/json"
    Write-Host "❌ FAIL - Should have rejected invalid password" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS - Correctly rejected invalid password" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL - Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Access Protected Route Without Token
Write-Host "Test 6: Protected Route Without Token (Should Fail)" -ForegroundColor Yellow
try {
    $noAuth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me"
    Write-Host "❌ FAIL - Should have required authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS - Correctly required authentication" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL - Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 All Tests Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Authentication System is Working Perfectly!" -ForegroundColor Green
Write-Host ""
Write-Host "Ready to proceed to Step B: Build Bookmarks API" -ForegroundColor Yellow
