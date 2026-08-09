$ErrorActionPreference = "Stop"

Write-Host "--- Clearing Redis Cache ---"
docker exec news-platform-redis redis-cli FLUSHALL

$userEmail = "search_test_$(Get-Random)@example.com"
Invoke-RestMethod -Uri "http://localhost/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="Search Test"; email=$userEmail; password="Password123!" } | ConvertTo-Json) | Out-Null
$token = (Invoke-RestMethod -Uri "http://localhost/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$userEmail; password="Password123!" } | ConvertTo-Json)).accessToken

Write-Host "--- Searching for 'Mock' ---"
$search = Invoke-RestMethod -Uri "http://localhost/api/news/search?keyword=Mock" -Method Get -Headers @{ Authorization="Bearer $token" }
Write-Host "Search for Mock found $($search.totalElements) articles."

Write-Host "--- Searching for 'AI' ---"
$search2 = Invoke-RestMethod -Uri "http://localhost/api/news/search?keyword=AI" -Method Get -Headers @{ Authorization="Bearer $token" }
Write-Host "Search for AI found $($search2.totalElements) articles."
