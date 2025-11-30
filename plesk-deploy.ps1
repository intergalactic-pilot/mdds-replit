# ============================================================================
# Plesk Windows Server Deployment Script (PowerShell)
# MDDS Project (Node.js Backend + React Frontend)
# ============================================================================
# 
# Kullanım:
#   .\plesk-deploy.ps1 -Scenario "full" -ProjectPath "D:\httpdocs\yourdomain.com\httpdocs"
#
# Öncesi:
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

# Log dosyası
$LogFile = Join-Path $ProjectPath "deployment.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Renklendirme
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] SUCCESS: $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message"
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] INFO: $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message"
}

# ============================================================================
# FONKSİYONLAR
# ============================================================================

function Test-ProjectDirectory {
    Write-Info "Project directory kontrol ediliyor: $ProjectPath"
    
    if (-not (Test-Path $ProjectPath)) {
        Write-Error "Project directory bulunamadı: $ProjectPath"
        exit 1
    }
    
    Write-Success "Project directory bulundu"
    return $true
}

function Stop-NodeProcesses {
    Write-Info "Node.js processler sonlandırılıyor..."
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Success "Node.js processler sonlandırıldı"
            Start-Sleep -Seconds 2
        } else {
            Write-Info "Çalışan Node.js process bulunamadı"
        }
    }
    catch {
        Write-Warning "Node.js process sonlandırılırken hata: $_"
    }
}

function Restart-IIS {
    Write-Info "IIS yeniden başlatılıyor..."
    
    try {
        & "C:\Windows\System32\inetsrv\iisreset.exe" /restart | Out-Null
        Write-Success "IIS başarıyla yeniden başlatıldı"
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Error "IIS yeniden başlatılırken hata: $_"
        exit 1
    }
}

function Install-Dependencies {
    param([bool]$ProductionOnly = $false)
    
    Write-Info "npm dependencies yükleniyor..."
    
    try {
        Set-Location $ProjectPath
        
        if ($ProductionOnly) {
            & npm ci --production
        } else {
            & npm install
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies başarıyla yüklendi"
        } else {
            Write-Error "Dependencies yükleme başarısız"
            exit 1
        }
    }
    catch {
        Write-Error "Dependencies yükleme sırasında hata: $_"
        exit 1
    }
}

function Build-Application {
    Write-Info "Uygulama build'leniyor..."
    
    try {
        Set-Location $ProjectPath
        & npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Uygulama başarıyla build edildi"
        } else {
            Write-Error "Build işlemi başarısız"
            exit 1
        }
    }
    catch {
        Write-Error "Build sırasında hata: $_"
        exit 1
    }
}

function Test-StartupFile {
    Write-Info "Startup file kontrol ediliyor: $StartupFile"
    
    $startupPath = Join-Path $ProjectPath $StartupFile
    
    if (-not (Test-Path $startupPath)) {
        Write-Error "Startup file bulunamadı: $startupPath"
        exit 1
    }
    
    Write-Success "Startup file doğrulandı"
}

function Test-EnvironmentVariables {
    Write-Info "Environment variables kontrol ediliyor..."
    
    $envFile = Join-Path $ProjectPath ".env"
    
    if (-not (Test-Path $envFile)) {
        Write-Warning ".env dosyası bulunamadı. Plesk environment variables kullanılıyor."
    } else {
        Write-Success ".env dosyası bulundu"
    }
}

function Clear-NPMCache {
    Write-Info "npm cache temizleniyor..."
    
    try {
        Set-Location $ProjectPath
        & npm cache clean --force
        Write-Success "npm cache temizlendi"
    }
    catch {
        Write-Warning "npm cache temizleme sırasında hata: $_"
    }
}

function Remove-NodeModules {
    Write-Info "node_modules klasörü siliniyor..."
    
    try {
        $nodeModulesPath = Join-Path $ProjectPath "node_modules"
        
        if (Test-Path $nodeModulesPath) {
            Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "node_modules silindi"
        } else {
            Write-Info "node_modules klasörü bulunamadı"
        }
    }
    catch {
        Write-Error "node_modules silinirken hata: $_"
    }
}

function Show-Logs {
    Write-Info "========== DEPLOYMENT LOG =========="
    
    if (Test-Path $LogFile) {
        Get-Content $LogFile | ForEach-Object { Write-Host $_ }
    } else {
        Write-Info "Deployment log dosyası bulunamadı"
    }
    
    Write-Info ""
    Write-Info "========== iisnode LOG =========="
    
    $iisNodePath = "$env:SystemDrive\iisnode"
    if (Test-Path $iisNodePath) {
        Get-ChildItem -Path $iisNodePath -Recurse | ForEach-Object { Write-Host $_.FullName }
    } else {
        Write-Info "iisnode klasörü bulunamadı"
    }
}

function Show-DiskSpace {
    Write-Info "========== DISK SPACE USAGE =========="
    
    Get-Volume | Select-Object DriveLetter, Size, SizeRemaining | Format-Table -AutoSize
}

function Show-NodeProcesses {
    Write-Info "========== NODE.JS PROCESSES =========="
    
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | 
            Select-Object ProcessId, Name, Memory, CPU | 
            Format-Table -AutoSize
    }
    catch {
        Write-Info "Çalışan Node.js process bulunamadı"
    }
}

function Show-IISStatus {
    Write-Info "========== IIS APPLICATION POOLS =========="
    
    try {
        & "C:\Windows\System32\inetsrv\appcmd.exe" list apppool
        Write-Info ""
        Write-Info "========== IIS WEBSITES =========="
        & "C:\Windows\System32\inetsrv\appcmd.exe" list site
    }
    catch {
        Write-Error "IIS status gösterilirken hata: $_"
    }
}

# ============================================================================
# DEPLOYMENT SCENARYOLARI
# ============================================================================

function Invoke-FullDeployment {
    Write-Info "========== TAM DEPLOYMENT BAŞLIYOR =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Success "========== TAM DEPLOYMENT BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-QuickBuild {
    Write-Info "========== HIZLI BUILD BAŞLIYOR (npm install atlanıyor) =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Success "========== HIZLI BUILD BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-ProductionBuild {
    Write-Info "========== PRODUCTION BUILD BAŞLIYOR =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $true
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Success "========== PRODUCTION BUILD BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-TroubleshootNode {
    Write-Info "========== NODE.JS TROUBLESHOOTING =========="
    
    Show-NodeProcesses
    Write-Info "Node.js processler sonlandırılıyor..."
    Stop-NodeProcesses
    Restart-IIS
    Write-Success "Troubleshooting tamamlandı"
}

function Invoke-TroubleshootNPM {
    Write-Info "========== NPM TROUBLESHOOTING =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Clear-NPMCache
    Remove-NodeModules
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Success "NPM Troubleshooting tamamlandı"
}

# ============================================================================
# MAIN
# ============================================================================

try {
    # Scenario'yu çalıştır
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
            Write-Error "Bilinmeyen scenario: $Scenario"
            exit 1
        }
    }
}
catch {
    Write-Error "Deployment sırasında hata oluştu: $_"
    exit 1
}
finally {
    Write-Info "Deployment script tamamlandı"
}
