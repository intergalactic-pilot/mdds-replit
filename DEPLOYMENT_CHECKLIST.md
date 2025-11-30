# 🚀 Sunucu Deployment Checklist

## ✅ Hazırlık Tamamlandı
- [x] Build output: `dist/index.js` ve `dist/public/` mevcut
- [x] Frontend SPA routing: `dist/public/web.config` yapılandırıldı
- [x] Backend IIS config: `web.config` (root) yapılandırıldı
- [x] Environment variables: `.env.example` oluşturuldu
- [x] npm scripts: `plesk-build`, `plesk-start` hazır
- [x] CORS: `cors` package yüklü, backend middleware aktif
- [x] PowerShell script: `plesk-deploy.ps1` düzeltildi

---

## 📋 Sunucu Üzerinde Yapılacaklar

### 1️⃣ Plesk Panel Setup (IIS + Node.js)

#### A. Domain Ayarları
```
Plesk → Domains → yourdomain.com
├── Web Hosting → Document Root: /httpdocs/yourdomain.com/httpdocs
├── SSL/TLS: HTTPS Etkinleştir
└── NodeJS: Version seç (16+ önerilir)
```

#### B. Node.js Uygulaması (Plesk)
```
Plesk → Applications → New Application
├── Application name: mdds-app
├── Document root: /httpdocs/yourdomain.com/httpdocs
├── Startup file: dist/index.js
├── Node.js version: 18 LTS (veya mevcut en yeni)
└── Environment variables: Aşağıya bakınız
```

#### C. Environment Variables (Plesk Panel)
```
Plesk → Domains → yourdomain.com → NodeJS Settings

PORT=80 (veya 5050 - Plesk tarafından otomatik ayarlanabilir)
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api

# Database (PostgreSQL varsa)
DATABASE_URL=postgresql://user:pass@localhost/mdds_db

# Session
SESSION_SECRET=your-random-secure-string-here (minimum 32 karakter)
SESSION_EXPIRY=86400000 (24 saat - millisecond)
```

---

### 2️⃣ Dosya Yükleme

#### Option A: Git Deployment (Önerilir)
```powershell
# Plesk Panel → Git (veya SSH terminal'dan):
cd /httpdocs/yourdomain.com/httpdocs
git clone https://github.com/intergalactic-pilot/mdds-replit.git .
git checkout main
```

#### Option B: Manual Upload (FTP/SFTP)
```
Tüm dosyaları: /httpdocs/yourdomain.com/httpdocs/ ye yükle
- src/
- dist/
- package.json
- package-lock.json
- tsconfig.json
- vite.config.ts
- web.config (root)
- .env (sunucuda oluştur, repository'den değil)
```

---

### 3️⃣ Sunucuda İlk Kurulum

```powershell
# SSH/Terminal ile sunucuya bağlan
cd D:\httpdocs\yourdomain.com\httpdocs

# 1. Dependencies yükle
npm install --production

# 2. Build et (gerekirse)
npm run build

# 3. Test et
node dist/index.js

# 4. IIS ile Plesk'ten başlat
```

---

### 4️⃣ IIS + iisnode Yapılandırması

#### iisnode Kurulumu
```
İndirVersion: 
  - iisnode x64: https://github.com/Azure/iisnode/releases
  
Installation:
  - MSI çalıştır
  - IIS Reset
```

#### web.config Kontrolü
✅ `/web.config` dosyası:
```xml
<handlers>
  <add name="iisnode" path="dist/index.js" modules="iisnode" />
</handlers>
```

✅ `/dist/public/web.config` dosyası:
```xml
<!-- React Router 404 handling -->
<rule name="Handle React Router" stopProcessing="true">
  <conditions>
    <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
    <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
  </conditions>
  <action type="Rewrite" url="index.html" />
</rule>
```

---

### 5️⃣ CORS & API Endpoint

#### Frontend → Backend Communication
- Frontend URL: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api/*` (iisnode proxy)
- CORS Origin: `FRONTEND_URL` env var'dan okunur

#### Test
```bash
# Terminal/Postman'dan:
curl https://yourdomain.com/api/health
# Response: { "status": "ok" }
```

---

### 6️⃣ SSL/TLS (HTTPS) Setup

✅ Plesk'te Let's Encrypt sertifikası otomatik
```
Plesk → Domains → yourdomain.com → SSL/TLS
├── Auto-renewal: Enable
└── Certificate: Let's Encrypt (ücretsiz)
```

---

### 7️⃣ Deployment Script'i Sunucuda Çalıştır

```powershell
# Plesk PowerShell Terminal:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Production deployment:
D:\httpdocs\yourdomain.com\httpdocs\plesk-deploy.ps1 -Scenario 'production' -ProjectPath 'D:\httpdocs\yourdomain.com\httpdocs'

# Scenario seçenekleri:
# 'full'               - npm install + build + restart
# 'production'         - npm ci --production + build + restart
# 'quick'              - build only (dependencies atlanır)
# 'troubleshoot-npm'   - cache temizle + yeniden kur
# 'monitor'            - Node.js/IIS process'lerini göster
# 'logs'               - deployment log'ları göster
```

---

### 8️⃣ Doğrulama & Testing

#### Endpoint Kontrolü
```
✓ https://yourdomain.com                 → React app
✓ https://yourdomain.com/api/health      → Node.js backend
✓ CORS headers aktif                     → Access-Control-Allow-* 
✓ Database bağlantısı                    → SELECT 1
```

#### Performance Check
```powershell
# IIS Application Pool:
Plesk → Domains → yourdomain.com → NodeJS
  - Memory usage < 500 MB
  - CPU usage < 5% (idle)
  - Process: iisnode.exe çalışıyor
```

#### Log Kontrolü
```
- Deployment log:      D:\httpdocs\yourdomain.com\httpdocs\deployment.log
- iisnode log:         C:\iisnode\
- IIS log:             C:\inetpub\logs\LogFiles\W3SVC<ID>\
```

---

### 9️⃣ GitHub Actions (CI/CD Setup - İsteğe Bağlı)

Otomatik deployment için `.github/workflows/deploy.yml` oluşturabilirsin:

```yaml
name: Deploy to Plesk
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
      - name: Deploy to Plesk (SSH)
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /httpdocs/yourdomain.com/httpdocs
            git pull origin main
            npm ci --production
            npm run build
            # iisreset
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da (SECRET'ler repository'de olmasın)
- [ ] `SESSION_SECRET` güçlü ve 32+ karakter
- [ ] HTTPS etkin (Let's Encrypt)
- [ ] CORS sadece tanıdık domain'lerden izin ver
- [ ] Node.js process: `npm start` değil, `node dist/index.js`
- [ ] Database credentials `.env`'de saklanıyor
- [ ] Package-lock.json committed (dependency consistency)

---

## 📞 Sorun Giderme

### "iisnode not found" hatası
```
→ iisnode module kurmadın
→ https://github.com/Azure/iisnode adresinden indir ve kur
```

### "Cannot find module 'cors'" hatası
```
→ npm install --production çalışmadı
→ Server'da: npm install (full install yap, sadece production değil)
```

### "VITE_API_URL not set" hatası
```
→ Plesk Environment variables'da eklemedim
→ Plesk Panel → Domains → NodeJS Settings'de ekle
```

### React Router 404 hatası
```
→ dist/public/web.config eksik veya yanlış
→ File mevcutsa, React route'larını kontrol et
```

---

## 🎯 Quick Start Deployment Command

```powershell
# Tek komutla production deploy:
$ProjectPath = "D:\httpdocs\yourdomain.com\httpdocs"

# 1. Git'ten pull et
cd $ProjectPath
git pull origin main

# 2. Dependencies kur
npm ci --production

# 3. Build et
npm run build

# 4. IIS/Node restart
iisreset /restart

# Veya PowerShell script'i kullan:
.\plesk-deploy.ps1 -Scenario 'production' -ProjectPath $ProjectPath
```

---

## 📝 Not Alma

Deployment sırasında karşılaştığın sorunları buraya not et:

```
Tarih:
Problem:
Çözüm:
```

---

**Hazırlanması:** 2025-11-30
**Son Güncelleme:** 2025-11-30
**Status:** ✅ DEPLOYMENT READY
