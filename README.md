# TikTok Case Discussion Board

Real-time classroom discussion board for the HBS TikTok case. Students submit answers on their phones, instructor controls the board plan projected on screen.

## Setup

### 1. Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Environment Variables

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and connect via [vercel.com](https://vercel.com). Add the two environment variables in Vercel's dashboard.

## Pages

| URL | Purpose |
|-----|---------|
| `/` | Student view — enter name, answer questions |
| `/instructor` | Instructor controls — advance steps, reveal on board, toggle mode |
| `/board` | Projected board plan — shows responses building up |

## Display Modes

- **Controlled** (default): Instructor manually reveals each step on the board
- **Live**: Responses stream onto the board in real-time as students submit
