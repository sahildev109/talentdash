# TalentDash — Career Intelligence Platform

TalentDash is a career intelligence platform that provides structured, comparable, and decision-ready compensation data for tech and other roles in India. Built with Next.js 15, Prisma, and Tailwind CSS, the platform delivers fast performance and robust SEO via React Server Components (RSC), static page generation (SSG), Incremental Static Regeneration (ISR), and embedded JSON-LD structured data.

## Prerequisites
- **Node.js**: version 20 or higher
- **Database**: A Neon PostgreSQL database account (or equivalent PostgreSQL database)

## Local Setup (Under 5 Minutes)

Follow these exact commands to get the application running locally:

```bash
# 1. Clone the repository and install dependencies
git clone https://github.com/yourusername/talentdash
cd talentdash
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Open .env.local and populate the DATABASE_URL with your Neon PostgreSQL connection string

# 3. Apply database migrations
npx prisma migrate dev --name init

# 4. Seed the database with test data (60+ records across 12 companies)
npx prisma db seed

# 5. Start the local development server
npm run dev
# The application will be running at http://localhost:3000
```

---

## Architecture Decisions

### 1. Static vs ISR vs Dynamic Rendering
Every page's rendering strategy is selected to optimize LCP (Largest Contentful Paint) and SEO ranking:

| Route | Strategy | Rationale / Why |
| --- | --- | --- |
| `/` (Homepage) | ISR (3600s) | Displays dynamic content like trending companies and recent submissions. Regenerated in the background every hour to keep edge cache fresh without blocking requests. |
| `/salaries` | SSG + ISR Trigger | The primary SEO asset. Built statically to eliminate SSR latency which harms search rankings. ISR triggers on ingestion to keep the listing fresh. |
| `/salaries/[role]` | SSG + ISR (3600s) | Role-specific pages built statically at build-time for fast SEO indexing, with background updates hourly. |
| `/companies/[slug]` | SSG (from live DB slugs) | Pre-rendered for all companies in the database at build time. Live DB queries during build ensure pages are created for newly added companies without code updates. |
| `/compare` | Client Component (`'use client'`) | Interactive tool relying on dynamic user choices synced to URL search parameters. The possible combinations are too large to build statically. |

### 2. Pagination: Page-Based vs Cursor-Based
Page-based pagination was chosen for the directory tables because:
- It matches user expectations for structured catalog tables (allows direct navigation to pages 2, 3, etc.).
- It allows rendering helpful status text like `"Showing 26-50 of 312 records"` by calculating a cheap `COUNT(*)` in a transactional query.
- It integrates cleanly with search filters.
- *Note: Cursor-based pagination would only be preferred for infinite scroll feeds or datasets exceeding 1M+ rows.*

### 3. Features Not Built (Scope Decisions)
- **Authentication (Clerk/Auth.js)**: Not built to ensure a zero-friction experience without login walls for database browsing.
- **Upstash Redis / BullMQ Queue**: Not built because Next.js ISR `revalidatePath` handles revalidation directly, making an external worker queue unnecessary for MVP ingestion rates.
- **Typesense Search**: PostgreSQL `ILIKE` queries coupled with composite indexes are fast enough for the target dataset scale (under 100k records).

### 4. Future Roadmap & Design Improvements
- Add a background processing queue for batch ingestion of scraped salary data.
- Introduce Server Actions for search filter handling to remove the `'use client'` wrapper on the filter component.
- Implement an XML sitemap generator (`app/sitemap.ts`) that builds dynamic sitemap records querying the database at build time.

---

## API Reference

| Endpoint | Method | Parameters | Response Shape / Details | Cache TTL |
| --- | --- | --- | --- | --- |
| `/api/ingest-salary` | **POST** | JSON body containing company details, base/bonus/equity, source, level, and location. | `201 Created` with full record including normalized company relations. Strips client-side total comp and recomputes on server. | None |
| `/api/salaries` | **GET** | Query parameters: `company`, `role`, `level`, `location`, `currency`, `sort`, `page`, `limit`. | `{ data: Salary[], meta: { total, page, limit, totalPages } }`. Pagination limit is strictly capped at `100`. | `s-maxage=300`, `stale-while-revalidate=3600` |
| `/api/companies/[slug]` | **GET** | `slug` (in path) | Returns company details, list of salaries ordered by total compensation, computed median compensation, and a `level_distribution` record. | `s-maxage=3600`, `stale-while-revalidate=86400` |
| `/api/compare` | **GET** | Query parameters: `s1` (Salary ID 1), `s2` (Salary ID 2) | Returns `{ record_1, record_2, delta }` showing differences across base salary, bonus, stock, total comp, and experience. | `no-cache` |
