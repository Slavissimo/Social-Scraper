<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=3b82f6&height=200&section=header&text=Social%20Scraper&fontSize=70&fontColor=ffffff&fontAlignY=38&desc=Bachelor%20Thesis%20Demo%20%7C%20Social%20Media%20Comment%20Analysis&descAlignY=58&descColor=ffffff" />

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-saloncuk.sk/scraper-3b82f6?style=for-the-badge&logoColor=white)](https://saloncuk.sk/scraper)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

</div>

---

## 🔍 O projekte

**Social Scraper** je webová aplikácia vytvorená ako **bakalárska práca** na FEI TUKE. Umožňuje scrapovanie a analýzu verejných komentárov zo sociálnych sietí prostredníctvom ich oficiálnych API.

---

## 🌐 Podporované platformy

| Platforma | Stav | Metóda |
|-----------|------|--------|
| ![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=flat&logo=reddit&logoColor=white) **Reddit** | ✅ Plná podpora | Verejné JSON API – bez kľúča |
| ![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=flat&logo=youtube&logoColor=white) **YouTube** | ✅ Plná podpora | YouTube Data API v3 – zadarmo |
| ![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white) **Facebook** | ⚠️ Stub | Vyžaduje Meta Graph API + App Review |
| ![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white) **Instagram** | ⚠️ Stub | Vyžaduje Meta Graph API + App Review |

---

## 🏗️ Architektúra

```
Social-Scraper/
├── frontend/                      # React + Vite
│   └── src/
│       ├── App.jsx                # Hlavný layout a routing
│       ├── components/
│       │   ├── RedditResults.jsx  # Zobrazenie Reddit komentárov
│       │   ├── YouTubeResults.jsx # Zobrazenie YouTube komentárov
│       │   ├── RestrictedResults.jsx  # Stub dokumentácia
│       │   ├── PlatformStatus.jsx # Sidebar – prehľad platforiem
│       │   └── UrlInput.jsx       # Vstup URL s detekciou platformy
│       ├── hooks/useScraper.js    # Správa fetch stavu
│       └── utils/api.js           # API volania, detekcia platformy
│
└── backend/                       # FastAPI + Python
    ├── main.py                    # Routes, detekcia platformy, CORS
    └── scrapers/
        ├── reddit.py              # Reddit public JSON API scraper
        ├── youtube.py             # YouTube Data API v3 scraper
        └── platform_stubs.py     # Štruktúrované stuby pre FB/IG
```

---

## ⚙️ Tech Stack

**Frontend**
- [React 18](https://react.dev) + [Vite](https://vitejs.dev)
- Detekcia platformy z URL v reálnom čase

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) + [httpx](https://www.python-httpx.org)
- Python 3.12
- Asynchrónne HTTP požiadavky

**APIs**
- Reddit Public JSON (bez autentifikácie)
- YouTube Data API v3 (bezplatný kľúč, 10 000 jednotiek/deň)

---

## 🚀 Lokálne spustenie

### Backend

```bash
cd backend
pip install -r requirements.txt

# Nastav YouTube API kľúč
cp .env.example .env
# Uprav .env a pridaj YOUTUBE_API_KEY
```

> 🔑 **Ako získať YouTube API kľúč (zadarmo):**
> 1. [Google Cloud Console](https://console.cloud.google.com/) → nový projekt
> 2. APIs & Services → Library → **YouTube Data API v3** → Enable
> 3. Credentials → Create Credentials → API key

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Otvor [http://localhost:5173](http://localhost:5173)

---

## 📋 Príklady URL

**Reddit:**
```
https://www.reddit.com/r/programming/comments/abc123/post_title/
```

**YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/shorts/VIDEO_ID
```

**Facebook / Instagram** *(stub – vracia dokumentáciu architektúry)*:
```
https://www.facebook.com/somepost/123
https://www.instagram.com/p/ABC123/
```

---

## 🌐 Nasadenie

Aplikácia je nasadená na [Render.com](https://render.com):

| Služba | URL |
|--------|-----|
| Frontend | `saloncuk.sk/scraper` |
| Backend | `social-scraper-backend-smjj.onrender.com` |

Routing zabezpečuje **Cloudflare Worker** na doméne [saloncuk.sk](https://saloncuk.sk).

---

<div align="center">

*Bakalárska práca – FEI TUKE · Súčasť [saloncuk.sk](https://saloncuk.sk)*

<img src="https://capsule-render.vercel.app/api?type=waving&color=3b82f6&height=100&section=footer" />

</div>
