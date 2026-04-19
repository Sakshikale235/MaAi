# 🤰 MaaAi - Maternal AI Assistant

An intelligent, offline-first mobile application designed to support frontline healthcare workers (ANMs and Medical Officers) in maternal health assessment and risk identification. MaAi provides real-time clinical decision support with AI-powered risk analysis, multilingual explanations, and seamless data synchronization.

**Built for the 2024 Healthcare Hackathon | Target: Android Primary, iOS/Web Secondary**

---

## 📋 Features

### Core Clinical Assessment
- **Structured Maternal Assessment Form**
  - WHO/MoHFW-aligned parameters
  - Blood pressure input with automated hypertension detection
  - Symptom history tracking (pain, bleeding, fever, oedema)
  - MUAC (Mid-Upper Arm Circumference) with nutrition banding
  - Foetal heart sound assessment
  - LMP-based gestational age calculator with trimester indicators

### AI Risk Identification & Referral
- **Real-time Risk Scoring**
  - Three-tier risk classification: Low, Medium (High), High (Emergency)
  - Color-coded risk gauge visualization
  - AI-powered confidence scoring
  - Human-readable risk rationale with contributing factors

- **Intelligent Referral System**
  - Automated referral slip generation
  - Facility matching with distance calculation
  - Multilingual support (English & Hindi)
  - Shareable referral data via WhatsApp/device sharing

### Offline-First Architecture
- **Local Data Persistence**
  - SQLite database for patient records, assessments, and risk history
  - Fully functional offline assessment workflow
  - Background sync queue for connectivity restoration
  - Visual sync status indicators

- **ABDM Integration Ready**
  - FHIR R4 Observation-compatible data structure
  - ABHA ID support for patient identification
  - FHIR-aligned backend sync

### Analytics & Insights
- **AI-Powered Dashboard**
  - Case outcome analysis using Groq Llama-3
  - Trend analysis and pattern identification
  - Model accuracy tracking
  - Actionable improvement recommendations

### Multilingual Support
- English & Hindi interface translations
- AI-generated explanations in user's preferred language
- Localized clinical terminology

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React Native with Expo 54
- **Routing**: Expo Router (file-based)
- **Language**: TypeScript 5.9
- **State Management**: React Context API
- **UI Components**: Custom components + Lucide icons
- **Styling**: React Native + Expo Linear Gradient

### Backend & Data
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Database**: SQLite (on-device) + Supabase (cloud)
- **Storage**: Async Storage, Secure Store
- **File System**: Expo File System

### AI Services
- **Primary AI**: Groq API (Llama-3.3-70b-versatile model)
- **Speech Recognition**: Groq Whisper-large-v3
- **Secondary AI**: Google Generative AI (Gemini)
- **Local Risk Engine**: Deterministic RiskEngine module

### Platform-Specific
- **Camera**: Expo Camera (for OCR/document capture)
- **Audio**: Expo AV (audio recording & playback)
- **Haptics**: Expo Haptics (tactile feedback)
- **Print**: Expo Print (report generation)
- **Permissions**: Managed via Expo manifest

### Build Tools
- **Bundler**: Metro
- **Transpiler**: Babel 7.25
- **Linter**: Expo Lint
- **Type Checking**: TypeScript

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Android SDK (for Android builds) or Xcode (for iOS)
- API Keys:
  - Groq API Key (for AI risk analysis)
  - Google Generative AI Key (optional, for Gemini)
  - Supabase Project URL and Anon Key

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   cd MaAi
   npm install
   # or
   yarn install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
   EXPO_PUBLIC_GOOGLE_AI_KEY=your_google_ai_key
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   # Opens Expo Go QR code for testing on device/emulator
   ```

4. **Build for Android**
   ```bash
   npm run android
   # or direct:
   eas build --platform android
   ```

5. **Build for iOS**
   ```bash
   npm run ios
   ```

6. **Build for Web**
   ```bash
   npm run build:web
   ```

---

## 🗂️ Project Structure

```
MaAi/
├── app/                          # Expo Router app directory (file-based routing)
│   ├── (tabs)/                  # Tabbed interface
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── patients.tsx         # Patient list
│   │   ├── mo.tsx              # Medical Officer dashboard
│   │   ├── alerts.tsx          # Alert center
│   │   └── settings.tsx        # App settings
│   ├── ai/
│   │   ├── chatbot.tsx         # AI chatbot interface
│   │   └── result.tsx          # Risk assessment results
│   ├── auth/
│   │   ├── login.tsx           # Login screen
│   │   └── signup.tsx          # Registration screen
│   ├── patient/
│   │   ├── [id].tsx            # Patient detail view
│   │   ├── assessment.tsx      # Assessment form
│   │   ├── list.tsx            # Patient listing
│   │   └── register.tsx        # New patient registration
│   └── onboarding/
│       └── language.tsx        # Language selection
├── components/                  # Reusable UI components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── RiskGauge.tsx       # Risk visualization
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── DashboardCard.tsx
│   │   ├── QuickStats.tsx
│   │   └── PatientCard.tsx
│   └── chat/
│       └── ChatBubble.tsx      # Chat UI
├── services/                    # External API & business logic
│   ├── GroqService.ts          # Groq AI integration (primary)
│   ├── GroqSpeechService.ts    # Speech-to-text via Groq
│   ├── GeminiService.ts        # Google Gemini (secondary)
│   ├── AnalyticsAIService.ts   # Dashboard analytics
│   ├── MOAIService.ts          # Medical Officer decision support
│   ├── CaseStore.ts            # Case data management
│   └── supabase.ts             # Supabase client setup
├── lib/                        # Utilities & helpers
│   ├── db.ts                   # SQLite database helpers
│   ├── sqlite.ts               # SQLite schema & queries
│   ├── supabase.ts             # Supabase auth helpers
│   ├── navigation.ts           # Navigation utilities
│   └── translationHelper.ts    # i18n helpers
├── utils/                      # Business logic
│   ├── RiskEngine.ts           # Deterministic risk calculation
│   ├── ReportGenerator.ts      # PDF report generation
│   ├── decisionEngine.js       # Decision trees
│   └── GroqService.ts          # Groq integration utils
├── constants/                  # Config & constants
│   ├── colors.ts               # Theme colors
│   ├── theme.ts                # Design system
│   ├── GroqConfig.ts           # Groq API config
│   ├── translations.ts         # i18n strings
│   ├── protocols.json          # Clinical protocols
│   ├── cases.json              # Sample case data
│   └── models.json             # ML model metadata
├── context/                    # React Context providers
│   └── LanguageContext.tsx     # Language/localization state
├── hooks/                      # Custom React hooks
│   ├── useSync.ts              # Sync management
│   ├── useRecorder.ts          # Audio recording
│   └── useFrameworkReady.ts    # Framework initialization
├── migrations/                 # SQLite schema migrations
│   └── 001_add_audit_logs_created_at.sql
├── server/                     # Node.js backend server (optional)
│   ├── server.js               # Express server
│   ├── controllers/
│   │   └── analysisController.js
│   └── test-*.js               # Various test scripts
├── android/                    # Android native code
├── assets/                     # Images & static files
│   └── images/
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler config
├── app.json                   # Expo app config
└── README.md                  # This file
```

---

## 🚀 Key Services & APIs

### GroqService (`services/GroqService.ts`)
Primary AI service for clinical risk analysis using Llama-3.3-70b.

**Main Functions:**
- `explainRiskWithAI(factors, riskLevel, data)` - Generate clinical explanations
- Returns multilingual risk interpretations and actionable insights

### GroqSpeechService (`services/GroqSpeechService.ts`)
High-performance audio transcription using Whisper-large-v3.

**Main Functions:**
- `getTextFromAudio(audioBase64)` - Convert speech to text

### RiskEngine (`utils/RiskEngine.ts`)
Deterministic risk scoring based on clinical parameters.

**Scoring Logic:**
- Blood pressure thresholds
- Symptom severity mapping
- MUAC nutrition bands
- Gestational complications
- Outputs: Low (0-30), Medium (31-60), High (61-100)

### AnalyticsAIService (`services/AnalyticsAIService.ts`)
Dashboard insights and trend analysis using Groq AI.

**Main Functions:**
- `analyzeWithAIModel(cases)` - Case outcome analysis
- `analyzeTrendWithAI(cases)` - Temporal trend analysis
- `generateRecommendationsWithAI(cases)` - Model improvements

---

## 📊 Data Models

### Patient
```typescript
{
  id: string;
  abhaId: string;
  name: string;
  phone: string;
  dob: Date;
  address: string;
  status: 'active' | 'completed' | 'referred';
  createdAt: Date;
  updatedAt: Date;
}
```

### Assessment
```typescript
{
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  symptoms: string[];
  muac: number;
  fetalHeartRate: number;
  lmp: Date;
  gestationalAge: number;
  notes: string;
  createdAt: Date;
}
```

### Risk Assessment
```typescript
{
  id: string;
  assessmentId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  factors: string[];
  rationale: string;
  confidence: number;
  referralNeeded: boolean;
  createdAt: Date;
}
```

---

## 🔄 Offline-First Workflow

1. **Local-First Data Entry**
   - All patient assessments saved to SQLite immediately
   - No network required for form completion
   - UI shows "Offline Mode" indicator when disconnected

2. **Background Sync**
   - Pending records queued for sync
   - Automatic sync when connectivity restored
   - Manual sync button in settings

3. **Cloud Integration**
   - Supabase sync for backup and inter-device access
   - FHIR-compatible data structure
   - Audit logging for compliance

---

## 🌍 Multilingual Support

Currently supports:
- **English** - Default
- **Hindi** - Full translation

To add more languages:
1. Update `constants/translations.ts` with new language strings
2. Add language option to `onboarding/language.tsx`
3. Update `LanguageContext.tsx` to handle new locale

---

## 🔐 Security & Privacy

- **Local Encryption**: Sensitive data stored in Secure Store
- **Network Security**: HTTPS/TLS for all Supabase connections
- **Authentication**: Supabase Auth with email/password
- **Audit Logging**: All assessments and overrides logged
- **ABHA Compliance**: Patient ID support for Indian health ecosystem

---

## 📱 Supported Devices

- **Primary**: Android 7+ (API 24+)
- **Secondary**: iOS 13+
- **Web**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for Android
npm run android

# Build for iOS
npm run ios

# Build for web
npm run build:web
```

---

## 📚 Backend Setup (Optional)

The project includes optional Node.js backend in `server/`:

```bash
cd server
npm install
node server.js
```

This provides:
- OCR processing endpoints
- Document processing
- Additional AI analysis
- Real-time analytics

---

## 🐛 Troubleshooting

### Issue: `GROQ_API_KEY` not found
**Solution**: Ensure `.env` file exists in root with `EXPO_PUBLIC_GROQ_API_KEY` set.

### Issue: SQLite database locked
**Solution**: Restart the app or clear async storage in settings.

### Issue: Sync fails continuously
**Solution**: Check Supabase credentials in `.env` and verify network connectivity.

### Issue: AI explanations in English only
**Solution**: Ensure `LanguageContext` is wrapping the app and language is set to Hindi.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes with TypeScript type safety
3. Test on Android emulator/device
4. Submit PR with clear description

---

## 📄 License

Proprietary - Healthcare Hackathon Project 2024

---

## 👥 Team

Built for improving maternal healthcare outcomes through AI-assisted decision support.

---

## 📞 Support

For issues or questions:
1. Check `PRD_TODO.md` for feature roadmap
2. Review `AI_INTEGRATION_NOTES.md` for AI service details
3. Check error logs in device settings

---

## 🎯 Next Steps / Roadmap

- [ ] WhatsApp integration for referral sharing
- [ ] Advanced analytics dashboard
- [ ] Telemedicine consultation interface
- [ ] Real-time collaboration for Medical Officers
- [ ] Integration with national health systems (NRHM, HMIS)
