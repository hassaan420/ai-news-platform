$ErrorActionPreference = "Stop"

Write-Host "--- Registering Admin ---"
$adminEmail = "admin_$(Get-Random)@example.com"
docker exec news-platform-mysql mysql -uroot -proot123 auth_db -e "INSERT INTO users (email, password, name, role) VALUES ('$adminEmail', '\$2a\$10\$gU.xJ5q.2E6u3lR5qX0Vv..QG4Q9E5yJp3uN5x5U1b/G7/M4B2H7K', 'Admin User', 'ROLE_ADMIN');"

$token = (Invoke-RestMethod -Uri "http://localhost/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$adminEmail; password="password" } | ConvertTo-Json)).accessToken

Write-Host "--- Triggering Scheduler ---"
$trigger = Invoke-RestMethod -Uri "http://localhost/api/scheduler/trigger" -Method Post -Headers @{ Authorization="Bearer $token" }
Write-Host "Trigger response: $trigger"

Start-Sleep -Seconds 2

Write-Host "--- Fetching Logs from DB ---"
docker exec news-platform-mysql mysql -uroot -proot123 news_db -e "SELECT id, status, articles_stored, error_message FROM fetch_logs ORDER BY id DESC LIMIT 1;"
