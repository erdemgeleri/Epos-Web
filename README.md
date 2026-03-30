# PosDemo Frontend (Local Calistirma)

Bu proje React + Vite tabanli frontend uygulamasidir.

## Ozellikler

- Rol bazli kullanim: `Admin`, `Business`, `Customer`
- Gercek zamanli guncellemeler: SignalR ile siparis, stok ve sohbet olaylari
- Isletme paneli: urun/stok yonetimi, siparis takibi
- Musteri paneli: isletme katalogu, sepet, siparis olusturma/iptal
- Entegre sohbet: isletme-musteri mesajlasma, yaziyor gostergesi, yanitlama
- JWT tabanli kimlik dogrulama ve oturum yonetimi

## 1) Gereksinimler

- Node.js 20+ (LTS onerilir)
- npm 10+
- Calisan PosDemo backend API

## 2) Kurulum

```bash
npm ci
```

## 3) Ortam Degiskeni (.env)

Proje kokune `.env` dosyasi olusturun:

```env
VITE_API_URL=
VITE_DEV_PROXY_TARGET=
```

### Onerilen local ayar

Backend localde `http://localhost:5118` adresinde calisiyorsa:

```env
VITE_API_URL=
VITE_DEV_PROXY_TARGET=http://localhost:5118
```

Bu ayarla frontend istekleri Vite proxy uzerinden backend'e yonlendirilir.

### Alternatif ayar

Proxy kullanmadan dogrudan API adresi vermek isterseniz:

```env
VITE_API_URL=http://localhost:5118
VITE_DEV_PROXY_TARGET=
```

## 4) Uygulamayi Baslatma

```bash
npm run dev
```

Varsayilan adres: [http://localhost:5173](http://localhost:5173)

## 5) Musteri Inceleme Icin Not

- Frontend tek basina yeterli degildir; backend API'nin de acik olmasi gerekir.
- Giris yapildiginda roller bazinda panel yonlendirmesi vardir (`Admin`, `Business`, `Customer`).

## 6) Uretim Derlemesi

```bash
npm run build
```

Derleme ciktisi: `dist/`
