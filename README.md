# GitHub Code Review Agent

An AI-powered code review bot that automatically review pull requests using GPT-4o-mini.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment variables file and configure it:

```bash
cp .env.example .env
```

3. Fill in your `.env` file:

```env
# Port for server (optional), defaults to 8080
PORT=8080

# Node environment `development|production`
NODE_ENV='production'

# OpenAI API Key
OPENAI_API_KEY=<key>

# GitHub Personal Access Token with repo scope
GITHUB_TOKEN=<key>

# Github webhook secret verifier
GITHUB_WEBHOOK_SECRET=<secret>
```

4. For testing locally, use ngrok
