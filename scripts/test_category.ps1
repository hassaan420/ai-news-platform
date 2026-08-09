$ErrorActionPreference = "Stop"

Write-Host "--- Fetching Categories ---"
$categories = Invoke-RestMethod -Uri "http://localhost/api/categories" -Method Get
Write-Host "Found $($categories.totalElements) categories."

if ($categories.totalElements -gt 0) {
    Write-Host "--- Fetching Category 1 ---"
    $cat1 = Invoke-RestMethod -Uri "http://localhost/api/categories/1" -Method Get
    Write-Host "Category 1 name: $($cat1.name)"
}
