$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost"
$randomId = Get-Random
$email = "user$randomId@example.com"
$password = "Password123!"

Write-Host "--- 1. Register ---"
$regBody = @{
    name = "E2E User $randomId"
    email = $email
    password = $password
} | ConvertTo-Json

$regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "Registered user ID: $($regResponse.id)"

Write-Host "`n--- 2. Login ---"
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResponse.accessToken
$refreshToken = $loginResponse.refreshToken
Write-Host "Got JWT: $($token.Substring(0, 15))..."

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n--- 3. Fetch News ---"
$newsResponse = Invoke-RestMethod -Uri "$baseUrl/api/news?page=0&size=5" -Method Get -Headers $headers
Write-Host "Found $($newsResponse.totalElements) news articles."

Write-Host "`n--- 4. Search ---"
try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/api/news/search?keyword=test" -Method Get -Headers $headers
    Write-Host "Search results: $($searchResponse.totalElements)"
} catch {
    Write-Host "Search failed: $_"
}

Write-Host "`n--- 5. Categories ---"
try {
    $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method Get -Headers $headers
    Write-Host "Found $($categoryResponse.Count) categories."
} catch {
    Write-Host "Categories failed: $_"
}

Write-Host "`n--- 6. Logout ---"
$logoutBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method Post -ContentType "application/json" -Body $logoutBody -Headers $headers
Write-Host "Logout successful!"
