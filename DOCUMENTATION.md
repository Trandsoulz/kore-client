# Kore Client - Technical Documentation

> A Next.js 15 financial automation platform for automated savings, investments, pensions, and insurance management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features Implemented](#features-implemented)
5. [State Management](#state-management)
6. [Pages & Routes](#pages--routes)
7. [Components](#components)
8. [User Flow](#user-flow)
9. [Styling & Design System](#styling--design-system)
10. [Partner Integrations](#partner-integrations)

---

## Project Overview

Kore is a Nigerian fintech platform that automates personal finance management. Users set rules for how their money should be allocated across four "buckets":

- **Savings** - Emergency funds, goals
- **Investments** - Stocks, mutual funds, money market
- **Pensions** - Retirement planning
- **Insurance** - Life, health, asset protection

The platform automatically debits users based on their preferences and distributes funds to connected partner platforms (Piggyvest, Cowrywise, Risevest, etc.).

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Lucide React | Icon library |
| next/image | Optimized image loading |

---

## Project Structure

```
app/
├── globals.css              # Global styles & CSS variables
├── layout.tsx               # Root layout
├── page.tsx                 # Landing page
│
├── (auth)/                  # Auth route group
│   ├── layout.tsx           # Auth layout (centered, gradient bg)
│   ├── login/page.tsx       # Login page
│   └── signup/page.tsx      # Signup page
│
├── (dashboard)/             # Dashboard route group
│   ├── layout.tsx           # Dashboard layout (sidebar, header, auth guard)
│   ├── components/
│   │   ├── DashboardHeader.tsx
│   │   ├── ProfileModal.tsx
│   │   └── Sidebar.tsx
│   └── dashboard/
│       ├── page.tsx         # Main dashboard
│       ├── onboarding/page.tsx    # Rules engine (7 steps)
│       ├── savings/page.tsx       # Savings bucket
│       ├── investments/page.tsx   # Investments bucket
│       ├── transactions/page.tsx  # Transaction history
│       ├── transactions/[ref]/page.tsx  # Transaction details
│       └── settings/page.tsx      # User settings
│
├── components/              # Landing page components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Buckets.tsx
│   ├── HowItWorks.tsx
│   ├── CTA.tsx
│   ├── Partners.tsx
│   └── Footer.tsx
│
└── store/                   # Zustand stores
    ├── auth.ts              # Authentication state
    ├── rules.ts             # User rules & onboarding
    ├── partners.ts          # Financial partners
    └── transactions.ts      # Transaction history
```

---

## Features Implemented

### 1. Landing Page
- **Hero Section** - Main value proposition with CTA buttons
- **Features Section** - Key platform benefits
- **Buckets Section** - Explanation of 4 financial buckets
- **How It Works** - 3-step process explanation
- **Partners Section** - Logos of integrated financial partners
- **CTA Section** - Final call-to-action
- **Footer** - Links and company info

### 2. Authentication
- **Signup Page** - Email/password registration with OAuth buttons (Google, Apple)
- **Login Page** - Email/password login with OAuth options
- **Auth Guard** - Protected dashboard routes redirect unauthenticated users

### 3. Profile Completion Modal
- **2-step modal** that appears for new users:
  - Step 1: Personal info (DOB, gender, phone, address, BVN)
  - Step 2: Bank info (bank name, account number)
- Validates Nigerian phone numbers and BVN format
- Redirects to onboarding after completion

### 4. Rules Engine Onboarding (7 Steps)
1. **Income Information** - Salary type (fixed/variable), monthly amount
2. **Debit Timing** - When to debit (month end, weekly, bi-weekly, etc.)
3. **Financial Goals** - Emergency fund status, primary goal
4. **Risk Tolerance** - Conservative, moderate, or aggressive
5. **Bucket Allocation** - Percentage split across 4 buckets (must equal 100%)
6. **Notifications** - Debit alerts, allocation alerts, weekly reports
7. **Mandate Setup** - Direct debit, card authorization, or skip

### 5. Dashboard
- **Welcome message** with user's name
- **Bucket overview cards** showing allocation amounts
- **Quick stats** - Total saved, this month, next debit
- **Recent activity** placeholder

### 6. Savings Page
- **Connected partners** list with disconnect option
- **Available partners** grid with connect modal
- Partner logos from local `/public` images
- Connection simulation with loading state

### 7. Investments Page
- **Risk profile display** based on user's tolerance setting
- **Connected partners** with investment tracking
- **Available partners** with returns info
- Same partner connection flow as savings

### 8. Transactions Page
- **Stats cards** - Total debited, allocated, monthly, count
- **Transaction list** with status icons (completed/pending/failed)
- **Clickable rows** linking to detail pages
- **Sample transactions** for demo purposes

### 9. Transaction Details Page (`/dashboard/transactions/[ref]`)
- **Full transaction info** - Reference, date/time, amount, status
- **Partner info** with logo
- **Bank/payment method** details
- **Narration** field
- **Copy reference** button
- **View in partner** action button

### 10. Settings Page
- **Profile Section** - View personal info, BVN status
- **Bank Accounts** - View/manage linked accounts
- **Notifications** - Toggle email, push, SMS alerts
- **Rules & Allocation** - View debit schedule and bucket percentages
- **Connected Partners** - List all connected services
- **Security** - Password, 2FA, sessions, delete account
- **Help & Support** - FAQs, contact, bug reports
- **Logout** with confirmation modal

---

## State Management

### Auth Store (`store/auth.ts`)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  completeProfile: (profile: UserProfile) => void;
}
```

**Persisted to:** `localStorage` as `kore-auth`

### Rules Store (`store/rules.ts`)

```typescript
interface RulesState {
  rules: UserRules | null;
  onboardingComplete: boolean;
  setRules: (rules: UserRules) => void;
  completeOnboarding: () => void;
  resetRules: () => void;
}
```

**Persisted to:** `localStorage` as `kore-rules` (version 2)

### Partners Store (`store/partners.ts`)

```typescript
interface PartnersState {
  partners: Partner[];
  connectPartner: (partnerId: string) => void;
  disconnectPartner: (partnerId: string) => void;
  getPartnersByType: (type: Partner["type"]) => Partner[];
  getConnectedPartners: (type?: Partner["type"]) => Partner[];
}
```

**Persisted to:** `localStorage` as `kore-partners` (version 2)

### Transactions Store (`store/transactions.ts`)

```typescript
interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "reference">) => void;
  getTransactionByRef: (reference: string) => Transaction | undefined;
  getTotalDebited: () => number;
  getTotalAllocated: () => number;
  getMonthlyTotal: () => number;
}
```

**Persisted to:** `localStorage` as `kore-transactions`

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Landing page |
| `/login` | `(auth)/login/page.tsx` | Login form |
| `/signup` | `(auth)/signup/page.tsx` | Registration form |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | Main dashboard |
| `/dashboard/onboarding` | `onboarding/page.tsx` | Rules engine setup |
| `/dashboard/savings` | `savings/page.tsx` | Savings bucket |
| `/dashboard/investments` | `investments/page.tsx` | Investment bucket |
| `/dashboard/transactions` | `transactions/page.tsx` | Transaction list |
| `/dashboard/transactions/[ref]` | `[ref]/page.tsx` | Transaction details |
| `/dashboard/settings` | `settings/page.tsx` | User settings |

---

## Components

### Landing Page Components

| Component | Description |
|-----------|-------------|
| `Header` | Navigation with logo and CTA buttons |
| `Hero` | Main headline, subtext, and action buttons |
| `Features` | Grid of feature cards with icons |
| `Buckets` | Visual explanation of 4 financial buckets |
| `HowItWorks` | 3-step process with numbered circles |
| `Partners` | Partner logos carousel/grid |
| `CTA` | Final call-to-action section |
| `Footer` | Links, social, and copyright |

### Dashboard Components

| Component | Description |
|-----------|-------------|
| `Sidebar` | Navigation menu with bucket links |
| `DashboardHeader` | Top bar with menu toggle and user avatar |
| `ProfileModal` | 2-step profile completion wizard |

---

## User Flow

```
┌─────────────┐
│  Landing    │
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Sign Up /  │
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Profile not complete
│  Dashboard  │◄────────────────────────┐
└──────┬──────┘                         │
       │                                │
       ▼                                │
┌─────────────┐                   ┌─────┴─────┐
│  Profile    │                   │  Profile  │
│   Modal     │───────────────────►   Modal   │
└──────┬──────┘   Complete        └───────────┘
       │
       ▼
┌─────────────┐
│ Onboarding  │
│ (7 steps)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Mandate    │
│   Setup     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
│  (Active)   │
└─────────────┘
```

---

## Styling & Design System

### CSS Variables (defined in `globals.css`)

```css
:root {
  --primary: #6366F1;        /* Indigo - main brand color */
  --primary-dark: #4F46E5;   /* Darker indigo */
  --secondary: #10B981;      /* Emerald - success/savings */
  --accent: #F59E0B;         /* Amber - warnings/highlights */
  --background: #FAFAFA;     /* Light background */
  --foreground: #1F2937;     /* Dark text */
  --card: #FFFFFF;           /* Card background */
  --border: #E5E7EB;         /* Border color */
  --muted: #6B7280;          /* Muted text */
}
```

### Dark Mode Support

Dark mode variables are defined but theme switching was removed from settings per user request.

### Common Patterns

- **Border Radius**: `rounded-xl` (12px), `rounded-2xl` (16px)
- **Shadows**: Minimal, using borders instead
- **Spacing**: Consistent use of `p-4`, `p-6`, `gap-4`
- **Transitions**: `transition-colors` on interactive elements

---

## Partner Integrations

### Savings Partners

| Partner | Logo | Min Amount | Returns |
|---------|------|------------|---------|
| Piggyvest | `/piggyvest.png` | ₦100 | 8-10% p.a. |
| Cowrywise | `/cowrywise.png` | ₦100 | 10-12% p.a. |
| Kuda Bank | `/kuda.png` | ₦0 | 4% p.a. |

### Investment Partners

| Partner | Logo | Min Amount | Returns |
|---------|------|------------|---------|
| Stanbic IBTC MMF | `/stanbic.jpeg` | ₦5,000 | 12-15% p.a. |
| GT Fund Managers | `/gtbank.png` | ₦10,000 | 13-16% p.a. |
| Risevest | `/risevest.png` | ₦10 | 10-30% p.a. |
| Bamboo | `/bamboo.jpeg` | ₦20 | Variable |

### Pension & Insurance (Coming Soon)

- ARM Pension
- Stanbic IBTC Pension
- AXA Mansard
- Leadway Assurance

---

## Sample Data

### Sample Transactions

10 sample transactions are pre-populated for demo purposes, including:
- Auto-save transactions to Piggyvest, Cowrywise, Kuda
- Investment transactions to Risevest, Bamboo, Stanbic, GT Fund Managers
- Various statuses: completed, pending, failed
- Dates spanning January 2026

---

## Known Limitations

1. **No Backend** - All data is stored in localStorage via Zustand persist
2. **No Real Auth** - Authentication is simulated (no JWT/sessions)
3. **No Real Partner Integration** - Connect/disconnect is mocked
4. **No Real Mandate Setup** - Direct debit setup is simulated
5. **Pensions & Insurance** - Marked as "Coming Soon"

---

## Future Enhancements

1. **Backend Integration** - Connect to real API
2. **Real Authentication** - OAuth, JWT tokens
3. **Partner APIs** - Integrate with Piggyvest, Cowrywise, etc.
4. **Payment Gateway** - Paystack/Flutterwave for card authorization
5. **Direct Debit** - Mono/Okra for bank mandates
6. **Push Notifications** - Real-time alerts
7. **Mobile App** - React Native version
8. **Analytics Dashboard** - Charts and insights

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Environment Variables

Currently none required (all client-side demo).

For production, you would need:
- `NEXT_PUBLIC_API_URL` - Backend API
- OAuth credentials for Google/Apple
- Payment gateway keys

---

*Documentation last updated: January 29, 2026*
