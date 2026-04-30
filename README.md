# 🌍 StreamGlobe: Live Tracker

StreamGlobe is a high-performance, 3D interactive visualization tool for discovering live streams across multiple platforms in real-time. Built with Next.js 14, React Three Fiber (via Cobe), and Supabase.

## 🚀 Features

- **Real-time 3D Globe**: Visualize live streams exactly where they are happening.
- **Multi-Platform Support**: Integrated with YouTube, Twitch, Kick, and Facebook.
- **Smart Geolocation**: Automatic mapping of streams to global coordinates.
- **Live Filtering**: Filter by platform, viewer count, or search for specific channels.
- **Automated Sync**: Background cron jobs to keep the stream list updated.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database**: [Supabase](https://supabase.com/)
- **Globe**: [Cobe](https://github.com/shuding/cobe)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚦 Getting Started

### 1. Prerequisites

- Node.js 18+
- Supabase Project
- API Keys for YouTube/Twitch/Facebook

### 2. Environment Setup

Copy the `.env.local` template and fill in your keys:

```bash
# YouTube
YOUTUBE_API_KEY=...

# Twitch
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Installation & Run

```bash
npm install
npm run dev
```

## 📈 API Reference

- `GET /api/streams`: Returns the list of currently live streams.
- `GET /api/cron/refresh`: Triggers a global refresh of the stream database (Requires `Authorization` header).

## 📄 License

MIT © [Nav0077](https://github.com/Nav0077)
