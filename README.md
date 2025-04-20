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
- Dual backend architecture (Next.js + PHP)

## Tech Stack

- Next.js 15
- React 19
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Google Gemini AI (2.0 Flash model)
- PHP 8.0+ (secondary backend)
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
# Start only Next.js backend
bun run dev

# Start both Next.js and PHP backends
./ai-tutor dev
# or
bun run dev:dual

# For interactive mode with menu options
./ai-tutor
```

The Next.js application will be available at http://localhost:3000.
The PHP backend will be available at http://localhost:8000.

For detailed information about the unified command system, see [COMMAND_SYSTEM.md](COMMAND_SYSTEM.md).

## Deployment

For detailed deployment instructions, see [DUAL_BACKEND.md](DUAL_BACKEND.md).

Quick deployment options:

1. **Azure VPS** (Recommended for dual backend):
   - Clone repository to VPS
   - Run setup script: `bun run setup:azure`
   - Configure environment variables
   - Start application: `bun run start:dual`

2. **Vercel** (Next.js only):
   - Push to GitHub
   - Import to Vercel
   - Set environment variables
   - Deploy
   - Note: PHP backend must be deployed separately

3. **Docker**:
   - Build Docker image: `docker build -t ai-tutor .`
   - Run container: `docker run -p 3000:3000 ai-tutor`
   - Note: PHP backend must be configured separately

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Google Gemini AI](https://ai.google.dev/)
- [Shadcn UI](https://ui.shadcn.com/)

## Recent Updates

### Enhanced Course Generation (June 2024)
- Improved JSON parsing with 7 progressive approaches
- Added HTML content handling in lesson materials
- Enhanced error recovery for more reliable course generation
- Fixed issues with course structure and content formatting
