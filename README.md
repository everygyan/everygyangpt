# EveryGyan

EveryGyan is a responsive digital magazine for news, travel, entertainment, health and practical learning. This repository contains the initial Next.js product experience and the database blueprint for Supabase.

## Included in this foundation

- Responsive editorial homepage for desktop, tablet and mobile
- Article pages with author details, topics and comment entry point
- Search experience across sample content
- Light and dark modes
- Multilingual-ready language selector
- Resend-powered newsletter with secure double opt-in and confirmation-based unsubscribe
- Supabase email/password registration, sign-in, password reset and persistent sessions
- Role-protected admin overview with live article, comment and subscriber counts
- Database-backed rich article editor with drafts, publishing, editing, categories, tags and pasted-image uploads
- Anonymous reader comments with administrator hide, restore and delete controls
- Database-driven Live ticker and a selectable homepage carousel capped at 25 articles
- Dedicated publishing pages for articles, comments, subscribers and website menus
- Initial Supabase schema, roles and Row Level Security policies
- Generated EveryGyan logo in `public/everygyan-logo.png`

## Run locally

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful pages:

- `/` — publication homepage
- `/article/cities-rethinking-the-future-of-urban-travel` — article template
- `/search` — search prototype
- `/login` and `/signup` — authentication
- `/account` — signed-in reader account
- `/admin` — protected admin overview
- `/admin/articles/new` — create and publish an article

## Quality checks

```bash
npm run lint
npm run build
```

## Connect Supabase

1. Create a new Supabase project for EveryGyan.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
3. Install/login to the Supabase CLI without putting credentials in Git.
4. Link this folder to the project.
5. Review and apply all SQL files in `supabase/migrations` in filename order. Existing projects must also apply `202608300001_anonymous_comments.sql` before anonymous comments can be posted.
6. Configure `SUPABASE_SERVICE_ROLE_KEY` as a server-only secret. The first editorial image upload creates the public `article-images` bucket automatically.
7. In Supabase Authentication settings, set the Site URL to the deployed Hostinger preview URL and add both `http://localhost:3000/**` and the Hostinger preview URL to Redirect URLs.
8. Register Sandeep's account at `/signup`, confirm its email, then run this once in the Supabase SQL Editor:

```sql
select public.promote_user_to_admin('YOUR-REGISTERED-EMAIL@example.com');
```

9. Sign out and back in. The account will now open the publishing dashboard. There is deliberately no default admin email or password in the source code.

The service-role key must be configured only as a server/hosting secret. Never prefix it with `NEXT_PUBLIC_` or commit it.

The former hard-coded demonstration stories are now imported into Supabase and can be edited or deleted from the admin dashboard. For a new database, run `npm run seed:samples` once after promoting an admin account. The command is idempotent and does not overwrite existing stories.

The primary website navigation is stored in the existing `menus` and `menu_items` tables. Run `npm run seed:navigation` once for a new database to create the default section and category menu. Administrators can then create, edit, hide, reorder, nest or delete items at `/admin/menus`.

## Newsletter setup

1. Verify `mail.everygyan.com` as a sending domain in Resend.
2. Create a sending-only Resend API key and save it as `NEWSLETTER_API_KEY`.
3. Set `NEWSLETTER_FROM_EMAIL` to `EveryGyan <newsletter@mail.everygyan.com>`.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS site URL so email links point to the live website.
5. Apply `202608270002_newsletter_double_opt_in.sql` after the initial Supabase migration.

The Resend key is read only by the server route. Newsletter addresses remain protected by Supabase Row Level Security and can only be changed publicly through the limited subscribe, confirm and unsubscribe functions.

## GitHub workflow

1. Create a private empty repository named `everygyan`.
2. Add it as this repository's `origin`.
3. Push the initial `main` branch.
4. Add branch protection after the first push.
5. Develop changes on feature branches and merge reviewed changes into `main`.

## Hostinger deployment

The target is Hostinger Business Web Hosting using its Node.js Web App flow:

- Framework: Next.js
- Node version: 22 or 24
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- Production branch: `main`

Connect the GitHub repository in hPanel, then add the production environment variables in Hostinger rather than uploading an `.env` file. Keep `everygyan.com` on the existing website until the new deployment has been tested on a temporary Hostinger URL.

The following Hostinger variables are required before building or redeploying:

- `NEXT_PUBLIC_SITE_URL` — the temporary Hostinger URL, without `/**`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEWSLETTER_API_KEY`
- `NEWSLETTER_FROM_EMAIL`

Use `/api/health` to verify the non-secret configuration status. Supabase redirect allowlist entries may end in `/**`, but browser URLs and `NEXT_PUBLIC_SITE_URL` must not.

## Remaining product phases

The authentication and core publishing workflow are connected. The next additions are Supabase Storage media uploads, live comments and moderation, configurable menus, newsletter campaign composition, multilingual routing, sitemap/RSS, structured data and production analytics.
