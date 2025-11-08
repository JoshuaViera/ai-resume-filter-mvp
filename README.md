# AI Resume Filter MVP

An AI-powered resume filtering and ranking system for small-to-midsize businesses in NYC.

## Team

- **Project Lead**: Database setup, integration, deployment
- **Developer 1**: Frontend components and UI
- **Developer 2**: Backend API and AI logic

## Features

- **Dual-Layer Filtering**: Filters candidates by skills/keywords AND geographic proximity
- **AI-Powered Parsing**: Uses OpenAI GPT-4 to extract candidate information
- **Smart Scoring**: Combines skill matching (70%) and location proximity (30%)
- **Multi-Format Support**: Handles PDF, DOC, DOCX, and TXT files
- **Real-time Processing**: Processes multiple resumes in a single batch
- **Export Functionality**: Download results as CSV

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 Turbo
- **Geolocation**: Google Maps Geocoding API
- **Storage**: Supabase Storage

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Google Maps API key
- GitHub account

## Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-resume-filter-mvp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys

4. **Run development server**
```bash
npm run dev
```

## Git Workflow

See the collaboration guide below for detailed Git instructions.

## Deployment

Deploy to Vercel - see deployment guide below.