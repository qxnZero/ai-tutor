# AI Tutor

AI Tutor is an AI-powered learning platform that helps users create personalized courses on any topic. The application uses Google's Gemini AI to generate course content and interactive quizzes.

## Features

- Google Authentication
- Personalized course creation
- AI-generated course content
- Interactive quizzes and knowledge tests
- Progress tracking
- Bookmarks and notes
- Dark/light mode

## Tech Stack

- Next.js 15
- React 19
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Google Gemini AI
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

5. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Quick deployment options:

1. **Vercel** (Recommended):
   - Push to GitHub
   - Import to Vercel
   - Set environment variables
   - Deploy

2. **Railway**:
   - Push to GitHub
   - Import to Railway
   - Add PostgreSQL database
   - Set environment variables
   - Deploy

3. **Netlify**:
   - Push to GitHub
   - Import to Netlify
   - Configure build settings
   - Set environment variables
   - Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Google Gemini AI](https://ai.google.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
