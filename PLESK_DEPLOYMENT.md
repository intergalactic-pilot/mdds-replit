# Plesk Windows Server Deployment Rehberi

Bu dokümanda, GitHub'dan otomatik olarak çekilen kodlar için Plesk sunucusunda gerekli ayarları bulabilirsiniz.

## 📋 Proje Yapısı

```
MDDS/
├── server/              # Node.js Express Backend (TypeScript)
├── client/              # React Frontend (TypeScript + Vite)
├── shared/              # Shared types
├── dist/                # Build çıktısı
│   ├── index.js         # Backend compiled entry point
│   └── public/          # Frontend static build
├── web.config           # Backend IIS configuration
├── package.json         # Node.js dependencies ve scripts
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Ön Koşullar

Plesk sunucusunuz şu bileşenleri içermeli:

1. **Node.js 18+** (Plesk Node.js extension)
2. **IIS Module: iisnode** (Node.js uygulamalarını serve etmek için)
3. **IIS URL Rewrite** (Routing için)
4. **Git** (kod çekmek için)

### Kurulum Komutları (PowerShell - Admin)

```powershell
# iisnode yükle
# https://github.com/Azure/iisnode/releases adresinden en son sürümü indir
msiexec /i iisnode-full-v0.2.26-x64.msi

# IIS URL Rewrite yükle
msiexec /i https://download.microsoft.com/download/1/2/8/128E2E22-C871-4F88-B3EE-38CB30B5CCDA/rewrite_amd64_en-US.msi
```

## 🚀 Plesk Ayarları

### 1. Plesk'de Node.js Uygulaması Oluşturun

1. **Plesk Panel** → **Domains** → Domainizi seçin
2. **Node.js** sekmesine tıklayın
3. **Enable Node.js support** basın
4. **Ayarları doldurun:**

| Ayar | Değer |
|------|-------|
| **Node.js version** | 18.x veya 20.x LTS |
| **App startup file** | `dist/index.js` |
| **App root directory** | `/` (proje kök dizini) |
| **Package manager** | npm |

### 2. Environment Değişkenlerini Ayarlayın

**Plesk Panel** → **Domains** → **Node.js** → **Environment Variables**

```
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
PORT=3000
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_random_secret_key
```

### 3. Git Repository Bağlantısı

**Plesk Panel** → **Domains** → **Git** → **Repository**

```
Repository URL: https://github.com/your-username/mdds-replit.git
Branch: main
Deploy key: (Plesk tarafından oluşturulacak)
```

## 🔄 Deployment Process

### Otomatik Deployment (Git Push'ta)

GitHub'a kod push yaptığınızda Plesk otomatik olarak:

1. ✅ Repository'den son kod'u çeker (`git pull`)
2. ⏳ Build scriptini çalıştırır
3. 🔄 Node.js uygulamasını yeniden başlatır

### Manual Deployment Commands

Plesk'te Terminal erişiminiz varsa şu komutları çalıştırabilirsiniz:

#### **Seçenek 1: Tam Build ve Restart**

```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm run plesk-build
taskkill /F /IM node.exe
npm run plesk-start
```

#### **Seçenek 2: Faster Build (Production dependencies)**

```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm run plesk-build-prod
taskkill /F /IM node.exe
npm run plesk-start
```

#### **Seçenek 3: Tam Deployment (Önerilen)**

```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm run plesk-deploy
```

## 📝 Plesk "Additional Deployment Actions" Ayarı

Eğer GitHub Push'ta otomatik olarak deployment işlemini çalıştırmak istiyorsanız:

### IIS Handler Kullanımı (Önerilen)

1. **Plesk Panel** → **Domains** → **Node.js**
2. **Additional deployment actions** alanına şu komutu girin:

```cmd
%windir%\system32\inetsrv\appcmd start site "yourdomain.com"
```

### PowerShell Scripti Kullanımı (Gelişmiş)

Proje kök dizinine `deploy.ps1` dosyası oluşturun:

```powershell
# deploy.ps1
param(
    [string]$ProjectPath = "D:\httpdocs\yourdomain.com\httpdocs"
)

# Dizine git
Set-Location $ProjectPath

Write-Host "Building application..."
npm run plesk-build

Write-Host "Restarting Node.js process..."
# Eski Node.js procesini kapat
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Yeni işlem başla (IIS iisnode tarafından otomatik başlatılacak)
Write-Host "Deployment completed successfully!"
```

Plesk'de ayarlayın:

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -File D:\httpdocs\yourdomain.com\httpdocs\deploy.ps1
```

## 📦 web.config Dosyaları

Proje içinde iki `web.config` dosyası vardır:

### 1. Root `web.config` (Backend)

**Konum:** `D:\httpdocs\yourdomain.com\httpdocs\web.config`

**İçerik:**
- iisnode modülünü Node.js'e yönlendirir (`index.js`)
- Statik dosyaları ve API trafiğini yönetir
- Logging'i etkinleştirir
- Compression ayarlarını yapıştırır

### 2. `dist/public/web.config` (Frontend)

**Konum:** `D:\httpdocs\yourdomain.com\httpdocs\dist\public\web.config`

**İçerik:**
- React SPA routing kurallarını ayarlar
- Gerçek dosyaları (CSS, JS) serve eder
- 404 hatalarını `index.html`'e yönlendirir
- Static assets için cache policy'si ayarlar

## 🐛 Troubleshooting

### 1. "Node.js Application is not responding"

**Çözüm:**

```cmd
# IIS'i resetle
iisreset /restart

# Node process'i kontrol et
tasklist | findstr node.exe

# Node process'i öldür ve yeniden başlat
taskkill /F /IM node.exe
```

### 2. "Cannot find module 'cors'" veya diğer dependencies hataları

**Çözüm:**

```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm install
npm run build
iisreset /restart
```

### 3. "CORS error" (cross-origin istekleri çalışmıyor)

**Çözüm:** `.env` dosyanızı kontrol edin:

```env
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

İIS'i yeniden başlatın:

```cmd
iisreset /restart
```

### 4. "404 errors on page refresh" (React routes'ında 404)

**Çözüm:** `dist/public/web.config` dosyasının varlığını kontrol edin. Eğer yoksa:

```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm run build
```

Bu build sırasında otomatik olarak oluşturulmalı.

### 5. IIS Logs'ları Kontrol Etme

```cmd
# IIS logs
C:\inetpub\logs\LogFiles\

# iisnode logs
%SystemDrive%\iisnode\

# Event Viewer
eventvwr.exe
```

## 📊 Monitoring

### Application Pool Kontrol

```cmd
# App Pool durumunu kontrol et
%windir%\system32\inetsrv\appcmd list apppool

# Belirli bir app pool'u reset et
%windir%\system32\inetsrv\appcmd recycle apppool "yourdomain.com"
```

### Performance Monitoring

```powershell
# Node.js memory ve CPU kullanımı
Get-Process node | Select-Object Name, Handles, CPU, Memory

# Real-time monitoring
Get-Process node | Format-Table -AutoSize -Refresh
```

## 🔐 Security Best Practices

### 1. .env Dosyasını Güvenle (Plesk üzerinden)

Plesk Panel'den **Environment Variables**'da ayarlayın. Dosya sisteminde `.env` açık halde tutmayın.

### 2. Node.js Log Dosyalarını Temizle

```powershell
# eski log dosyalarını sil (30 günden eski)
Get-ChildItem -Path "%SystemDrive%\iisnode" -Filter "*.txt" | 
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | 
    Remove-Item
```

### 3. IIS Security Headers

`web.config` dosyalarında security headers'ı etkinleştirdik:

```xml
<add name="X-Content-Type-Options" value="nosniff" />
<add name="X-Frame-Options" value="SAMEORIGIN" />
<add name="X-XSS-Protection" value="1; mode=block" />
```

## ✅ Deployment Checklist

- [ ] Node.js 18+ Plesk'te kurulu
- [ ] IIS iisnode modülü kurulu
- [ ] IIS URL Rewrite kurulu
- [ ] Git credentials Plesk'te ayarlı
- [ ] Environment variables Plesk'te ayarlı
- [ ] `web.config` dosyaları proje içinde
- [ ] `package.json` deployment scriptleri kontrol edildi
- [ ] Test deployment yapıldı
- [ ] Logs kontrol edildi
- [ ] Domains HTTPS'e yönlendirildi (önemli!)

## 📞 Destek ve Referanslar

- [iisnode Documentation](https://github.com/Azure/iisnode)
- [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
- [Plesk Documentation](https://docs.plesk.com/)
- [Express.js Production Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
