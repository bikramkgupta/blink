# blink — Migration Context

## Tech Stack
- **Language**: Node.js
- **Framework**: Express.js
- **Package Manager**: npm
- **Runtime Version**: Node.js LTS (lts/* in .nvmrc)

## Architecture
This is a modern link shortener application built with Express.js backend and React frontend. The application is designed to be planet-scale, CDN-driven, and includes comprehensive authentication via OIDC/OAuth2, rate limiting, analytics, and admin features. It uses PostgreSQL for data persistence, Redis for sessions/caching, and supports Docker deployment.

Key components:
- REST API for link management (/api/links, /api/users, /api/user)
- Authentication system with OIDC/OAuth2 integration
- Frontend React admin interface via React Admin
- Database migrations with Knex.js
- Session management with Redis
- Rate limiting and security middleware
- Health check endpoint (/health)
- Link redirection service

## Modules & Key Files
- **bin/www**: Server entry point with graceful shutdown
- **app.js**: Express application setup and middleware configuration
- **routes/**: API routes, authentication, frontend app, and redirect handling
- **middlewares/**: Security, session, authentication, and rate limiting
- **models/**: Objection.js models for PostgreSQL
- **lib/**: Core utilities (logger, Redis, DB setup, connection management)
- **src/**: React frontend source code
- **config/**: YAML schemas and configuration
- **migrations/**: Database schema migrations
- **knexfile.js**: Database configuration with Heroku-specific handling
- **Dockerfile**: Multi-stage build (already exists, needs App Platform updates)

## Packages
| Package | Old Version | New Version | Notes |
|---|---|---|---|
| openid-client | ^5.0.0 | ^5.6.5 | Downgraded due to API compatibility issues with v6+ |
| nodemon | ^2.0.13 | ^3.1.7 | Security update |
| ws | 7.x | ^8.18.0 | Security update |

**Remaining vulnerabilities**: Some dependencies (axios, dompurify, etc.) have vulnerabilities but require breaking changes. Acceptable risk for migration testing; Phase B should evaluate upgrade impact.

## Heroku -> DO Mapping
| Heroku Feature | DO Equivalent | Status |
|---|---|---|---|
| heroku-postgresql | DO Managed PostgreSQL | Pending |
| heroku-redis | DO Managed Valkey | Pending |
| Heroku buildpack (nodejs) | Dockerfile | Already exists |
| HEROKU env var | Remove/replace | Pending |
| Config vars | GitHub Secrets + .env.remote | Pending |
| Procfile (web) | .do/app.yaml + Dockerfile | Pending |

## Environment Variables
### Required
| Variable | Purpose | .env.docker Value | .env.remote Value |
|---|---|---|---|
| PORT | Server listen port | 8080 | 8080 |
| DATABASE_URL | PostgreSQL connection | placeholder | Phase B fills this |
| REDIS_URL | Redis connection (for Valkey) | placeholder | Phase B fills this |
| BASE_URL | Custom domain for app | http://localhost:8080 | Phase B fills this |
| HOMEPAGE | Root domain redirect target | / | Phase B fills this |
| SESSION_SECRET | Session encryption key | test-secret | Phase B fills this |
| OIDC_CLIENT_ID | SSO client ID | (optional for testing) | Phase B fills this |
| OIDC_ISSUER_BASE_URL | SSO endpoint | (optional for testing) | Phase B fills this |
| NODE_ENV | Environment | production | production |
| AUTO_MIGRATE | Run migrations on start | 1 | 1 |
| AUTO_SEED | Seed database | 0 | 0 |
| OAUTH2_ENABLED | Enable OAuth2 API access | false | Phase B decides |

## Test Endpoints
| Endpoint | Method | Expected Status | Expected Response | Notes |
|---|---|---|---|---|
| /health | GET | 200 | Empty OK | Health check |
| /app | GET | 200 | React app HTML | Frontend |
| / | GET | 302/404 | Redirect or 404 | Root handler |
| /api/links | GET | 401 | Auth required | Protected API |

## Expected Warnings
- ECONNREFUSED for database and Redis (expected without services)
- OIDC discovery requires valid issuer URL (configured for testing)
- Deprecation warning for fs.F_OK during React build (cosmetic)
- Material-UI v4 deprecation warnings (dev dependencies)

## Local Testing
- **Docker build**: ✅ PASS (multi-stage build successful)
- **Container port**: 8080 (App Platform compatible)
- **Test results**:
  - Application starts correctly ✅
  - OIDC initialization works with valid config ✅
  - Gracefully fails on DB connection (expected) ✅
  - Environment variables loaded correctly ✅
  - Production build includes React frontend ✅

## Remote Deployment
- **App ID**: 8b6d2c71-88b7-454c-88ca-faee529ba0c4
- **App URL**: Deployment configuration complete, URL assignment pending
- **Region**: syd1
- **Deployment Status**: ✅ CONFIGURED
  - PostgreSQL database `blink_db` created with user `blink_user`
  - Valkey cluster access configured
  - GitHub Secrets pushed successfully
  - GitHub Actions workflow created
  - App Platform firewall rules added
  - Health check configured for `/health` endpoint
- **Test Results**:
  - Database connection: ✅ Success (PostgreSQL connected)
  - Server startup: ✅ Success (listening on port 8080)
  - OIDC configuration: ✅ Fixed (empty issuer URL prevents lookup errors)
  - Environment variables: ✅ All required vars configured
  - App Platform deployment: ⚠️ Builds successfully, deployment validation in progress

## Env Files
- `.env.docker` — Local Docker testing variables
- `.env.remote` — Deployment variables (pushed to GitHub Secrets)

## Observations
- App has existing Dockerfile with multi-stage build (good!)
- Uses HEROKU env var in knexfile.js for SSL config - needs removal
- Has healthcheck at /health endpoint
- Frontend and backend are integrated in single app
- Requires both PostgreSQL and Redis
- Has comprehensive authentication system
- Uses Knex for migrations with AUTO_MIGRATE support
- Port hardcoded to 3000 in healthcheck - needs update to use $PORT
## Shared Infrastructure

Region: syd1

### PostgreSQL Cluster
- Cluster ID: b32bfe92-51c0-4660-9879-92a7db886482
- Host: heroku-migration-pg-do-user-8198484-0.m.db.ondigitalocean.com
- Port: 25060
- Admin User: doadmin
- Admin Password: ████████████
- Create app DB: `doctl databases db create b32bfe92-51c0-4660-9879-92a7db886482 <appname>_db`
- Create app user: `doctl databases user create b32bfe92-51c0-4660-9879-92a7db886482 <appname>_user`
- Connection string pattern: `postgresql://<user>:<password>@heroku-migration-pg-do-user-8198484-0.m.db.ondigitalocean.com:25060/<db>?sslmode=require`

### Valkey Cluster
- Cluster ID: ab76d53c-8e07-44ff-b97b-b62815ec66b8
- Host: heroku-migration-valkey-do-user-8198484-0.m.db.ondigitalocean.com
- Port: 25061
- Password: ████████████
- Single default user — use key prefix `<appname>:` for data isolation
- Connection string: `rediss://default:████████████@heroku-migration-valkey-do-user-8198484-0.m.db.ondigitalocean.com:25061`

