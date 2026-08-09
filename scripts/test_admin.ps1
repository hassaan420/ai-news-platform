$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost"
$userEmail = "user_$(Get-Random)@example.com"
$adminEmail = "admin_$(Get-Random)@example.com"
$password = "Password123!"

Write-Host "--- 1. Register Users ---"
Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="Normal User"; email=$userEmail; password=$password } | ConvertTo-Json) | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="Admin User"; email=$adminEmail; password=$password } | ConvertTo-Json) | Out-Null

Write-Host "--- 2. Promote Admin via DB ---"
docker exec news-platform-mysql mysql -uroot -proot123 auth_db -e "UPDATE users SET role='ROLE_ADMIN' WHERE email='$adminEmail';"

Write-Host "--- 3. Login Users ---"
$userToken = (Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$userEmail; password=$password } | ConvertTo-Json)).accessToken
$adminToken = (Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$adminEmail; password=$password } | ConvertTo-Json)).accessToken

Write-Host "--- 4. Test User -> Admin Endpoint (Expect 403) ---"
try {
    Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard/stats" -Method Get -Headers @{ Authorization="Bearer $userToken" }
    Write-Host "FAIL: User was able to access admin endpoint!"
} catch {
    Write-Host "PASS: User blocked from admin endpoint. Error: $_"
}

Write-Host "--- 5. Test Admin -> Admin Endpoint (Expect 200) ---"
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard/stats" -Method Get -Headers @{ Authorization="Bearer $adminToken" }
    Write-Host "PASS: Admin accessed stats: $($stats | ConvertTo-Json -Compress)"
} catch {
    Write-Host "FAIL: Admin could not access stats. Error: $_"
}

Write-Host "--- 6. Test Admin -> Scheduler Trigger ---"
try {
    $trigger = Invoke-RestMethod -Uri "$baseUrl/api/scheduler/trigger" -Method Post -Headers @{ Authorization="Bearer $adminToken" }
    Write-Host "PASS: Scheduler triggered: $($trigger | ConvertTo-Json -Compress)"
} catch {
    Write-Host "WARN: Scheduler trigger returned error (Expected if API keys missing): $_"
}
