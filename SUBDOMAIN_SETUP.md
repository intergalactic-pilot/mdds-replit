# Subdomain Setup Guide

Bu dokümanda frontend ve backend'i farklı subdomainlerde çalıştırmak için gerekli ayarlar anlatılmıştır.

## Yapılan Değişiklikler

### 1. Frontend Konfigürasyonu (React + Vite)

**Dosya**: `client/src/lib/queryClient.ts`

Frontend, `import.meta.env.VITE_API_URL` ortam değişkeninden backend URL'sini alır. Eğer ayarlanmamışsa, mevcut origin kullanılır.

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
```

**Tüm API istekleri otomatik olarak bu URL'ye prefix'lenir:**
- `apiRequest()` fonksiyonu
- `getQueryFn()` fonksiyonu

### 2. Backend Konfigürasyonu (Express.js)

**Dosya**: `server/index.ts`

Backend, `FRONTEND_URL` ortam değişkeninden izin verilen origin'leri okuyor. Dinamik CORS konfigürasyonu uygulanır.

**Özellikler:**
- ✅ Comma-separated multiple origins desteği
- ✅ Credentials (cookies) aktif
- ✅ HTTP metotlar: GET, POST, PUT, DELETE, PATCH
- ✅ Gerekli headers: Content-Type, Authorization
- ✅ Preflight cache: 24 saat

**Geliştirme modu:**
- `FRONTEND_URL` ayarlanmamışsa, tüm originlere izin verilir

## Kurulum

### Adım 1: Paketleri Yükleyin
```bash
npm install
npm install cors
npm install -D @types/cors
```

### Adım 2: Environment Değişkenleri

`.env` dosyasını oluşturun (`.env.example`'dan başlayabilirsiniz):

**Yerel Geliştirme:**
```env
# Frontend
VITE_API_URL=http://localhost:5050

# Backend
FRONTEND_URL=http://localhost:5173
```

**Production - Tek API Subdomain:**
```env
# Frontend (app.example.com)
VITE_API_URL=https://api.example.com

# Backend (api.example.com)
FRONTEND_URL=https://app.example.com
```

**Production - Birden Fazla Frontend Origin:**
```env
# Frontend (app.example.com veya www.app.example.com)
VITE_API_URL=https://api.example.com

# Backend
FRONTEND_URL=https://app.example.com,https://www.app.example.com
```

### Adım 3: Build ve Deploy

**Geliştirme:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## Çalışma Prensibi

### Frontend → Backend Flow

1. **Frontend** (`VITE_API_URL` ile başlayarak):
   ```
   fetch(`${API_BASE_URL}/api/sessions`)
   ```
   becomes → `fetch('https://api.example.com/api/sessions')`

2. **Browser**, request'i backend'e gönderir

3. **Backend** (`FRONTEND_URL` kontrol ederek):
   - Origin header'ı kontrol eder
   - CORS headers'ı response'a ekler
   - Request'i işler

4. **Browser**, response'u frontend'e teslim eder

### CORS Headers (Otomatik)

Backend, başarılı CORS validasyonundan sonra şu headers'ları gönderir:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## Test Etme

### Local Development Test

**Terminal 1: Backend'i başlat**
```bash
npm run dev
# Backend http://localhost:5050'de çalışır
```

**Terminal 2: Frontend'i başlat (dev server)**
```bash
npm run dev
# Frontend http://localhost:5173'de çalışır
```

**Test Edecek Şeyler:**
- Login sayfasına girin
- Session oluşturun
- Veri kaydedin (PUT request)
- Database'den veri yükleyin (GET request)
- Browser DevTools'da Network tab'ında CORS headers'ı kontrol edin

### Production Test

1. **API Server'ı başlat:**
   ```bash
   FRONTEND_URL=https://app.example.com npm start
   ```

2. **Frontend'i deploy et:** 
   - Build edilmiş dosyaları `https://app.example.com` üzerinde serve et

3. **Test:**
   - `https://app.example.com` adresini ziyaret et
   - Console'da CORS errors olmaması kontrol et

## Troubleshooting

### CORS Error Alıyorum

**Kontrol Etme Adımları:**

1. **FRONTEND_URL doğru mu?**
   ```bash
   echo $FRONTEND_URL
   # veya
   set FRONTEND_URL  # Windows'ta
   ```

2. **Frontend origin'i kontrol et:**
   - Browser DevTools → Network tab
   - İsteklerin "Origin" header'ını kontrol et
   - Backend'in `FRONTEND_URL`'sine eşleşiyor mu?

3. **Multiple origins problemi:**
   ```env
   # ✅ Doğru (boşluksuz)
   FRONTEND_URL=https://app.example.com,https://www.app.example.com
   
   # ❌ Hatalı (boşluklu)
   FRONTEND_URL=https://app.example.com, https://www.app.example.com
   ```

4. **Development mode'de tüm origins'e izin veriliyor mu?**
   ```bash
   # FRONTEND_URL ayarlanmazsa, tüm origins'e izin verilir
   unset FRONTEND_URL  # Linux/Mac
   set FRONTEND_URL=   # Windows
   ```

### API URL Yanlış

**Kontrol Etme Adımları:**

1. **Environment variable set mi?**
   ```bash
   echo $VITE_API_URL
   # veya
   set VITE_API_URL  # Windows'ta
   ```

2. **Vite build'de variable'ı görüyor mu?**
   - `.env` dosyası project root'da mı?
   - `VITE_` prefix'i var mı? (önemli!)

3. **Build sonrası test et:**
   ```bash
   npm run build
   npm start
   # Browser console'da API requests'ı kontrol et
   ```

## Gelişmiş Konfigürasyon

### Dinamik API URL (Frontend)

Eğer API URL'si runtime'da değişiyorsa, `queryClient.ts`'i güncelleyebilirsiniz:

```typescript
// localStorage'dan al
const API_BASE_URL = 
  localStorage.getItem('apiUrl') || 
  import.meta.env.VITE_API_URL || 
  window.location.origin;
```

### Custom CORS Rules (Backend)

Eğer daha karmaşık CORS kurallarına ihtiyacınız varsa, `server/index.ts`'de `getAllowedOrigins()` fonksiyonunu özelleştirebilirsiniz:

```typescript
const getAllowedOrigins = (): cors.CorsOptions['origin'] => {
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(origin => origin.length > 0); // Boş strings'i filtrele
  
  // Wildcard subdomain desteği ekle
  const wildcardPattern = /^https:\/\/.*\.example\.com$/;
  
  return (origin: string | undefined, callback) => {
    if (!origin || 
        allowedOrigins.includes(origin) || 
        wildcardPattern.test(origin || '')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed: ${origin}`));
    }
  };
};
```

## Kaynaklar

- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
