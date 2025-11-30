# MDDS Plesk Windows Server Deployment - Kurulum Özeti

**Tamamlanma Tarihi:** 30 Kasım 2025  
**Proje:** MDDS (Multi-Domain Deterrence Strategy)  
**Deployment Türü:** Plesk Windows Server + IIS + Node.js  

---

## 📋 TAMAMLANAN GÖREVLER

### ✅ 1. Backend IIS Konfigürasyonu
- **Dosya:** `web.config` (proje root'unda)
- **Özellikler:**
  - iisnode modülü entegrasyonu
  - `dist/index.js` entry point'i
  - Statik dosya serving (`dist/public/`)
  - API trafiği yönlendirmesi
  - Logging ve error handling
  - Compression (Gzip) aktif
  - Security headers

### ✅ 2. Frontend React Konfigürasyonu
- **Dosya:** `dist/public/web.config`
- **Özellikler:**
  - SPA routing (React Router 404 hatalarını önler)
  - Gerçek dosyalar serve edilir
  - 404'ler `index.html`'e yönlendirilir
  - MIME type tanımları
  - Cache policy
  - Compression

### ✅ 3. Package.json Deployment Scriptleri
- **Added Scripts:**
  ```json
  {
    "plesk-build": "npm install && npm run build",
    "plesk-build-prod": "npm ci --production && npm run build",
    "plesk-start": "cross-env NODE_ENV=production node dist/index.js",
    "plesk-deploy": "npm install && npm run build && cross-env NODE_ENV=production node dist/index.js"
  }
  ```

### ✅ 4. Deployment Dokumentasyonu

#### PLESK_DEPLOYMENT.md (85 satır)
Comprehensive kurulum rehberi içeren:
- Ön koşullar ve kurulum adımları
- Plesk panel ayarları
- Environment variables
- Git integration
- Deployment process
- Troubleshooting guide
- Security best practices
- Deployment checklist

#### PLESK_COMMANDS_REFERENCE.txt (350+ satır)
Windows command reference:
- Hızlı başlangıç komutları
- NPM commands
- IIS commands
- Node.js process management
- Monitoring & logging
- Troubleshooting komutları
- Quick reference table
- Emergency procedures

#### SUBDOMAIN_SETUP.md
Subdomain konfigürasyonu (daha önceki görevden):
- Frontend/Backend farklı domainlerde çalışması
- CORS ayarları
- Environment variable setup

### ✅ 5. Automation Scripts

#### plesk-deploy.bat (Interactive Menu)
Windows batch script:
- 3 deployment scenario (Full, Quick, Production)
- 6 troubleshooting seçeneği
- Process monitoring
- Detaylı logging
- Renk-coded output

#### plesk-deploy.ps1 (Advanced)
PowerShell script:
- Aynı 3 deployment scenario
- Daha robust error handling
- Function-based architecture
- Detailed logging
- 8 farklı scenario seçeneği

---

## 🗂️ PROJE YAPISI (BUILD)

```
MDDS/
├── src/
│   ├── server/              # TypeScript backend
│   ├── client/              # React TypeScript frontend
│   └── shared/              # Shared types
│
├── dist/                    # Build çıktıları
│   ├── index.js             # Backend compiled (başlangıç dosyası)
│   ├── public/              # Frontend static files
│   │   ├── index.html       # React SPA entry
│   │   ├── assets/          # CSS, JS, resimler
│   │   └── web.config       # ✨ Frontend IIS config
│   └── ...
│
├── web.config               # ✨ Backend IIS config
├── plesk-deploy.bat         # ✨ Interactive deployment (CMD)
├── plesk-deploy.ps1         # ✨ Advanced deployment (PowerShell)
├── PLESK_DEPLOYMENT.md      # ✨ Full documentation
├── PLESK_COMMANDS_REFERENCE.txt # ✨ Commands quick reference
├── SUBDOMAIN_SETUP.md       # ✨ Subdomain configuration
├── package.json             # ✨ Updated with deployment scripts
├── vite.config.ts           # Frontend build config
├── tsconfig.json            # TypeScript config
└── README.md                # ✨ Updated with subdomain setup
```

---

## 🚀 DEPLOYMENT PROCESS

### Adım 1: Plesk Paneline Giriş
1. Plesk Dashboard → Domains → Domainini seç
2. Node.js sekmesinde:
   - Node.js version: 18.x veya 20.x
   - App startup file: `dist/index.js`
   - Environment variables ayarla

### Adım 2: GitHub Integration
1. Plesk → Git → Repository bağla
2. Branch: `main`

### Adım 3: Deployment
**Seçenek A: Otomatik (Git Push'ta)**
```
Plesk Panel → Additional Deployment Actions:
powershell -NoProfile -ExecutionPolicy Bypass -File "plesk-deploy.ps1" -Scenario "full"
```

**Seçenek B: Manual (Plesk Terminal'den)**
```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm run plesk-deploy
```

**Seçenek C: Interactive Menu**
```cmd
plesk-deploy.bat
```

---

## 🔧 CONFIGURATION CHECKLIST

### Environment Variables (Plesk Panel'de)
```
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
PORT=3000
DATABASE_URL=postgresql://...
SESSION_SECRET=your_secret_key
```

### .env Dosyası (İsteğe bağlı)
```
VITE_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### IIS Requirements
- [ ] Node.js 18+ kurulu
- [ ] iisnode module kurulu
- [ ] IIS URL Rewrite module kurulu
- [ ] web.config dosyaları proje içinde
- [ ] HTTPS SSL sertifikası

---

## 📊 FILE MANIFEST

| Dosya | Tip | Amaç |
|-------|-----|------|
| `web.config` | XML | Backend IIS configuration |
| `dist/public/web.config` | XML | Frontend React routing |
| `plesk-deploy.bat` | Batch | Interactive deployment menu |
| `plesk-deploy.ps1` | PowerShell | Advanced deployment automation |
| `PLESK_DEPLOYMENT.md` | Markdown | Detailed setup guide (Türkçe) |
| `PLESK_COMMANDS_REFERENCE.txt` | Text | Quick command reference |
| `SUBDOMAIN_SETUP.md` | Markdown | Subdomain configuration |
| `package.json` | JSON | Updated with deployment scripts |

---

## 🎯 NEXT STEPS

### 1. Plesk'te Node.js Etkinleştir
```
Plesk → Domains → yourdomain.com → Node.js → Enable
```

### 2. Environment Variables Ayarla
```
NODE_ENV = production
FRONTEND_URL = https://yourdomain.com
PORT = 3000
```

### 3. İlk Build'i Çalıştır
```cmd
D:\httpdocs\yourdomain.com\httpdocs\plesk-deploy.bat
# Seçim: 1 (Full Deployment)
```

### 4. Logs Kontrol Et
```cmd
type deployment.log
explorer %SystemDrive%\iisnode
```

### 5. Test Et
```
https://yourdomain.com
https://yourdomain.com/api/sessions
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Node.js application is not responding"
```cmd
taskkill /F /IM node.exe
iisreset /restart
```

### Issue: "Cannot find module 'cors' / 'express'"
```cmd
cd D:\httpdocs\yourdomain.com\httpdocs
npm install
npm run build
```

### Issue: "404 on page refresh" (React routing)
- `dist/public/web.config` varlığını kontrol et
- Build işlemini tekrarla: `npm run build`

### Issue: "CORS error"
- Plesk'te `FRONTEND_URL` ayarla
- IIS restart et: `iisreset /restart`

### Issue: "Permission denied" (PowerShell script)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📈 MONITORING

### Real-time Process Monitoring
```powershell
Get-Process node | Format-Table -AutoSize -Refresh
```

### IIS Status
```cmd
%windir%\system32\inetsrv\appcmd list site
```

### Logs Location
```
Deployment: D:\httpdocs\yourdomain.com\httpdocs\deployment.log
iisnode: %SystemDrive%\iisnode\
IIS: C:\inetpub\logs\LogFiles\
```

---

## 🔐 SECURITY NOTES

1. **Environment Variables:** Plesk Panel'de ayarla, dosya sisteminde değil
2. **Security Headers:** `web.config` dosyalarında otomatik
3. **HTTPS:** Domain için SSL sertifikası gerekli
4. **Firewall:** Port 3000 sadece localhost'ta dinle (iisnode reverse proxy olarak)

---

## 📞 TECHNICAL DETAILS

### Build Process
```
TypeScript → Vite → dist/public/          (Frontend)
TypeScript → esbuild → dist/index.js      (Backend)
```

### Runtime
```
Client (dist/public/index.html)
    ↓ fetch (CORS enabled)
iisnode (dist/index.js)
    ↓ Express routes
Database
```

### Port Mapping
- Frontend: IIS (Port 80/443)
- Backend: Node.js via iisnode (Port 3000 internal)
- Database: Environment variable ile

---

## ✅ DEPLOYMENT VERIFICATION

After deployment, verify:

1. **Backend Running:**
   ```cmd
   tasklist | findstr node
   ```

2. **IIS Active:**
   ```cmd
   iisreset /status
   ```

3. **Web Access:**
   - Frontend: https://yourdomain.com/
   - API: https://yourdomain.com/api/sessions

4. **Logs Clean:**
   ```cmd
   type deployment.log
   ```

---

## 📚 RELATED DOCUMENTATION

- `PLESK_DEPLOYMENT.md` - Detaylı Plesk kurulum rehberi
- `PLESK_COMMANDS_REFERENCE.txt` - Windows komutları referansı
- `SUBDOMAIN_SETUP.md` - Subdomain ve CORS konfigürasyonu
- `README.md` - Proje genel dökümentasyonu

---

## 🎓 TRAINING & SUPPORT

### For Developers
- Build locally: `npm run dev`
- Production test: `cross-env NODE_ENV=production npm run build`
- Check logs: `cat deployment.log`

### For DevOps
- Monitor: `Get-Process node`
- Restart: `iisreset /restart`
- Troubleshoot: `plesk-deploy.ps1 -Scenario troubleshoot-npm`

### For Sysadmins
- IIS Management: `inetmgr.exe`
- PowerShell Execution: `Set-ExecutionPolicy`
- Event Viewer: `eventvwr.exe`

---

## 📝 CHANGE LOG

### 2025-11-30
- ✅ Backend web.config oluşturuldu
- ✅ Frontend web.config oluşturuldu
- ✅ Package.json deployment scripts eklendi
- ✅ PLESK_DEPLOYMENT.md yazıldı
- ✅ PLESK_COMMANDS_REFERENCE.txt yazıldı
- ✅ plesk-deploy.bat oluşturuldu
- ✅ plesk-deploy.ps1 oluşturuldu
- ✅ SUBDOMAIN_SETUP.md güncellendi
- ✅ .env.example güncellendi

---

**Status:** ✅ DEPLOYMENT READY  
**Last Updated:** 2025-11-30  
**Version:** 1.0.0  

Sorularınız için `PLESK_DEPLOYMENT.md` veya `PLESK_COMMANDS_REFERENCE.txt` dosyalarını kontrol edin.
