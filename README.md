# Epos-Web

PosDemo React (Vite) arayüzü.

## Kurulum

```bash
npm ci
copy .env.example .env
# .env içinde VITE_API_URL — API adresiniz (geliştirmede örn. http://localhost:5118)
npm run dev
```

Üretim derlemesi: `npm run build` → `dist/`

## API

Backend ayrı repoda çalışır; `VITE_API_URL` ile REST ve SignalR tabanı ayarlanır.
