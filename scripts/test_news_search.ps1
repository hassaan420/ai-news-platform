$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost"
$internalUrl = "http://localhost:8082"
$internalKey = "internal-service-key-2026"

$userEmail = "news_user_$(Get-Random)@example.com"
Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="News User"; email=$userEmail; password="Password123!" } | ConvertTo-Json) | Out-Null
$token = (Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email=$userEmail; password="Password123!" } | ConvertTo-Json)).accessToken

Write-Host "--- 1. Insert Mock Source ---"
docker exec news-platform-mysql mysql -uroot -proot123 news_db -e "INSERT IGNORE INTO sources (id, provider, name, endpoint) VALUES (1, 'mock', 'Mock Provider', 'http://mock');"

Write-Host "--- 2. Create Internal News ---"
$newsBody = @{
    sourceId = 1
    categoryId = 3
    title = "Mock AI Article"
    description = "Mock description about AI"
    content = "Mock content"
    image = "http://example.com/image.jpg"
    url = "http://example.com/mock-article-$(Get-Random)"
    author = "AI Bot"
    language = "en"
    publishedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    hash = [guid]::NewGuid().ToString()
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "$internalUrl/internal/news" -Method Post -ContentType "application/json" -Headers @{ "Internal-Api-Key" = $internalKey } -Body $newsBody
Write-Host "Created article: $($created.title)"

Write-Host "--- 3. Fetch News (Testing Cache / DB) ---"
$news = Invoke-RestMethod -Uri "$baseUrl/api/news?page=0&size=5" -Method Get -Headers @{ Authorization="Bearer $token" }
Write-Host "Found $($news.totalElements) articles in main news feed."

Write-Host "--- 4. Search News (Testing Search Sync) ---"
# Give search-service a second to sync via Redis cache if applicable
Start-Sleep -Seconds 2
$search = Invoke-RestMethod -Uri "$baseUrl/api/news/search?keyword=Mock" -Method Get -Headers @{ Authorization="Bearer $token" }
Write-Host "Search found $($search.totalElements) articles."
