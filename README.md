# monynhahubmain2

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/marcelos-projects-967056f3/v0-monynhahubmain2)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/uA6bMR2JjW8)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/marcelos-projects-967056f3/v0-monynhahubmain2](https://vercel.com/marcelos-projects-967056f3/v0-monynhahubmain2)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/uA6bMR2JjW8](https://v0.app/chat/projects/uA6bMR2JjW8)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Middleware

Authentication is handled by [Clerk](https://clerk.com) via a single middleware located at [`middleware.ts`](middleware.ts).
This file protects routes like `/dashboard` and `/admin` and there are no other middleware files (such as a Supabase middleware) in the codebase.
