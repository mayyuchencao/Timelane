# Timelane

Timelane is a personal time tracking app built with Next.js and deployed on Vercel.

It is designed for a single-user, account-based workflow with:

- email magic link login
- custom activity groups and events
- forward timer tracking with pause and resume
- manual time entry
- a multi-day timeline view
- pie chart analytics
- multi-device sync with exactly one active timer per account

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js
- Resend
- Recharts
- date-fns

## Features

- Magic link sign-in with email as the unique identity
- Display name and timezone per account
- Group and event management
- 18 candy-color presets for events
- Soft delete for events while keeping historical snapshots
- Server-enforced single active timer per account
- Pause and resume create separate timeline blocks
- Manual entry creation and editing
- Overlap prevention for time entries
- Cross-day entry splitting
- 7-day timeline layout
- Pie chart analytics for today, this week, this month, and total

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/timelane?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
RESEND_API_KEY="re_replace_me"
RESEND_FROM="Timelane <onboarding@resend.dev>"
```

For production on Vercel, add the same variables in the project settings and set `NEXTAUTH_URL` to your deployed domain.

## Local Development

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database

The Prisma schema is located at:

- `prisma/schema.prisma`

The initial SQL migration is located at:

- `prisma/migrations/0001_init/migration.sql`

## Deployment

Recommended deployment flow:

1. Push the project to GitHub
2. Import the repository into Vercel
3. Add all required environment variables
4. Deploy
5. Verify login, timer actions, timeline, and analytics

## Notes

- `TimeEntry` is the source of truth for timeline rendering and analytics
- historical records keep activity snapshot data even after an event is deleted
- only one active timer is allowed per account across all devices
- for production email delivery, use a verified Resend domain instead of the default test sender
