# AI Tutor

AI Tutor is an AI-powered learning platform that helps users create personalized courses on any topic. The application uses Google's Gemini AI to generate course content and interactive quizzes.

## Features

- Google Authentication
- Personalized course creation
- AI-generated course content with HTML formatting
- Interactive quizzes and knowledge tests
- Progress tracking
- Bookmarks and notes
- Dark/light mode
- Teaching Assistant powered by Gemini AI
- Unified Next.js backend architecture

## Tech Stack

- Next.js 15
- React 19
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Google Gemini AI (2.0 Flash model)
- Tailwind CSS
- Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- Gemini API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-tutor.git
cd ai-tutor
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the application:

```bash
# Start the Next.js application
bun run dev
```

The application will be available at http://localhost:3000.



### API Documentation

All API endpoints are now handled by the Next.js backend at `/api/*` routes.

## Deployment

Quick deployment options:

1. **Vercel** (Recommended):
   - Push to GitHub
   - Import to Vercel
   - Set environment variables
   - Deploy

2. **VPS**:
   - Clone repository to VPS
   - Configure environment variables
   - Run `bun run build`
   - Start with `bun run start`

3. **Docker**:
   - Build Docker image: `docker build -t ai-tutor .`
   - Run container: `docker run -p 3000:3000 ai-tutor`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Google Gemini AI](https://ai.google.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
