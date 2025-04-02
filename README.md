# AI Course Roadmap Generator

This application uses the Gemini API to generate personalized course roadmaps based on user input. The roadmaps are stored in a PostgreSQL database and can be viewed and managed by users.

## Features

- Generate personalized course roadmaps using AI
- Store and retrieve course data from PostgreSQL
- View detailed course outlines with modules and lessons
- Search and filter your courses
- Responsive design for all devices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (via Neon DB)
- Google Gemini API
- Tailwind CSS
- shadcn/ui components

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GEMINI_API_KEY`: Your Google Gemini API key
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application is deployed on Vercel with a PostgreSQL database from Neon DB.

## License

MIT

