# Kaaras Luxe Glow

Independent premium salon website for Kaaras Beauty Saloon & Makeover.

The application runs independently of Lovable and uses:

- React 19
- TypeScript
- TanStack Start / TanStack Router
- Vite 8
- Nitro
- Tailwind CSS 4
- Supabase
- Vercel-compatible deployment

## Local development

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Create `.env.local` from `.env.example` and provide the Supabase publishable key.

## Environment variables

Browser/client variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-only variables, when required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `RESEND_API_KEY`
- `KAARAS_NOTIFICATION_EMAIL`
- `KAARAS_FROM_EMAIL`
- `KAARAS_CRON_SECRET`
- `KAARAS_CRON_SECRET_PREVIOUS`
- `DATABASE_URL` (only for Drizzle tooling)

Never commit `.env.local`, service-role keys, or other private secrets.

## Owner authentication

The current owner flow uses Supabase email/password authentication. Create the owner in Supabase Auth and grant the required admin role using the existing database setup.

## Supabase

The project is connected to the existing Supabase project. Do not recreate the database or rerun migrations out of order.

## Deployment to Vercel

1. Import the GitHub repository into Vercel.
2. Add the required environment variables in Vercel Project Settings.
3. Deploy.

`vercel.json` is included for explicit TanStack Start framework detection.

## Scope

- Razorpay is intentionally not included.
- A native mobile app is intentionally not included.
- Keep real salon/business information and real images.
- Do not add fabricated reviews, ratings, customer counts, or business claims.
