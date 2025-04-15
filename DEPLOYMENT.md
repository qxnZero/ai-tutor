# Deployment Guide for AI Tutor

This guide will help you deploy your AI Tutor application to various platforms.

## Prerequisites

Before deploying, make sure you have:

1. A GitHub account
2. A Vercel, Netlify, or Railway account
3. A PostgreSQL database (Neon, Supabase, Railway, etc.)
4. Google OAuth credentials
5. Gemini API key

## Environment Variables

Make sure to set the following environment variables in your deployment platform:

```
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://your-production-url.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: .next
5. Add all the environment variables from the section above
6. Click "Deploy"

After deployment, you'll need to run the database migrations:

```bash
npx prisma migrate deploy
```

You can do this by setting up a build command in Vercel:

```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Option 2: Railway

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and sign up/login
3. Create a new project and select "Deploy from GitHub repo"
4. Select your repository
5. Add a PostgreSQL database from the Railway dashboard
6. Configure the environment variables
7. Deploy your application

### Option 3: Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click "New site from Git" and select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add all the environment variables
6. Click "Deploy site"

## Database Setup

For any deployment option, you'll need a PostgreSQL database. Here are some options:

1. [Neon](https://neon.tech) - Serverless Postgres with generous free tier
2. [Supabase](https://supabase.com) - Open source Firebase alternative with Postgres
3. [Railway](https://railway.app) - Provides PostgreSQL databases
4. [Render](https://render.com) - Offers PostgreSQL databases

After setting up your database, update the `DATABASE_URL` environment variable in your deployment platform.

## Post-Deployment

After deploying:

1. Verify that your application is working correctly
2. Check that Google authentication is working
3. Test the course creation and AI features
4. Set up a custom domain if needed

## Troubleshooting

If you encounter issues:

1. Check the deployment logs
2. Verify all environment variables are set correctly
3. Ensure your database is accessible from your deployment platform
4. Check that your Google OAuth credentials are configured with the correct redirect URIs

For Google OAuth, make sure to add your production URL to the authorized redirect URIs in the Google Cloud Console:
`https://your-production-url.com/api/auth/callback/google`
