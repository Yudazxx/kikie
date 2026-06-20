# 🤖 Discord Bot — Termux Optimized

Bot Discord lengkap dengan Moderation, Boost Features, AFK Voice Channel, Auto-Mod, dan Embed Builder. Dioptimalkan untuk Termux (Android).

---

## ✨ Fitur

### 🛡️ Moderation
| Perintah | Deskripsi |
|---|---|
| `/warn` | Beri peringatan kepada member |
| `/warnings` | Lihat daftar warning user |
| `/clearwarnings` | Hapus semua warning user |
| `/timeout` | Timeout member (1 menit - 28 hari) |
| `/kick` | Kick member dari server |
| `/ban` | Ban member dari server |
| `/automodconfig` | Konfigurasi anti-spam, anti-link, anti-mention |

### 🚀 Boost Features
| Perintah | Deskripsi |
|---|---|
| `/setboostchannel` | Atur channel dan pesan boost |
| `/boostconfig` | Kustomisasi warna, footer, gambar embed boost |

**Variabel pesan boost:** `{mention_user}` `{username}` `{server}` `{boost_count}`

### 🎙️ AFK Voice Channel
| Perintah | Deskripsi |
|---|---|
| `/setafkvoice #channel` | Bot join dan stay 24/7 di voice channel |
| `/removeafkvoice` | Bot leave dan hapus konfigurasi |

### 🎨 Customization
| Perintah | Deskripsi |
|---|---|
| `/embedbuilder` | GUI editor untuk buat embed kustom |
| `/boostconfig` | Custom color, footer, image, thumbnail |

### 🤖 Auto-Moderation (Otomatis)
- **Anti-Spam** — timeout member yang spam pesan
- **Anti-Link** — hapus pesan berisi link/invite
- **Anti-Mention Spam** — warn member yang mention banyak user sekaligus

---

## 📱 Instalasi di Termux

### Langkah 1 — Siapkan Termux
```bash
pkg update -y
pkg install nodejs git -y
```

### Langkah 2 — Clone Repository
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME/discord-bot
```

> Atau jika kamu download ZIP, ekstrak dan masuk ke folder `discord-bot`.

### Langkah 3 — Isi Konfigurasi
```bash
cp .env.example .env
nano .env
```

Isi file `.env`:
```env
DISCORD_TOKEN=token_bot_discord_kamu
CLIENT_ID=id_aplikasi_bot_kamu
GUILD_ID=id_server_kamu   # opsional, untuk deploy command lebih cepat
```

**Cara dapatkan TOKEN dan CLIENT_ID:**
1. Buka https://discord.com/developers/applications
2. Buat atau pilih aplikasi
3. Masuk ke menu **Bot** → copy **Token**
4. Masuk ke menu **General Information** → copy **Application ID** (= CLIENT_ID)

**Izin Bot yang Diperlukan (di Discord Developer Portal):**
- Bot Intents: `GUILD_MEMBERS`, `MESSAGE_CONTENT`, `GUILD_PRESENCES`
- Bot Permissions: `Administrator` (atau minimal: Manage Messages, Moderate Members, Kick Members, Ban Members, Connect, Speak)

### Langkah 4 — Jalankan Bot
```bash
bash start.sh
```

Script akan otomatis:
- ✅ Cek versi Node.js
- ✅ Install semua dependencies
- ✅ Deploy slash commands ke Discord
- ✅ Jalankan bot dengan auto-restart

---

## 🔄 Menjalankan Bot 24/7 di Termux

### Opsi 1: tmux (Recommended)
```bash
pkg install tmux -y
tmux new -s bot
bash start.sh
# Tekan Ctrl+B lalu D untuk detach (bot tetap jalan)
# Untuk kembali: tmux attach -t bot
```

### Opsi 2: nohup
```bash
nohup bash start.sh > bot.log 2>&1 &
# Lihat log: tail -f bot.log
# Stop: kill $(cat bot.pid)
```

---

## 🔧 Update Commands
Jika kamu menambah atau mengubah slash commands, hapus flag deploy dan restart:
```bash
rm .commands_deployed
bash start.sh
```

---

## 📁 Struktur File
```
discord-bot/
├── src/
│   ├── index.js              # Entry point bot
│   ├── database.js           # SQLite database (better-sqlite3)
│   ├── deploy-commands.js    # Deploy slash commands
│   ├── commands/
│   │   ├── moderation/       # warn, warnings, timeout, kick, ban
│   │   ├── boost/            # setboostchannel, boostconfig
│   │   └── config/           # setafkvoice, removeafkvoice, embedbuilder, automodconfig
│   ├── events/
│   │   ├── ready.js
│   │   ├── messageCreate.js  # trigger auto-mod
│   │   ├── guildMemberUpdate.js  # detect boost
│   │   ├── voiceStateUpdate.js   # reconnect AFK voice
│   │   └── interactionCreate.js  # handle slash commands
│   └── handlers/
│       ├── automod.js        # Anti-spam, anti-link, anti-mention
│       └── voiceManager.js   # AFK voice channel manager
├── data/
│   └── bot.db               # Database SQLite (auto-dibuat)
├── .env                     # Konfigurasi (TOKEN, dll)
├── .env.example             # Template konfigurasi
├── package.json
└── start.sh                 # Termux startup script
```

---

## ❓ Troubleshooting

**Error: `better-sqlite3` gagal build**
```bash
pkg install python make clang -y
npm install
```

**Error: `@discordjs/voice` / opus error**
```bash
pkg install ffmpeg -y
npm install opusscript
```

**Bot tidak mau connect ke voice channel**
- Pastikan bot punya izin `Connect` dan `View Channel` di voice channel tersebut
- Coba `/removeafkvoice` lalu `/setafkvoice` lagi

**Slash commands tidak muncul**
- Tunggu hingga 1 jam (global commands)
- Atau isi `GUILD_ID` di `.env` untuk instant deploy
- Hapus `.commands_deployed` lalu restart bot
