# Epos-Web

PosDemo React (Vite) arayüzü.

## Kurulum

```bash
npm ci
copy .env.example .env
npm run dev
```

`VITE_API_URL` boşken geliştirmede istekler **relative** (`/api`, `/hubs`) gider; Vite bunları `VITE_DEV_PROXY_TARGET` (varsayılan `http://localhost:5118`) adresine yönlendirir. Doğrudan API’ye bağlanmak için `.env` içinde örneğin `VITE_API_URL=http://localhost:5118` yazın.

| Ortam | Öneri |
|--------|--------|
| **Geliştirme, API `dotnet run` (5118)** | `VITE_API_URL` boş (proxy) veya `VITE_API_URL=http://localhost:5118` |
| **Geliştirme, API Docker 8081** | `VITE_DEV_PROXY_TARGET=http://localhost:8081` ve `VITE_API_URL` boş **veya** `VITE_API_URL=http://localhost:8081` |
| **Üretim, SPA ve API aynı host** | `VITE_API_URL` boş; `npm run build` → relative `/api` |
| **Üretim, API ayrı adres** | `VITE_API_URL=https://api.domain.com` ile `npm run build` |

Üretim derlemesi:

```bash
set VITE_API_URL=https://api.ornek.com
npm run build
```

Linux/macOS: `VITE_API_URL=https://api.ornek.com npm run build`

Çıktı: `dist/` — statik dosya sunucusu veya backend `wwwroot` ile yayınlanabilir.

## API (backend)

CORS backend’de açık; farklı origin’de `VITE_API_URL` tam URL olmalı. SignalR için tarayıcıda WebSocket’in engellenmediğinden emin olun.
