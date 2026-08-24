$services = @{
    "auth-service" = 8081
    "news-service" = 8082
    "category-service" = 8083
    "search-service" = 8084
    "scheduler-service" = 8085
    "admin-service" = 8086
}

foreach ($name in $services.Keys) {
    $port = $services[$name]
    $url = "http://localhost:$port/v3/api-docs"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $name -> OpenAPI spec found"
        }
    } catch {
        Write-Host "[FAILED] $name -> Could not retrieve spec from $url"
    }
}
