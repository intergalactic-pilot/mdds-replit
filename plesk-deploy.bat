@echo off
REM ============================================================================
REM Plesk Windows Server Deployment Commands
REM MDDS Project (Node.js Backend + React Frontend)
REM ============================================================================
REM Bu dosya, Plesk sunucusunda deployment işlemleri için kullanılacak
REM Windows komutlarını içerir. Batch script olarak kaydedilerek kullanılabilir.
REM ============================================================================

SETLOCAL ENABLEDELAYEDEXPANSION

REM ============================================================================
REM 1. TEMEL AYARLAR
REM ============================================================================

REM Proje dizini (Plesk üzerindeki)
SET PROJECT_PATH=D:\httpdocs\yourdomain.com\httpdocs

REM Node.js bilgileri
SET NODE_VERSION=20
SET STARTUP_FILE=dist\index.js

REM Log dosyası
SET LOG_FILE=%PROJECT_PATH%\deployment.log
SET TIMESTAMP=%date% %time%

REM ============================================================================
REM 2. FONKSİYONLAR
REM ============================================================================

:log_message
    ECHO [%TIMESTAMP%] %~1 >> %LOG_FILE%
    ECHO [%TIMESTAMP%] %~1
    EXIT /B 0

:check_directory
    IF NOT EXIST "%PROJECT_PATH%" (
        CALL :log_message "ERROR: Project directory not found: %PROJECT_PATH%"
        EXIT /B 1
    )
    CALL :log_message "Project directory found: %PROJECT_PATH%"
    EXIT /B 0

:kill_node_process
    CALL :log_message "Killing Node.js processes..."
    TASKKILL /F /IM node.exe /T 2>nul
    TIMEOUT /T 2 /NOBREAK
    CALL :log_message "Node.js processes terminated"
    EXIT /B 0

:restart_iis
    CALL :log_message "Restarting IIS..."
    %windir%\system32\inetsrv\iisreset /restart
    TIMEOUT /T 5 /NOBREAK
    CALL :log_message "IIS restarted successfully"
    EXIT /B 0

:npm_install
    CALL :log_message "Running npm install..."
    CD /D "%PROJECT_PATH%"
    CALL npm install
    IF ERRORLEVEL 1 (
        CALL :log_message "ERROR: npm install failed"
        EXIT /B 1
    )
    CALL :log_message "npm install completed successfully"
    EXIT /B 0

:npm_build
    CALL :log_message "Building application..."
    CD /D "%PROJECT_PATH%"
    CALL npm run build
    IF ERRORLEVEL 1 (
        CALL :log_message "ERROR: npm build failed"
        EXIT /B 1
    )
    CALL :log_message "Application built successfully"
    EXIT /B 0

:npm_ci
    CALL :log_message "Running npm ci (production dependencies)..."
    CD /D "%PROJECT_PATH%"
    CALL npm ci --production
    IF ERRORLEVEL 1 (
        CALL :log_message "ERROR: npm ci failed"
        EXIT /B 1
    )
    CALL :log_message "Production dependencies installed"
    EXIT /B 0

:check_startup_file
    IF NOT EXIST "%PROJECT_PATH%\%STARTUP_FILE%" (
        CALL :log_message "ERROR: Startup file not found: %STARTUP_FILE%"
        EXIT /B 1
    )
    CALL :log_message "Startup file verified: %STARTUP_FILE%"
    EXIT /B 0

:check_env_file
    IF NOT EXIST "%PROJECT_PATH%\.env" (
        CALL :log_message "WARNING: .env file not found. Using Plesk environment variables."
    ) ELSE (
        CALL :log_message ".env file found"
    )
    EXIT /B 0

REM ============================================================================
REM 3. DEPLOYMENT SENARYOLARI
REM ============================================================================

:scenario_1_full_deployment
    CALL :log_message "========== SCENARIO 1: FULL DEPLOYMENT =========="
    CALL :check_directory
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 1/5: Killing Node.js processes..."
    CALL :kill_node_process
    
    CALL :log_message "Step 2/5: Installing dependencies..."
    CALL :npm_install
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 3/5: Building application..."
    CALL :npm_build
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 4/5: Checking environment..."
    CALL :check_env_file
    CALL :check_startup_file
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 5/5: Restarting IIS..."
    CALL :restart_iis
    
    CALL :log_message "========== DEPLOYMENT COMPLETED SUCCESSFULLY =========="
    EXIT /B 0

:scenario_2_quick_build
    CALL :log_message "========== SCENARIO 2: QUICK BUILD (NO DEPENDENCIES) =========="
    CALL :check_directory
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 1/4: Killing Node.js processes..."
    CALL :kill_node_process
    
    CALL :log_message "Step 2/4: Building application (skipping npm install)..."
    CALL :npm_build
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 3/4: Verifying startup file..."
    CALL :check_startup_file
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 4/4: Restarting IIS..."
    CALL :restart_iis
    
    CALL :log_message "========== QUICK BUILD COMPLETED SUCCESSFULLY =========="
    EXIT /B 0

:scenario_3_production_build
    CALL :log_message "========== SCENARIO 3: PRODUCTION BUILD =========="
    CALL :check_directory
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 1/5: Killing Node.js processes..."
    CALL :kill_node_process
    
    CALL :log_message "Step 2/5: Installing production dependencies only..."
    CALL :npm_ci
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 3/5: Building application..."
    CALL :npm_build
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 4/5: Verifying startup file..."
    CALL :check_startup_file
    IF ERRORLEVEL 1 EXIT /B 1
    
    CALL :log_message "Step 5/5: Restarting IIS..."
    CALL :restart_iis
    
    CALL :log_message "========== PRODUCTION BUILD COMPLETED SUCCESSFULLY =========="
    EXIT /B 0

REM ============================================================================
REM 4. TROUBLESHOOTING COMMANDS
REM ============================================================================

:troubleshoot_node_process
    CALL :log_message "========== TROUBLESHOOTING: NODE PROCESSES =========="
    CALL :log_message "Listing all Node.js processes..."
    TASKLIST | FINDSTR /I "node"
    
    CALL :log_message "Killing all Node.js processes..."
    TASKKILL /F /IM node.exe /T 2>nul
    
    CALL :log_message "Waiting 3 seconds..."
    TIMEOUT /T 3 /NOBREAK
    
    CALL :log_message "Restarting IIS..."
    CALL :restart_iis
    EXIT /B 0

:troubleshoot_npm_dependencies
    CALL :log_message "========== TROUBLESHOOTING: NPM DEPENDENCIES =========="
    CD /D "%PROJECT_PATH%"
    
    CALL :log_message "Clearing npm cache..."
    CALL npm cache clean --force
    
    CALL :log_message "Removing node_modules..."
    IF EXIST "node_modules" RD /S /Q "node_modules"
    
    CALL :log_message "Removing package-lock.json..."
    IF EXIST "package-lock.json" DEL /Q "package-lock.json"
    
    CALL :log_message "Running npm install..."
    CALL npm install
    IF ERRORLEVEL 1 (
        CALL :log_message "ERROR: npm install failed"
        EXIT /B 1
    )
    
    CALL :log_message "Dependencies reinstalled successfully"
    EXIT /B 0

:troubleshoot_logs
    CALL :log_message "========== TROUBLESHOOTING: VIEWING LOGS =========="
    
    ECHO.
    ECHO === Deployment Log ===
    IF EXIST %LOG_FILE% (
        TYPE %LOG_FILE%
    ) ELSE (
        ECHO No deployment log found
    )
    
    ECHO.
    ECHO === iisnode Log ===
    IF EXIST "%SystemDrive%\iisnode" (
        DIR "%SystemDrive%\iisnode" /S /B
    ) ELSE (
        ECHO iisnode directory not found
    )
    
    ECHO.
    ECHO === IIS Logs ===
    DIR "C:\inetpub\logs\LogFiles" /S /B
    EXIT /B 0

:troubleshoot_disk_space
    CALL :log_message "========== TROUBLESHOOTING: DISK SPACE =========="
    WMIC logicaldisk get size, freespace, name
    EXIT /B 0

REM ============================================================================
REM 5. MONITORING
REM ============================================================================

:monitor_node_process
    CALL :log_message "========== MONITORING: NODE PROCESS =========="
    WMIC process where name="node.exe" get ProcessId, HandleCount, PageFileUsage, VirtualSize
    EXIT /B 0

:monitor_iis_status
    CALL :log_message "========== MONITORING: IIS STATUS =========="
    %windir%\system32\inetsrv\appcmd list apppool
    %windir%\system32\inetsrv\appcmd list site
    EXIT /B 0

REM ============================================================================
REM 6. MAIN MENU
REM ============================================================================

:main_menu
    CLS
    ECHO.
    ECHO ============================================================================
    ECHO MDDS Project - Plesk Windows Server Deployment
    ECHO ============================================================================
    ECHO.
    ECHO DEPLOYMENT SCENARIOS:
    ECHO   1 - Full Deployment (npm install + build + restart)
    ECHO   2 - Quick Build (build only, skip npm install)
    ECHO   3 - Production Build (npm ci + build + restart)
    ECHO.
    ECHO TROUBLESHOOTING:
    ECHO   4 - Troubleshoot Node.js Processes
    ECHO   5 - Troubleshoot NPM Dependencies
    ECHO   6 - View Logs
    ECHO   7 - Check Disk Space
    ECHO.
    ECHO MONITORING:
    ECHO   8 - Monitor Node.js Process
    ECHO   9 - Monitor IIS Status
    ECHO.
    ECHO OTHER:
    ECHO   0 - Exit
    ECHO.
    ECHO ============================================================================
    ECHO.
    
    SET /P CHOICE="Select an option (0-9): "
    
    IF "%CHOICE%"=="1" GOTO scenario_1_full_deployment
    IF "%CHOICE%"=="2" GOTO scenario_2_quick_build
    IF "%CHOICE%"=="3" GOTO scenario_3_production_build
    IF "%CHOICE%"=="4" GOTO troubleshoot_node_process
    IF "%CHOICE%"=="5" GOTO troubleshoot_npm_dependencies
    IF "%CHOICE%"=="6" GOTO troubleshoot_logs
    IF "%CHOICE%"=="7" GOTO troubleshoot_disk_space
    IF "%CHOICE%"=="8" GOTO monitor_node_process
    IF "%CHOICE%"=="9" GOTO monitor_iis_status
    IF "%CHOICE%"=="0" GOTO end
    
    ECHO Invalid choice. Please try again.
    TIMEOUT /T 2 /NOBREAK
    GOTO main_menu

:end
    ENDLOCAL
    EXIT /B 0

REM ============================================================================
REM SCRIPT STARTS HERE
REM ============================================================================

GOTO main_menu
