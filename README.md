# Timelane

[![GitHub](https://img.shields.io/badge/GitHub-Timelane-181717?logo=github)](https://github.com/mayyuchencao/Timelane)
[![Live App](https://img.shields.io/badge/Live-timelane.maycao.com-3b82f6)](https://timelane.maycao.com)
![Status](https://img.shields.io/badge/Status-Active-84cc16)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)
![Resend](https://img.shields.io/badge/Resend-Email-0f172a)

Timelane is a personal time tracking web app for recording what you did, how long you spent, and how your days add up over time.

It is designed as a single-user productivity tool with account-based sync, forward timer tracking, manual entry editing, a multi-day timeline, and lightweight analytics.

## Demo

![Timelane demo](./demo/timelane-demo.png)

- Live app: [timelane.maycao.com](https://timelane.maycao.com)
- Demo video: [Watch the walkthrough](https://drive.google.com/file/d/1FImHMTleS4Cskbyg6ARY7h9MNEhakYDc/view?usp=sharing)

## Highlights

- Email magic link authentication
- Per-user activities and category groups
- Forward timer with start, pause, resume, and stop
- Manual time entry creation, editing, and deletion
- Automatic cross-day entry splitting
- Non-overlapping time entry validation
- 7-day timeline calendar
- Pie chart analytics for today, this week, this month, and total
- GitHub-style yearly heatmap based on recorded time
- Multi-device sync with exactly one active timer per account

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js
- Resend
- Recharts
- date-fns

## Core Rules

- `TimeEntry` is the source of truth for timeline rendering and analytics
- A user can have only one active timer across all devices
- Paused time remains blank on the timeline
- Resume creates a new timeline block instead of merging time ranges
- Historical entries remain even if an event or group changes later
- Entries shorter than one minute are stored as one minute

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/timelane?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
RESEND_API_KEY="re_replace_me"
RESEND_FROM="Timelane <noreply@yourdomain.com>"
```

For production on Vercel, configure the same variables in the project settings and set `NEXTAUTH_URL` to your deployed domain.

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

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- App routes: `src/app`
- UI components: `src/components`
- Shared helpers: `src/lib`
- Database schema: `prisma/schema.prisma`
- Initial migration: `prisma/migrations/0001_init/migration.sql`

## Deployment

Recommended deployment flow:

1. Push the project to GitHub
2. Import the repository into Vercel
3. Add all required environment variables
4. Connect your custom domain
5. Configure Resend with a verified sending domain
6. Deploy and verify login, timer actions, timeline, and analytics
