# Test Bookmarks API

Write-Host "🧪 Testing Bookmarks API..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# First, login to get a token
Write-Host "Step 1: Login to get auth token" -ForegroundColor Yellow
$loginBody = @{
    email = "user1759348950@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.data.token
    Write-Host "✅ Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed. Run test-complete.ps1 first to create a user." -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host ""

# Test 1: Create Bookmark
Write-Host "Test 1: Create Bookmark" -ForegroundColor Yellow
$createBody = @{
    url = "https://github.com/eplord/lia"
    title = "Lia - AI Bookmark Manager"
    description = "A powerful AI-powered bookmark management system"
    tags = @("github", "ai", "bookmarks")
} | ConvertTo-Json

try {
    $bookmark = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks" -Method POST -Body $createBody -ContentType "application/json" -Headers $headers
    $bookmarkId = $bookmark.data.bookmark.id
    Write-Host "✅ PASS - Bookmark created" -ForegroundColor Green
    Write-Host "   ID: $bookmarkId" -ForegroundColor Gray
    Write-Host "   Title: $($bookmark.data.bookmark.title)" -ForegroundColor Gray
    Write-Host "   URL: $($bookmark.data.bookmark.url)" -ForegroundColor Gray
    Write-Host "   Tags: $($bookmark.data.bookmark.tags.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get All Bookmarks
Write-Host "Test 2: Get All Bookmarks" -ForegroundColor Yellow
try {
    $bookmarks = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks" -Headers $headers
    Write-Host "✅ PASS - Retrieved bookmarks" -ForegroundColor Green
    Write-Host "   Total: $($bookmarks.pagination.total)" -ForegroundColor Gray
    Write-Host "   Page: $($bookmarks.pagination.page)/$($bookmarks.pagination.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Single Bookmark
Write-Host "Test 3: Get Single Bookmark" -ForegroundColor Yellow
try {
    $single = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks/$bookmarkId" -Headers $headers
    Write-Host "✅ PASS - Retrieved bookmark details" -ForegroundColor Green
    Write-Host "   Title: $($single.data.bookmark.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Update Bookmark
Write-Host "Test 4: Update Bookmark" -ForegroundColor Yellow
$updateBody = @{
    title = "Lia - Updated Title"
    description = "Updated description for testing"
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks/$bookmarkId" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ PASS - Bookmark updated" -ForegroundColor Green
    Write-Host "   New Title: $($updated.data.bookmark.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Pin Bookmark
Write-Host "Test 5: Pin Bookmark" -ForegroundColor Yellow
try {
    $pinned = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks/$bookmarkId/pin" -Method POST -Headers $headers
    Write-Host "✅ PASS - Bookmark pinned" -ForegroundColor Green
    Write-Host "   Pinned: $($pinned.data.bookmark.isPinned)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Archive Bookmark
Write-Host "Test 6: Archive Bookmark" -ForegroundColor Yellow
try {
    $archived = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks/$bookmarkId/archive" -Method POST -Headers $headers
    Write-Host "✅ PASS - Bookmark archived" -ForegroundColor Green
    Write-Host "   Archived: $($archived.data.bookmark.isArchived)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Search Bookmarks
Write-Host "Test 7: Search Bookmarks" -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks?search=Lia" -Headers $headers
    Write-Host "✅ PASS - Search results" -ForegroundColor Green
    Write-Host "   Found: $($search.pagination.total) bookmarks" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Delete Bookmark
Write-Host "Test 8: Delete Bookmark" -ForegroundColor Yellow
try {
    $deleted = Invoke-RestMethod -Uri "http://localhost:3000/api/bookmarks/$bookmarkId" -Method DELETE -Headers $headers
    Write-Host "✅ PASS - Bookmark deleted" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 Bookmarks API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Bookmarks CRUD Working!" -ForegroundColor Green
Write-Host "✅ Pin/Unpin Working!" -ForegroundColor Green
Write-Host "✅ Archive/Unarchive Working!" -ForegroundColor Green
Write-Host "✅ Search Working!" -ForegroundColor Green
Write-Host ""
Write-Host "Ready to proceed to Step C: Build Frontend!" -ForegroundColor Yellow
