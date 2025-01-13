# AWS Bedrock Agent Chat Interface

A Next.js application that integrates with AWS Bedrock Agent to provide a chat interface.

## Features

- Real-time chat interface with AWS Bedrock Agent
- Markdown rendering support
- Streaming response handling
- Error handling and logging

## Prerequisites

- Node.js 16+
- AWS Account with Bedrock access
- Configured AWS Bedrock Agent

## Environment Variables

Create a `.env.local` file with the following variables:

```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
BEDROCK_AGENT_ID=your-agent-id
BEDROCK_AGENT_ALIAS_ID=your-agent-alias-id
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Usage

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

The project uses:
- Next.js 14
- TypeScript
- AWS SDK v3
- TailwindCSS
- Shadcn UI

## License

MIT
