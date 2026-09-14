# SCP Vakıası — Aktörlük & Rapor Yönetim Paneli

SCP Roleplay toplulukları için Discord OAuth2 ile giriş yapılan, rol hiyerarşisine
duyarlı, Discord botuyla entegre bir **Aktörlük Atama & Rapor Yönetim Paneli**.

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** tarzı bileşenler + **Lucide Icons**
- **NextAuth.js** (Discord OAuth2 Provider, database session, Prisma Adapter)
- **Prisma ORM** (PostgreSQL — Supabase / Railway / Neon uyumlu)
- **Discord REST API** ile embed bildirimleri + opsiyonel **discord.js** slash-command botu

---

## 1. Klasör Yapısı

```
scp-actor-panel/
├── .env.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                     # "/" -> /login veya /dashboard yönlendirir
│   │   ├── login/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Sidebar + Navbar shell
│   │   │   ├── page.tsx                 # Genel bakış / istatistikler
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx             # "Raporlarım"
│   │   │   │   └── new/page.tsx         # Yeni rapor formu
│   │   │   └── admin/
│   │   │       ├── reports/page.tsx     # Rapor inceleme (Onayla/Reddet/Revizyon)
│   │   │       └── assign-scp/page.tsx  # SCP Ata
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── discord/members/route.ts         # Aktör kadrosu dropdown verisi
│   │       ├── scp-assignments/route.ts         # GET (liste) / POST (oluştur)
│   │       ├── scp-assignments/[id]/route.ts    # DELETE
│   │       └── reports/
│   │           ├── route.ts                     # GET (liste) / POST (oluştur)
│   │           └── [id]/
│   │               ├── route.ts                 # GET (detay)
│   │               ├── approve/route.ts
│   │               ├── reject/route.ts
│   │               └── request-info/route.ts
│   ├── components/
│   │   ├── ui/                          # button, card, input, select, dialog, tabs, table...
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── role-badge.tsx
│   │   ├── status-badge.tsx
│   │   ├── report-form.tsx
│   │   ├── report-review-list.tsx
│   │   ├── scp-assign-form.tsx
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── auth.ts                      # NextAuth config + Discord rol senkronizasyonu
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── discord.ts                   # Discord REST helpers (embed, üye listesi)
│   │   ├── roles.ts                     # Rol hiyerarşisi + yetki kontrolü
│   │   └── utils.ts
│   └── types/
│       └── next-auth.d.ts
├── bot/
│   ├── index.ts                         # Opsiyonel discord.js Gateway botu (/panel, /rapor-durum)
│   └── deploy-commands.ts               # Slash komutlarını Discord'a kaydeder
└── README.md
```

---

## 2. Discord Tarafında Yapılması Gerekenler

### 2.1. Discord Developer Portal
1. https://discord.com/developers/applications adresinden yeni bir uygulama oluştur.
2. **OAuth2 > General**: bir *Client Secret* üret. Redirect URL olarak şunu ekle:
   - Local: `http://localhost:3000/api/auth/callback/discord`
   - Prod: `https://<vercel-domainin>.vercel.app/api/auth/callback/discord`
3. **Bot** sekmesinden bir bot oluştur, tokenı kopyala. **Privileged Gateway Intents**
   altında **Server Members Intent**'i aç (rol senkronizasyonu ve kadro listesi için zorunlu).
4. **OAuth2 > URL Generator**: `bot` + `applications.commands` scope'larını, bot izinlerinde
   `Send Messages`, `Embed Links`, `Read Message History`, `View Channels`, `Mention Everyone`
   (rol etiketleme için) seç, oluşan linkle botu sunucuna ekle.

### 2.2. Rol ve Kanal ID'lerini Al
Discord'da **Ayarlar > Gelişmiş > Geliştirici Modu**'nu aç, ardından:
- Sunucu Ayarları > Roller'den her rol için sağ tık > **Rol Kimliğini Kopyala**
- İlgili kanallar için sağ tık > **Kanal Kimliğini Kopyala**

Bunları `.env` dosyandaki `ROLE_ID_*` ve `DISCORD_*_CHANNEL_ID` değişkenlerine yapıştır.

> **Not:** Rol hiyerarşisi `src/lib/roles.ts` içindeki `ROLE_HIERARCHY` sabitinde
> tanımlıdır: `Deneme Aktör < Aktör < Kıdemli Aktör < Üst Aktör < Baş Aktör < Aktör Sorumlusu`.
> Üst Aktör, Baş Aktör ve Aktör Sorumlusu = panel içinde "Yönetici" sayılır (`ADMIN_ROLES`).

---

## 3. Kurulum (Lokal Geliştirme)

```bash
# 1. Bağımlılıkları kur
npm install

# 2. .env dosyasını oluştur
cp .env.example .env
# .env içindeki tüm değerleri doldur (Discord, veritabanı, secret'lar)

# 3. NEXTAUTH_SECRET üret
openssl rand -base64 32

# 4. Veritabanı şemasını uygula
npx prisma migrate dev --name init

# 5. Geliştirme sunucusunu başlat
npm run dev
```

Panel `http://localhost:3000` üzerinde çalışır.

### Opsiyonel: Slash-command botunu çalıştır
```bash
npm run bot:deploy   # slash komutlarını Discord'a kaydeder (bir kere / güncellemede çalıştır)
npm run bot:start    # botu başlatır (kalıcı process — ayrı bir terminal/servis)
```
Bot, Vercel'de **değil**; Railway, Fly.io veya bir VPS gibi kalıcı process
çalıştırabilen bir ortamda barındırılmalıdır (Vercel fonksiyonları Gateway
soketi açık tutamaz). Web panel ile aynı `DATABASE_URL`'i kullanmalıdır.

---

## 4. Veritabanı Seçenekleri

**Supabase (önerilen — ücretsiz katman mevcut):**
1. https://supabase.com üzerinde yeni proje oluştur.
2. Project Settings > Database > Connection string'den hem *Transaction* (pooler,
   `DATABASE_URL` için) hem *Session* (direct, `DIRECT_URL` için) bağlantılarını al.

**Railway:**
1. Yeni bir PostgreSQL servisi ekle, `DATABASE_URL`'i kopyala.
2. Railway'de pooler yoksa `DIRECT_URL`'i de aynı değere eşitleyebilirsin.

---

## 5. Vercel'e Deployment

1. Repoyu GitHub'a push'la, Vercel'de **Import Project** ile bağla.
2. **Environment Variables** sekmesine `.env` dosyandaki tüm değişkenleri ekle
   (özellikle `NEXTAUTH_URL`'i gerçek Vercel domainin ile güncellemeyi unutma).
3. **Build Command**: `prisma generate && next build` (package.json'daki `build`
   script'i bunu zaten otomatik yapar).
4. Deploy sonrası Discord Developer Portal'daki OAuth2 redirect URL'ini prod
   domaininle güncelle: `https://<domain>/api/auth/callback/discord`.
5. İlk deploy'dan sonra veritabanı migration'ını uygula:
   ```bash
   npx prisma migrate deploy
   ```
   (Vercel build adımına da `postinstall` ile prisma generate zaten dahil;
   migration'ı CI/CD adımına veya elle bir kereliğine ekleyebilirsin.)

---

## 6. Yetkilendirme Akışı Özeti

1. Kullanıcı `/login` sayfasından Discord ile giriş yapar.
2. `signIn` callback'i (`src/lib/auth.ts`), bot token'ı ile kullanıcının hedef
   sunucudaki (`DISCORD_GUILD_ID`) rollerini çeker.
3. `resolveHighestRole()` bu rol ID'lerini `.env`'deki `ROLE_ID_*` eşlemesiyle
   karşılaştırıp en yüksek `ActorRole`'ü belirler ve `User` tablosuna yazar.
4. Panelde ve API route'larında `isAdminRole(session.user.role)` kontrolü ile
   Üst Aktör/Baş Aktör/Aktör Sorumlusu'na özel ekranlar ve uçlar korunur.
5. Rol her girişte yeniden senkronize edilir — Discord'da rolü değişen bir
   kullanıcı yeniden giriş yaptığında panel otomatik güncellenir.

---

## 7. Modül Özeti

| Modül | Yol | Kim Erişebilir |
|---|---|---|
| Genel Bakış | `/dashboard` | Tüm kadro |
| Rapor Oluştur | `/dashboard/reports/new` | Tüm kadro (Deneme Aktör dahil) |
| Raporlarım | `/dashboard/reports` | Tüm kadro (yalnızca kendi raporları) |
| Rapor İnceleme | `/dashboard/admin/reports` | Üst Aktör, Baş Aktör, Aktör Sorumlusu |
| SCP Ata | `/dashboard/admin/assign-scp` | Üst Aktör, Baş Aktör, Aktör Sorumlusu |

Her rapor gönderimi ve SCP ataması, ilgili Discord kanalına otomatik bir embed
bildirimi düşürür; rapor incelemede verilen Onayla/Reddet/Revizyon İste
kararları da log kanalına yansır.
