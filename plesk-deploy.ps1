# ============================================================================
# Plesk Windows Server Deployment Script (PowerShell)
# MDDS Project (Node.js Backend + React Frontend)
# ============================================================================
# 
# KullanÄ±m:
#   .\plesk-deploy.ps1 -Scenario "full" -ProjectPath "D:\httpdocs\yourdomain.com\httpdocs"
#
# Ã–ncesi:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#
# ============================================================================

param(
    [ValidateSet('full', 'quick', 'production', 'troubleshoot-node', 'troubleshoot-npm', 'logs', 'disk', 'monitor')]
    [string]$Scenario = 'full',
    
    [string]$ProjectPath = "D:\httpdocs\yourdomain.com\httpdocs",
    
    [string]$StartupFile = "dist\index.js"
)

# ============================================================================
# AYARLAR
# ============================================================================

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Log dosyasÄ±
$LogFile = Join-Path $ProjectPath "deployment.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Renklendirme - Removed custom Write-* functions, using Write-Host directly

# ============================================================================
# FONKSÄ°YONLAR
# ============================================================================

function Test-ProjectDirectory {
    Write-Host "â„¹ Project directory kontrol ediliyor: $ProjectPath" -ForegroundColor Cyan
    
    if (-not (Test-Path $ProjectPath)) {
        Write-Host "âœ— Project directory bulunamadÄ±: $ProjectPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "âœ“ Project directory bulundu" -ForegroundColor Green
    return $true
}

function Stop-NodeProcesses {
    Write-Host "ℹ Node.js processler sonlandÄ±rÄ±lÄ±yor..." -ForegroundColor Cyan
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Node.js processler sonlandÄ±rÄ±ldÄ±" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } else {
            Write-Host "ℹ Ã‡alÄ±ÅŸan Node.js process bulunamadÄ±" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "⚠ Node.js process sonlandÄ±rÄ±lÄ±rken hata: $_" -ForegroundColor Yellow
    }
}

function Restart-IIS {
    Write-Host "ℹ IIS yeniden baÅŸlatÄ±lÄ±yor..." -ForegroundColor Cyan
    
    try {
        & "C:\Windows\System32\inetsrv\iisreset.exe" /restart | Out-Null
        Write-Host "✓ IIS baÅŸarÄ±yla yeniden baÅŸlatÄ±ldÄ±" -ForegroundColor Green
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Host "✗ IIS yeniden baÅŸlatÄ±lÄ±rken hata: $_" -ForegroundColor Red
        exit 1
    }
}

function Install-Dependencies {
    param([bool]$ProductionOnly = $false)
    
    Write-Host "ℹ npm dependencies yÃ¼kleniyor..." -ForegroundColor Cyan
    
    try {
        Set-Location $ProjectPath
        
        if ($ProductionOnly) {
            & npm ci --production
        } else {
            & npm install
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies baÅŸarÄ±yla yÃ¼klendi" -ForegroundColor Green
        } else {
            Write-Host "✗ Dependencies yÃ¼kleme baÅŸarÄ±sÄ±z" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "✗ Dependencies yÃ¼kleme sÄ±rasÄ±nda hata: $_" -ForegroundColor Red
        exit 1
    }
}

function Build-Application {
    Write-Host "ℹ Uygulama build'leniyor..." -ForegroundColor Cyan
    
    try {
        Set-Location $ProjectPath
        & npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Uygulama baÅŸarÄ±yla build edildi" -ForegroundColor Green
        } else {
            Write-Host "✗ Build iÅŸlemi baÅŸarÄ±sÄ±z" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "✗ Build sÄ±rasÄ±nda hata: $_" -ForegroundColor Red
        exit 1
    }
}

function Test-StartupFile {
    Write-Host "ℹ Startup file kontrol ediliyor: $StartupFile" -ForegroundColor Cyan
    
    $startupPath = Join-Path $ProjectPath $StartupFile
    
    if (-not (Test-Path $startupPath)) {
        Write-Host "✗ Startup file bulunamadÄ±: $startupPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Startup file doÄŸrulandÄ±" -ForegroundColor Green
}

function Test-EnvironmentVariables {
    Write-Host "ℹ Environment variables kontrol ediliyor..." -ForegroundColor Cyan
    
    $envFile = Join-Path $ProjectPath ".env"
    
    if (-not (Test-Path $envFile)) {
        Write-Host "⚠ .env dosyasÄ± bulunamadÄ±. Plesk environment variables kullanÄ±lÄ±yor." -ForegroundColor Yellow
    } else {
        Write-Host "✓ .env dosyasÄ± bulundu" -ForegroundColor Green
    }
}

function Clear-NPMCache {
    Write-Host "ℹ npm cache temizleniyor..." -ForegroundColor Cyan
    
    try {
        Set-Location $ProjectPath
        & npm cache clean --force
        Write-Host "✓ npm cache temizlendi" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ npm cache temizleme sÄ±rasÄ±nda hata: $_" -ForegroundColor Yellow
    }
}

function Remove-NodeModules {
    Write-Host "ℹ node_modules klasÃ¶rÃ¼ siliniyor..." -ForegroundColor Cyan
    
    try {
        $nodeModulesPath = Join-Path $ProjectPath "node_modules"
        
        if (Test-Path $nodeModulesPath) {
            Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✓ node_modules silindi" -ForegroundColor Green
        } else {
            Write-Host "ℹ node_modules klasÃ¶rÃ¼ bulunamadÄ±" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "✗ node_modules silinirken hata: $_" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "ℹ ========== DEPLOYMENT LOG ==========" -ForegroundColor Cyan
    
    if (Test-Path $LogFile) {
        Get-Content $LogFile | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "ℹ Deployment log dosyasÄ± bulunamadÄ±" -ForegroundColor Cyan
    }
    
    Write-Info ""
    Write-Host "ℹ ========== iisnode LOG ==========" -ForegroundColor Cyan
    
    $iisNodePath = "$env:SystemDrive\iisnode"
    if (Test-Path $iisNodePath) {
        Get-ChildItem -Path $iisNodePath -Recurse | ForEach-Object { Write-Host $_.FullName }
    } else {
        Write-Host "ℹ iisnode klasÃ¶rÃ¼ bulunamadÄ±" -ForegroundColor Cyan
    }
}

function Show-DiskSpace {
    Write-Host "ℹ ========== DISK SPACE USAGE ==========" -ForegroundColor Cyan
    
    Get-Volume | Select-Object DriveLetter, Size, SizeRemaining | Format-Table -AutoSize
}

function Show-NodeProcesses {
    Write-Host "ℹ ========== NODE.JS PROCESSES ==========" -ForegroundColor Cyan
    
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | 
            Select-Object ProcessId, Name, Memory, CPU | 
            Format-Table -AutoSize
    }
    catch {
        Write-Host "ℹ Ã‡alÄ±ÅŸan Node.js process bulunamadÄ±" -ForegroundColor Cyan
    }
}

function Show-IISStatus {
    Write-Host "ℹ ========== IIS APPLICATION POOLS ==========" -ForegroundColor Cyan
    
    try {
        & "C:\Windows\System32\inetsrv\appcmd.exe" list apppool
        Write-Info ""
        Write-Host "ℹ ========== IIS WEBSITES ==========" -ForegroundColor Cyan
        & "C:\Windows\System32\inetsrv\appcmd.exe" list site
    }
    catch {
        Write-Host "✗ IIS status gÃ¶sterilirken hata: $_" -ForegroundColor Red
    }
}

# ============================================================================
# DEPLOYMENT SCENARYOLARI
# ============================================================================

function Invoke-FullDeployment {
    Write-Host "ℹ ========== TAM DEPLOYMENT BAÅžLIYOR ==========" -ForegroundColor Cyan
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== TAM DEPLOYMENT BAÅžARIYLA TAMAMLANDI ==========" -ForegroundColor Green
}

function Invoke-QuickBuild {
    Write-Host "ℹ ========== HIZLI BUILD BAÅžLIYOR (npm install atlanÄ±yor) ==========" -ForegroundColor Cyan
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== HIZLI BUILD BAÅžARIYLA TAMAMLANDI ==========" -ForegroundColor Green
}

function Invoke-ProductionBuild {
    Write-Host "ℹ ========== PRODUCTION BUILD BAÅžLIYOR ==========" -ForegroundColor Cyan
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $true
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== PRODUCTION BUILD BAÅžARIYLA TAMAMLANDI ==========" -ForegroundColor Green
}

function Invoke-TroubleshootNode {
    Write-Host "ℹ ========== NODE.JS TROUBLESHOOTING ==========" -ForegroundColor Cyan
    
    Show-NodeProcesses
    Write-Host "ℹ Node.js processler sonlandÄ±rÄ±lÄ±yor..." -ForegroundColor Cyan
    Stop-NodeProcesses
    Restart-IIS
    Write-Host "✓ Troubleshooting tamamlandÄ±" -ForegroundColor Green
}

function Invoke-TroubleshootNPM {
    Write-Host "ℹ ========== NPM TROUBLESHOOTING ==========" -ForegroundColor Cyan
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Clear-NPMCache
    Remove-NodeModules
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ NPM Troubleshooting tamamlandÄ±" -ForegroundColor Green
}

# ============================================================================
# MAIN
# ============================================================================

try {
    # Scenario'yu Ã§alÄ±ÅŸtÄ±r
    switch ($Scenario) {
        'full' {
            Invoke-FullDeployment
        }
        'quick' {
            Invoke-QuickBuild
        }
        'production' {
            Invoke-ProductionBuild
        }
        'troubleshoot-node' {
            Invoke-TroubleshootNode
        }
        'troubleshoot-npm' {
            Invoke-TroubleshootNPM
        }
        'logs' {
            Show-Logs
        }
        'disk' {
            Show-DiskSpace
        }
        'monitor' {
            Show-NodeProcesses
            Show-IISStatus
        }
        default {
            Write-Host "✗ Bilinmeyen scenario: $Scenario" -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "✗ Deployment sÄ±rasÄ±nda hata oluÅŸtu: $_" -ForegroundColor Red
    exit 1
}
finally {
    Write-Host "ℹ Deployment script tamamlandÄ±" -ForegroundColor Cyan
}

