# Quick API Test
$registerBody = '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
$result | ConvertTo-Json -Depth 5
