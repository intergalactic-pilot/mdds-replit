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

# Loglama için helper fonksiyon
function Write-Log {
    param([string]$Level, [string]$Message)
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ${Level}: $Message"
}

# ============================================================================
# FONKSİYONLAR
# ============================================================================

function Test-ProjectDirectory {
    Write-Host "ℹ Project directory kontrol ediliyor: $ProjectPath" -ForegroundColor Cyan
    Write-Log "INFO" "Project directory kontrol ediliyor: $ProjectPath"
    
    if (-not (Test-Path $ProjectPath)) {
        Write-Host "✗ Project directory bulunamadı: $ProjectPath" -ForegroundColor Red
        Write-Log "ERROR" "Project directory bulunamadı: $ProjectPath"
        exit 1
    }
    
    Write-Host "✓ Project directory bulundu" -ForegroundColor Green
    Write-Log "SUCCESS" "Project directory bulundu"
    return $true
}

function Stop-NodeProcesses {
    Write-Host "ℹ Node.js processler sonlandırılıyor..." -ForegroundColor Cyan
    Write-Log "INFO" "Node.js processler sonlandırılıyor..."
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Node.js processler sonlandırıldı" -ForegroundColor Green
            Write-Log "SUCCESS" "Node.js processler sonlandırıldı"
            Start-Sleep -Seconds 2
        } else {
            Write-Host "ℹ Çalışan Node.js process bulunamadı" -ForegroundColor Cyan
            Write-Log "INFO" "Çalışan Node.js process bulunamadı"
        }
    }
    catch {
        Write-Host "⚠ Node.js process sonlandırılırken hata: $_" -ForegroundColor Yellow
        Write-Log "WARNING" "Node.js process sonlandırılırken hata: $_"
    }
}

function Restart-IIS {
    Write-Host "ℹ IIS yeniden başlatılıyor..." -ForegroundColor Cyan
    Write-Log "INFO" "IIS yeniden başlatılıyor..."
    
    try {
        & "C:\Windows\System32\inetsrv\iisreset.exe" /restart | Out-Null
        Write-Host "✓ IIS başarıyla yeniden başlatıldı" -ForegroundColor Green
        Write-Log "SUCCESS" "IIS başarıyla yeniden başlatıldı"
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Host "✗ IIS yeniden başlatılırken hata: $_" -ForegroundColor Red
        Write-Log "ERROR" "IIS yeniden başlatılırken hata: $_"
        exit 1
    }
}

function Install-Dependencies {
    param([bool]$ProductionOnly = $false)
    
    Write-Host "ℹ npm dependencies yükleniyor..." -ForegroundColor Cyan
    Write-Log "INFO" "npm dependencies yükleniyor..."
    
    try {
        Set-Location $ProjectPath
        
        if ($ProductionOnly) {
            & npm ci --production
        } else {
            & npm install
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies başarıyla yüklendi" -ForegroundColor Green
            Write-Log "SUCCESS" "Dependencies başarıyla yüklendi"
        } else {
            Write-Host "✗ Dependencies yükleme başarısız" -ForegroundColor Red
            Write-Log "ERROR" "Dependencies yükleme başarısız"
            exit 1
        }
    }
    catch {
        Write-Host "✗ Dependencies yükleme sırasında hata: $_" -ForegroundColor Red
        Write-Log "ERROR" "Dependencies yükleme sırasında hata: $_"
        exit 1
    }
}

function Build-Application {
    Write-Host "ℹ Uygulama build'leniyor..." -ForegroundColor Cyan
    Write-Log "INFO" "Uygulama build'leniyor..."
    
    try {
        Set-Location $ProjectPath
        & npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Uygulama başarıyla build edildi" -ForegroundColor Green
            Write-Log "SUCCESS" "Uygulama başarıyla build edildi"
        } else {
            Write-Host "✗ Build işlemi başarısız" -ForegroundColor Red
            Write-Log "ERROR" "Build işlemi başarısız"
            exit 1
        }
    }
    catch {
        Write-Host "✗ Build sırasında hata: $_" -ForegroundColor Red
        Write-Log "ERROR" "Build sırasında hata: $_"
        exit 1
    }
}

function Test-StartupFile {
    Write-Host "ℹ Startup file kontrol ediliyor: $StartupFile" -ForegroundColor Cyan
    Write-Log "INFO" "Startup file kontrol ediliyor: $StartupFile"
    
    $startupPath = Join-Path $ProjectPath $StartupFile
    
    if (-not (Test-Path $startupPath)) {
        Write-Host "✗ Startup file bulunamadı: $startupPath" -ForegroundColor Red
        Write-Log "ERROR" "Startup file bulunamadı: $startupPath"
        exit 1
    }
    
    Write-Host "✓ Startup file doğrulandı" -ForegroundColor Green
    Write-Log "SUCCESS" "Startup file doğrulandı"
}

function Test-EnvironmentVariables {
    Write-Host "ℹ Environment variables kontrol ediliyor..." -ForegroundColor Cyan
    Write-Log "INFO" "Environment variables kontrol ediliyor..."
    
    $envFile = Join-Path $ProjectPath ".env"
    
    if (-not (Test-Path $envFile)) {
        Write-Host "⚠ .env dosyası bulunamadı. Plesk environment variables kullanılıyor." -ForegroundColor Yellow
        Write-Log "WARNING" ".env dosyası bulunamadı. Plesk environment variables kullanılıyor."
    } else {
        Write-Host "✓ .env dosyası bulundu" -ForegroundColor Green
        Write-Log "SUCCESS" ".env dosyası bulundu"
    }
}

function Clear-NPMCache {
    Write-Host "ℹ npm cache temizleniyor..." -ForegroundColor Cyan
    Write-Log "INFO" "npm cache temizleniyor..."
    
    try {
        Set-Location $ProjectPath
        & npm cache clean --force
        Write-Host "✓ npm cache temizlendi" -ForegroundColor Green
        Write-Log "SUCCESS" "npm cache temizlendi"
    }
    catch {
        Write-Host "⚠ npm cache temizleme sırasında hata: $_" -ForegroundColor Yellow
        Write-Log "WARNING" "npm cache temizleme sırasında hata: $_"
    }
}

function Remove-NodeModules {
    Write-Host "ℹ node_modules klasörü siliniyor..." -ForegroundColor Cyan
    Write-Log "INFO" "node_modules klasörü siliniyor..."
    
    try {
        $nodeModulesPath = Join-Path $ProjectPath "node_modules"
        
        if (Test-Path $nodeModulesPath) {
            Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✓ node_modules silindi" -ForegroundColor Green
            Write-Log "SUCCESS" "node_modules silindi"
        } else {
            Write-Host "ℹ node_modules klasörü bulunamadı" -ForegroundColor Cyan
            Write-Log "INFO" "node_modules klasörü bulunamadı"
        }
    }
    catch {
        Write-Host "✗ node_modules silinirken hata: $_" -ForegroundColor Red
        Write-Log "ERROR" "node_modules silinirken hata: $_"
    }
}

function Show-Logs {
    Write-Host "ℹ ========== DEPLOYMENT LOG ==========" -ForegroundColor Cyan
    
    if (Test-Path $LogFile) {
        Get-Content $LogFile | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "ℹ Deployment log dosyası bulunamadı" -ForegroundColor Cyan
    }
    
    Write-Host "ℹ " -ForegroundColor Cyan
    Write-Host "ℹ ========== iisnode LOG ==========" -ForegroundColor Cyan
    
    $iisNodePath = "$env:SystemDrive\iisnode"
    if (Test-Path $iisNodePath) {
        Get-ChildItem -Path $iisNodePath -Recurse | ForEach-Object { Write-Host $_.FullName }
    } else {
        Write-Host "ℹ iisnode klasörü bulunamadı" -ForegroundColor Cyan
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
        Write-Host "ℹ Çalışan Node.js process bulunamadı" -ForegroundColor Cyan
    }
}

function Show-IISStatus {
    Write-Host "ℹ ========== IIS APPLICATION POOLS ==========" -ForegroundColor Cyan
    
    try {
        & "C:\Windows\System32\inetsrv\appcmd.exe" list apppool
        Write-Host "ℹ " -ForegroundColor Cyan
        Write-Host "ℹ ========== IIS WEBSITES ==========" -ForegroundColor Cyan
        & "C:\Windows\System32\inetsrv\appcmd.exe" list site
    }
    catch {
        Write-Host "✗ IIS status gösterilirken hata: $_" -ForegroundColor Red
        Write-Log "ERROR" "IIS status gösterilirken hata: $_"
    }
}

# ============================================================================
# DEPLOYMENT SCENARYOLARI
# ============================================================================

function Invoke-FullDeployment {
    Write-Host "ℹ ========== TAM DEPLOYMENT BAŞLIYOR ==========" -ForegroundColor Cyan
    Write-Log "INFO" "========== TAM DEPLOYMENT BAŞLIYOR =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== TAM DEPLOYMENT BAŞARIYLA TAMAMLANDI ==========" -ForegroundColor Green
    Write-Log "SUCCESS" "========== TAM DEPLOYMENT BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-QuickBuild {
    Write-Host "ℹ ========== HIZLI BUILD BAŞLIYOR (npm install atlanıyor) ==========" -ForegroundColor Cyan
    Write-Log "INFO" "========== HIZLI BUILD BAŞLIYOR (npm install atlanıyor) =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== HIZLI BUILD BAŞARIYLA TAMAMLANDI ==========" -ForegroundColor Green
    Write-Log "SUCCESS" "========== HIZLI BUILD BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-ProductionBuild {
    Write-Host "ℹ ========== PRODUCTION BUILD BAŞLIYOR ==========" -ForegroundColor Cyan
    Write-Log "INFO" "========== PRODUCTION BUILD BAŞLIYOR =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Install-Dependencies -ProductionOnly $true
    Build-Application
    Test-EnvironmentVariables
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ ========== PRODUCTION BUILD BAŞARIYLA TAMAMLANDI ==========" -ForegroundColor Green
    Write-Log "SUCCESS" "========== PRODUCTION BUILD BAŞARIYLA TAMAMLANDI =========="
}

function Invoke-TroubleshootNode {
    Write-Host "ℹ ========== NODE.JS TROUBLESHOOTING ==========" -ForegroundColor Cyan
    Write-Log "INFO" "========== NODE.JS TROUBLESHOOTING =========="
    
    Show-NodeProcesses
    Write-Host "ℹ Node.js processler sonlandırılıyor..." -ForegroundColor Cyan
    Write-Log "INFO" "Node.js processler sonlandırılıyor..."
    Stop-NodeProcesses
    Restart-IIS
    Write-Host "✓ Troubleshooting tamamlandı" -ForegroundColor Green
    Write-Log "SUCCESS" "Troubleshooting tamamlandı"
}

function Invoke-TroubleshootNPM {
    Write-Host "ℹ ========== NPM TROUBLESHOOTING ==========" -ForegroundColor Cyan
    Write-Log "INFO" "========== NPM TROUBLESHOOTING =========="
    
    Test-ProjectDirectory
    Stop-NodeProcesses
    Clear-NPMCache
    Remove-NodeModules
    Install-Dependencies -ProductionOnly $false
    Build-Application
    Test-StartupFile
    Restart-IIS
    
    Write-Host "✓ NPM Troubleshooting tamamlandı" -ForegroundColor Green
    Write-Log "SUCCESS" "NPM Troubleshooting tamamlandı"
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
            Write-Host "✗ Bilinmeyen scenario: $Scenario" -ForegroundColor Red
            Write-Log "ERROR" "Bilinmeyen scenario: $Scenario"
            exit 1
        }
    }
}
catch {
    Write-Host "✗ Deployment sırasında hata oluştu: $_" -ForegroundColor Red
    Write-Log "ERROR" "Deployment sırasında hata oluştu: $_"
    exit 1
}
finally {
    Write-Host "ℹ Deployment script tamamlandı" -ForegroundColor Cyan
    Write-Log "INFO" "Deployment script tamamlandı"
}
