# Test Collections API
Write-Host "🧪 Testing Collections API..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login to get auth token" -ForegroundColor Yellow
$loginBody = @{
    email = "user1759349988@example.com"
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

$ts = (Get-Date).Ticks
$passed = 0
$failed = 0

Write-Host ""

# Test 1: Create Root Collection
Write-Host "Test 1: Create Root Collection" -ForegroundColor Yellow
$createBody = @{
    name = "Work_$ts"
    description = "Work bookmarks"
    icon = "💼"
    color = "#3B82F6"
} | ConvertTo-Json

try {
    $coll = Invoke-RestMethod -Uri "http://localhost:3000/api/collections" -Method POST -Body $createBody -ContentType "application/json" -Headers $headers
    $rootId = $coll.data.collection.id
    Write-Host "✅ PASS - Collection created" -ForegroundColor Green
    Write-Host "   ID: $rootId" -ForegroundColor Gray
    Write-Host "   Name: $($coll.data.collection.name)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
    exit 1
}

Write-Host ""

# Test 2: Create Child Collection
Write-Host "Test 2: Create Child Collection" -ForegroundColor Yellow
$childBody = @{
    name = "Projects_$ts"
    description = "Development projects"
    icon = "📁"
    color = "#8B5CF6"
    parentId = $rootId
} | ConvertTo-Json

try {
    $child = Invoke-RestMethod -Uri "http://localhost:3000/api/collections" -Method POST -Body $childBody -ContentType "application/json" -Headers $headers
    $childId = $child.data.collection.id
    Write-Host "✅ PASS - Child collection created" -ForegroundColor Green
    Write-Host "   ID: $childId" -ForegroundColor Gray
    Write-Host "   Parent ID: $($child.data.collection.parentId)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 3: Get All Collections
Write-Host "Test 3: Get All Collections" -ForegroundColor Yellow
try {
    $colls = Invoke-RestMethod -Uri "http://localhost:3000/api/collections" -Headers $headers
    Write-Host "✅ PASS - Retrieved collections" -ForegroundColor Green
    Write-Host "   Total: $($colls.data.Count)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 4: Get Collection Tree
Write-Host "Test 4: Get Collection Tree" -ForegroundColor Yellow
try {
    $tree = Invoke-RestMethod -Uri "http://localhost:3000/api/collections/tree" -Headers $headers
    Write-Host "✅ PASS - Retrieved tree structure" -ForegroundColor Green
    Write-Host "   Root collections: $($tree.data.Count)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 5: Get Collection by ID
Write-Host "Test 5: Get Collection by ID" -ForegroundColor Yellow
try {
    $single = Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$rootId" -Headers $headers
    Write-Host "✅ PASS - Retrieved collection" -ForegroundColor Green
    Write-Host "   Name: $($single.data.collection.name)" -ForegroundColor Gray
    Write-Host "   Children: $($single.data.collection.children.Count)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 6: Update Collection
Write-Host "Test 6: Update Collection" -ForegroundColor Yellow
$updateBody = @{
    name = "Work_Updated_$ts"
    description = "Updated description"
    color = "#EF4444"
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$rootId" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ PASS - Collection updated" -ForegroundColor Green
    Write-Host "   New name: $($updated.data.collection.name)" -ForegroundColor Gray
    Write-Host "   New color: $($updated.data.collection.color)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 7: Toggle Pin
Write-Host "Test 7: Toggle Pin" -ForegroundColor Yellow
try {
    $pinned = Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$rootId/pin" -Method POST -Headers $headers
    Write-Host "✅ PASS - Pinned collection" -ForegroundColor Green
    Write-Host "   isPinned: $($pinned.data.collection.isPinned)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 8: Get Stats
Write-Host "Test 8: Get Collection Stats" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$rootId/stats" -Headers $headers
    Write-Host "✅ PASS - Retrieved stats" -ForegroundColor Green
    Write-Host "   Bookmark count: $($stats.data.bookmarkCount)" -ForegroundColor Gray
    Write-Host "   Children count: $($stats.data.childrenCount)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 9: Delete Child Collection
Write-Host "Test 9: Delete Child Collection" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$childId" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ PASS - Child collection deleted" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 10: Delete Parent Collection
Write-Host "Test 10: Delete Parent Collection" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/collections/$rootId" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ PASS - Parent collection deleted" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 Tests Complete!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ All Collections API tests passed!" -ForegroundColor Green
    exit 0
} else {
    exit 1
}
