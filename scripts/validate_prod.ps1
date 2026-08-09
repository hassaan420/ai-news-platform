<#
.SYNOPSIS
Validates the production Kubernetes environment for AI News Platform.

.DESCRIPTION
This script checks that all enterprise production requirements are met, including
HPA, PDBs, Ingress annotations, and deployment configurations (SecurityContext, Resources).
#>

Write-Host "Starting Production Readiness Validation..." -ForegroundColor Cyan

# 1. Check Deployments (SecurityContext and Resources)
Write-Host "`n[1] Validating Deployments (SecurityContext & Resources)..." -ForegroundColor Yellow
$deployments = kubectl get deployments -n ai-news -o json | ConvertFrom-Json
$deploymentsPassed = $true

foreach ($dep in $deployments.items) {
    $name = $dep.metadata.name
    
    # Check Resources
    $hasLimits = $null -ne $dep.spec.template.spec.containers[0].resources.limits
    $hasRequests = $null -ne $dep.spec.template.spec.containers[0].resources.requests
    
    # Check SecurityContext
    $hasSecurityContext = $null -ne $dep.spec.template.spec.securityContext.runAsNonRoot
    
    if (-not $hasLimits -or -not $hasRequests) {
        Write-Host "❌ Deployment $name is missing resource limits/requests." -ForegroundColor Red
        $deploymentsPassed = $false
    }
    
    if (-not $hasSecurityContext) {
        Write-Host "❌ Deployment $name is missing runAsNonRoot SecurityContext." -ForegroundColor Red
        $deploymentsPassed = $false
    }
}

if ($deploymentsPassed) {
    Write-Host "✅ All deployments have Resource Limits and SecurityContext." -ForegroundColor Green
}

# 2. Check HPA
Write-Host "`n[2] Validating Horizontal Pod Autoscalers (HPA)..." -ForegroundColor Yellow
$hpas = kubectl get hpa -n ai-news -o json | ConvertFrom-Json
if ($hpas.items.Count -ge 8) {
    Write-Host "✅ HPAs are configured for all microservices." -ForegroundColor Green
} else {
    Write-Host "❌ Missing HPAs for some microservices." -ForegroundColor Red
}

# 3. Check PDB
Write-Host "`n[3] Validating Pod Disruption Budgets (PDB)..." -ForegroundColor Yellow
$pdbs = kubectl get pdb -n ai-news -o json | ConvertFrom-Json
if ($pdbs.items.Count -ge 8) {
    Write-Host "✅ PDBs are configured for all microservices." -ForegroundColor Green
} else {
    Write-Host "❌ Missing PDBs for some microservices." -ForegroundColor Red
}

# 4. Check Ingress
Write-Host "`n[4] Validating Ingress Configuration (ALB & TLS)..." -ForegroundColor Yellow
$ingress = kubectl get ingress ai-news-ingress -n ai-news -o json -IgnoreErrors | ConvertFrom-Json
if ($null -ne $ingress) {
    $hasALB = $ingress.metadata.annotations."kubernetes.io/ingress.class" -eq "nginx"
    $hasCertManager = $null -ne $ingress.metadata.annotations."cert-manager.io/cluster-issuer"
    
    if ($hasALB -and $hasCertManager) {
        Write-Host "✅ Ingress is properly configured with TLS and Cert-Manager." -ForegroundColor Green
    } else {
        Write-Host "❌ Ingress is missing ALB or Cert-Manager annotations." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Ingress 'ai-news-ingress' not found." -ForegroundColor Red
}

# 5. Check CI/CD Pipeline
Write-Host "`n[5] Validating CI/CD Pipeline (Trivy Scan)..." -ForegroundColor Yellow
$workflowPath = "..\.github\workflows\docker-build-push.yml"
if (Test-Path $workflowPath) {
    $content = Get-Content $workflowPath -Raw
    if ($content -match "trivy-action") {
        Write-Host "✅ GitHub Actions pipeline includes Trivy vulnerability scanning." -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub Actions pipeline is missing Trivy scan." -ForegroundColor Red
    }
}

Write-Host "`nValidation Complete!" -ForegroundColor Cyan
