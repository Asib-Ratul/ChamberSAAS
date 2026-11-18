# Deployment

Chamber uses the built-in Node.js SQLite driver and stores its data on disk. Run one Node process with a persistent volume. Do not deploy the current implementation as a stateless function or run replicas with independent databases.

## Environment

- PORT: default 3100.
- HOST: default 127.0.0.1. Use 0.0.0.0 inside a container.
- DATABASE_PATH: default ./data/chamber.sqlite relative to the project.
- NODE_ENV: production for HTTPS-only session cookies.
- APP_ORIGIN: exact public HTTPS origin, without a trailing slash. Required in production.
- RESEND_API_KEY: API key for Resend, required to send password recovery emails.
- MAIL_FROM: sender address verified with Resend, for example `Chamber <accounts@your-domain.example>`.

The server reads environment variables; it does not automatically read .env. If using a local .env, start with `node --env-file=.env src/server.js`.

## Container

Build with `docker build -t chamber .`. Run with a mounted persistent data directory, NODE_ENV=production and APP_ORIGIN set to the real public origin. Put the service behind a TLS reverse proxy. The image runs as the non-root Node user; ensure the mounted data directory is writable by that user.

Example shape (replace the origin and mount location):

```text
docker run -p 3100:3100 --mount source=chamber-data,target=/app/data -e NODE_ENV=production -e APP_ORIGIN=https://queue.example.com chamber
```

The service exposes /. SQLite creates the database automatically on first start. New deployments preserve existing rows with CREATE TABLE IF NOT EXISTS. Future schema changes should use explicit versioned migrations.

## Operations

Back up SQLite using its online backup mechanism or stop the service before copying the database. In WAL mode, copying only the database file while writes are active is unsafe. Keep encrypted backups, restrict access and test restores.

Do not expose raw data files, credentials, password reset tokens or patient tracking tokens in logs or analytics. Apply a documented retention period. Configure the Resend API key and a verified sender address to enable password recovery emails.

The current IP limiter uses the socket peer address and does not trust forwarded headers. Configure rate limiting at the trusted edge when deploying behind a proxy; otherwise users may share a limit.

No billing, SMS or WhatsApp providers are connected. Resend is used only for staff password recovery email when configured.
