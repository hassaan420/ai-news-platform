$ErrorActionPreference = "Stop"

$userEmail = "admin_user_$(Get-Random)@example.com"
Invoke-RestMethod -Uri "http://localhost/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="Admin User"; email=$userEmail; password="Password123!" } | ConvertTo-Json) | Out-Null

docker exec news-platform-mysql mysql -uroot -proot123 auth_db -e "UPDATE users SET role='ROLE_ADMIN' WHERE email='$userEmail';"

$token = (Invoke-RestMethod -Uri "http://localhost/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$userEmail; password="Password123!" } | ConvertTo-Json)).accessToken

Write-Host "--- Triggering Scheduler ---"
$trigger = Invoke-RestMethod -Uri "http://localhost/api/scheduler/trigger" -Method Post -Headers @{ Authorization="Bearer $token" }
Write-Host "Trigger response: $trigger"

Start-Sleep -Seconds 2

Write-Host "--- Fetching Logs from DB ---"
docker exec news-platform-mysql mysql -uroot -proot123 news_db -e "SELECT id, status, articles_stored, error_message FROM fetch_logs ORDER BY id DESC LIMIT 1;"
