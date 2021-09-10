# 0xNotes Monorepo

0xNotes is a free and open-source, privacy-focused, end-to-end encrypted note-taking web app built with Next.js and Python.

![2021-09-02_07-37](https://user-images.githubusercontent.com/40331046/131763217-6856e0a5-caa3-4a93-8ca3-563168c97a7e.png)


## Features

- Formatted text support: __Bold__, _italic_, underline, add images, embed youtube, and more...
- End-to-end encryption: Each note is encrypted locally with AES-CTR-256, currently one of the most secure encryption. The encryption key is derived from your username and password and stored locally on your browser. This means, hackers need to try 2^256 combinations to read your notes.
- Two-factor authentication: Secure your account by enabling Google Authenticator. You will be required to enter a 6-digit code every time you log in.

## Deploy

This tutorial is only for advanced users that want to self host 0xNotes. You'll need a web host that supports Next.js and a server that can run docker. HTTPS connection is highly recommended, but the frontend __MUST USE HTTPS__.

### Database
1. Create a PostgreSQL database.
2. Manually create tables:

```sql
CREATE TABLE notes (
    id bigserial primary key not null,
    author text,
    modified timestamp with time zone not null default now(),
    note text,
    notes_nonce text,
    server_nonce text,
    title text,
    title_nonce text,
    type text
);
```

```sql
CREATE TABLE users (
    id bigserial primary key not null,
    username text,
    auth text,
    totp text
);
```

### Backend
1. Clone and switch to the `server` branch of this repo.
2. Create a docker image by using `docker build -t 0xnotes:latest .`.
3. Create a `docker-compose.yml` file using the following template, add configuration for reverse proxy (NGINX or Traefik) if required.
```yaml
version: "3.3"

services:
  notes:
    image: 0xnotes
    restart: always
    container_name: 0xnotes
    ports:
      - "5000:5000"
    networks:
      - web
    environment:
      - "POSTGRES_URL={POSTGRES_URL}"
      - "SERVER_SECRET={SECRET_RANDOM_STRING}"
      - "SERVER_SALT={SECRET_RANDOM_STRING}"

networks:
  web:
    external: true
```
5. Run the docker image using `docker-compose up -d`

### Frontend

1. Deploy the `main` branch of this repo to Vercel, Netlify, or Cloudflare Pages. 
2. Create an environment variable `NEXT_PUBLIC_0XNOTES_HOST={API_HOST}`, where `API_HOST` is the URL of your API server. Example: `NEXT_PUBLIC_0XNOTES_HOST=https://0xnotesapi.brianthe.dev/`.
