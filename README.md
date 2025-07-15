# 🎯 Planning Poker

<div align="center">

![Planning Poker](https://img.shields.io/badge/Planning%20Poker-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-11-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)

## 🤖 Built Entirely with AI

**This entire application was created completely using artificial intelligence** - from architecture design to code implementation, UI/UX design, and documentation.

**🚀 Collaborative estimation tool for agile development teams**

[🚀 Live Demo](https://planning-poker-scrum.vercel.app/) | [📱 Mobile Friendly](https://planning-poker-scrum.vercel.app/) | [🇹🇷 Türkçe](https://planning-poker-scrum.vercel.app/)

</div>

---

## ✨ Features

### 🎮 Core Functionality

- **Real-time Voting**: Instant vote updates across all connected devices
- **Multiple Point Scales**: Fibonacci, Modified Fibonacci, T-shirt sizes, Powers of 2
- **Secret Voting**: Votes are hidden until revealed by admin
- **Unanimous Vote Celebration**: Confetti animation when all team members agree
- **Session Management**: Persistent user sessions with automatic reconnection

### 🎨 User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Switch between themes for comfortable viewing
- **Multi-language Support**: English and Turkish localization
- **QR Code Sharing**: Easy room sharing via QR codes
- **Visual Analytics**: Pie and bar charts for vote analysis
- **Admin Controls**: Room management and user oversight

### 🛠 Technical Features

- **Edge Runtime**: Lightning-fast performance with Next.js Edge
- **Real-time Database**: Firebase Firestore for instant synchronization
- **Offline-first**: Local storage for session persistence
- **Auto-reconnection**: Handles network disconnections gracefully
- **Type Safety**: Full TypeScript implementation

---

## 🚀 Tech Stack

### Frontend Framework

- **[Next.js 15](https://nextjs.org/)** - React framework with Edge runtime
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Database & Backend

- **[Firebase 11](https://firebase.google.com/)** - Real-time database (Firestore)
- **[Vercel](https://vercel.com/)** - Serverless deployment platform

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12](https://www.framer.com/motion/)** - Production-ready motion library
- **[Heroicons 2](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[React Icons 5](https://react-icons.github.io/react-icons/)** - Popular icon library

### Data Visualization

- **[Recharts 3](https://recharts.org/)** - Composable charting library
- **[React Confetti 6](https://www.npmjs.com/package/react-confetti)** - Celebration animations

### User Experience

- **[React Hot Toast 2](https://react-hot-toast.com/)** - Smoking hot notifications
- **[QRCode.react 4](https://www.npmjs.com/package/qrcode.react)** - QR code generation

### Development Tools

- **[ESLint 9](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS processing

---

## 🎯 How It Works

### 1. Create Room

- Choose your preferred point scale (Fibonacci, T-shirt, etc.)
- Set a custom room name
- Become the room admin automatically

### 2. Invite Team

- Share room URL or QR code
- Team members join instantly without registration
- Admin controls for room management

### 3. Vote & Reveal

- Secret voting on story points
- Visual indicators for who has voted
- Unanimous votes trigger celebration
- Charts show voting distribution

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kadiraydinli/planning-poker.git
   cd planning-poker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
planning-poker/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── room/[id]/      # Dynamic room pages
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── PlayerCircle.tsx
│   │   ├── VoteResults.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── scaleTypes.ts   # Point scale definitions
│   ├── locales/            # Internationalization
│   │   ├── en.json         # English translations
│   │   └── tr.json         # Turkish translations
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── ...
```

---

## 🌟 Key Features Deep Dive

### Real-time Synchronization

- Firestore real-time listeners ensure instant vote updates
- Session management with automatic reconnection
- Optimistic UI updates for smooth user experience

### Point Scale System

- **Fibonacci**: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
- **Modified Fibonacci**: 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100
- **T-shirt Sizes**: XS, S, M, L, XL, XXL
- **Powers of 2**: 0, 1, 2, 4, 8, 16, 32, 64

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Touch-friendly interface for mobile devices
- Adaptive layouts for different screen sizes

---

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore database
3. Configure security rules for real-time updates
4. Add your Firebase config to environment variables

### Deployment

The app is optimized for deployment on Vercel:

```bash
npm run build
```

---

## 🌍 Internationalization

The app supports multiple languages:

- 🇺🇸 **English** (Default)
- 🇹🇷 **Turkish** (Türkçe)

Language switching is available in the app settings.

---

## 📱 Browser Support

- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🔗 Links

- **Live Application**: [https://planning-poker-scrum.vercel.app/](https://planning-poker-scrum.vercel.app/)
- **GitHub Repository**: [https://github.com/kadiraydinli/planning-poker](https://github.com/kadiraydinli/planning-poker)
- **Issues & Feature Requests**: [GitHub Issues](https://github.com/kadiraydinli/planning-poker/issues)

---

<div align="center">

**Made with ❤️ and 🤖 AI**

_Perfect for agile teams looking for a modern, real-time estimation tool_

</div>
