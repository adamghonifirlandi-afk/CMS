# CMS Demo — local smoke test (PowerShell)
# Usage: from backend folder: .\scripts\smoke-test.ps1

$baseUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:8080" }
$demoEmail = if ($env:DEMO_USER_EMAIL) { $env:DEMO_USER_EMAIL } else { "demo@example.com" }
$demoPassword = $env:DEMO_USER_PASSWORD

Write-Host "=== CMS Smoke Test ===" -ForegroundColor Cyan
Write-Host "API: $baseUrl"

$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Block
    )
    try {
        & $Block
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:results += @{ Name = $Name; Status = "PASS" }
    } catch {
        Write-Host "[FAIL] $Name — $($_.Exception.Message)" -ForegroundColor Red
        $script:results += @{ Name = $Name; Status = "FAIL" }
    }
}

Test-Endpoint "Health check" {
    $res = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($res.status -ne "ok") { throw "Unexpected health response" }
}

Test-Endpoint "Plans (public)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/plans/plans" -Method Get
    if (-not $res) { throw "No plans response" }
}

if ($demoPassword) {
    Test-Endpoint "Demo login" {
        $body = @{ email = $demoEmail; password = $demoPassword } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
        if (-not $res.token) { throw "No token returned" }
        $script:token = $res.token
    }

    if ($script:token) {
        Test-Endpoint "Organizations (auth)" {
            $headers = @{ Authorization = "Bearer $script:token" }
            $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/organizations" -Method Get -Headers $headers
            if (-not $res) { throw "No organizations response" }
        }

        Test-Endpoint "Projects (auth)" {
            $headers = @{ Authorization = "Bearer $script:token" }
            $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/projects" -Method Get -Headers $headers
            if (-not $res) { throw "No projects response" }
        }
    }
} else {
    Write-Host "[SKIP] Demo login — set DEMO_USER_PASSWORD env var" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
$results | ForEach-Object { Write-Host "$($_.Status)  $($_.Name)" }
