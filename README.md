# Better Chat

A modern, feature-rich AI chat application built with Next.js 15 that supports multiple AI providers including OpenAI, Anthropic Claude, Google Gemini, and Groq. The application provides a seamless chatting experience with file uploads, user management, and a beautiful, responsive interface.

![Better Chat](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

## ✨ Features

### 🤖 Multi-Provider AI Support

-   **OpenAI**: GPT-4o, GPT-4o Mini
-   **Anthropic**: Claude Opus 4, Claude Sonnet 4
-   **Google**: Gemini 2.5 Pro, Gemini 2.5 Flash
-   **Groq**: DeepSeek R1, Llama 4 (Free models)

### 💬 Advanced Chat Features

-   Real-time streaming responses
-   File upload support (images, PDFs, text files, code)
-   Vision-capable models for image analysis
-   Thinking models support
-   Chat history and management
-   Star/favorite chats
-   Auto-generated chat titles

### 🔐 User Management

-   NextAuth.js authentication
-   User registration and login
-   Secure API key management with encryption
-   Profile and usage statistics
-   Settings management

### 🎨 Modern UI/UX

-   Responsive design for all devices
-   Dark/light mode support
-   Beautiful animations and transitions
-   Mobile-friendly sidebar
-   Drag-and-drop file uploads
-   Syntax highlighting for code blocks
-   Markdown rendering with LaTeX support

## 🚀 Tech Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **Database**: PostgreSQL with Prisma ORM
-   **Authentication**: NextAuth.js v5
-   **UI Components**: Radix UI primitives
-   **File Uploads**: UploadThing
-   **AI SDKs**: OpenAI, Anthropic, Google AI, Groq
-   **Deployment**: Vercel-ready

## 📁 Project Structure

```
better-chat/
├── app/                          # Next.js 15 app directory
│   ├── (main)/                   # Main authenticated routes
│   │   ├── chat/                 # Chat interface
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chats/                # Chat management
│   │   ├── keys/                 # API key management
│   │   └── files/                # File upload handling
│   ├── auth/                     # Authentication pages
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── chat/                     # Chat-related components
│   ├── sidebar/                  # Navigation sidebar
│   ├── settings/                 # Settings components
│   ├── ui/                       # Reusable UI components
│   └── shared/                   # Shared components
├── contexts/                     # React contexts
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── ai/                       # AI provider integrations
│   ├── services/                 # Business logic services
│   ├── types/                    # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware
└── package.json                  # Dependencies and scripts
```

## 🛠️ Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   PostgreSQL database
-   AI provider API keys (optional for free Groq models)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-username/better-chat.git
    cd better-chat
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    bun install
    ```

3. **Set up environment variables**

    ```bash
    cp .env.example .env.local
    ```

4. **Configure your environment variables** (see [Environment Variables](#environment-variables))

5. **Set up the database**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

6. **Run the development server**

    ```bash
    npm run dev
    # or
    bun dev
    ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/better_chat"
DIRECT_URL="postgresql://username:password@localhost:5432/better_chat"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider API Keys (optional - Groq models are free)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
GROQ_API_KEY="your-groq-api-key"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Encryption Key for API Keys
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### Getting API Keys

-   **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
-   **Anthropic**: [Anthropic Console](https://console.anthropic.com/)
-   **Google AI**: [Google AI Studio](https://aistudio.google.com/app/apikey)
-   **Groq**: [Groq Console](https://console.groq.com/keys)
-   **UploadThing**: [UploadThing Dashboard](https://uploadthing.com/dashboard)

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
bun dev             # Start development server with Bun

# Production
npm run build       # Build for production
npm run start       # Start production server

# Database
npx prisma generate # Generate Prisma client
npx prisma db push  # Push schema changes to database
npx prisma studio   # Open Prisma Studio

# Linting
npm run lint        # Run ESLint
```

## 🎯 Features in Detail

### AI Model Support

-   **Free Models**: DeepSeek R1 and Llama 4 via Groq (no API key required)
-   **Premium Models**: Access to latest OpenAI, Anthropic, and Google models
-   **Vision Support**: Upload and analyze images with vision-capable models
-   **Thinking Models**: Support for reasoning-capable models

### File Handling

-   **Supported Formats**: Images (PNG, JPG, WebP), PDFs, text files, code files
-   **Drag & Drop**: Intuitive file upload interface
-   **File Preview**: Preview uploaded files before sending
-   **Context Integration**: Files are automatically included in chat context

### User Experience

-   **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
-   **Dark/Light Mode**: Automatic theme switching support
-   **Real-time Streaming**: See AI responses as they're generated
-   **Chat Management**: Organize, rename, star, and delete chats
-   **Usage Statistics**: Track your API usage and costs

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import your project to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

-   Netlify
-   Railway
-   AWS Amplify
-   DigitalOcean App Platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org/) - The React framework for production
-   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
-   [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
-   [Prisma](https://www.prisma.io/) - Next-generation ORM
-   [NextAuth.js](https://next-auth.js.org/) - Complete open source authentication solution

## 📞 Support

If you have any questions or need help getting started, please open an issue on GitHub.

---

**Made with ❤️ using Next.js and modern web technologies**
