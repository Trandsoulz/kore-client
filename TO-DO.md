# Kore Client V2 - Backend Integration TO-DO List

> **Status**: ✅ **INTEGRATION COMPLETE** - The frontend is now connected to the backend API.
> 
> **API Base URL**: `https://koreapi.onrender.com/api/`

---

## Executive Summary

| Category | Backend Status | Frontend Status | Action Required |
|----------|----------------|-----------------|-----------------|
| Authentication | ✅ JWT Ready | ✅ Integrated | ✅ Done |
| Profile/KYC | ✅ Complete | ✅ Integrated | ✅ Done |
| Banks List | ✅ Cached API | ✅ Integrated | ✅ Done |
| Onboarding Rules | ❌ Not in backend | ✅ localStorage | Keep local for now |
| Partners | ❌ Not in backend | ✅ Mock data | Future phase |
| Transactions | ❌ Not in backend | ✅ Sample data | Future phase |

---

## ✅ Completed: Authentication Integration

### Files Modified (Frontend)

| File | Changes Made |
|------|--------------|
| `app/lib/api.ts` | ✅ Created API service layer with JWT handling |
| `app/store/auth.ts` | ✅ Added JWT tokens, async login/signup actions |
| `app/(auth)/login/page.tsx` | ✅ Real API call to `/api/auth/login/` |
| `app/(auth)/signup/page.tsx` | ✅ Real API call to `/api/auth/signup/` with confirm password |
| `app/(dashboard)/layout.tsx` | ✅ Token validation, calls `/api/auth/me/` |

### Backend Endpoints Consumed

| Endpoint | Method | Purpose | Frontend Usage |
|----------|--------|---------|----------------|
| `/api/auth/signup/` | POST | Register new user | Signup page form submission |
| `/api/auth/login/` | POST | Login user, get JWT | Login page form submission |
| `/api/auth/me/` | GET | Get current user + profile status | Dashboard layout, auth guard |
| `/api/token/refresh/` | POST | Refresh expired access token | HTTP interceptor in api.ts |

### Implementation Tasks

- [x] **Create API service layer** (`app/lib/api.ts`)
  - Base URL: `https://koreapi.onrender.com/api/`
  - Fetch wrapper with JWT interceptor
  - Token refresh logic on 401 responses
  
- [x] **Update `store/auth.ts`**
  - Store JWT tokens (access + refresh) in localStorage
  - Added `login(email, password)` async action
  - Added `signup(fullName, email, password, confirmPassword)` async action
  - Added `fetchCurrentUser()` to call `/api/auth/me/`
  - Added `logout()` that clears tokens
  
- [x] **Update Login Page** (`app/(auth)/login/page.tsx`)
  - Replaced mock with real API call
  - Error handling for invalid credentials
  - JWT tokens stored on success
  - Redirect to dashboard
  
- [x] **Update Signup Page** (`app/(auth)/signup/page.tsx`)
  - Added `confirm_password` field
  - Calls `/api/auth/signup/` endpoint
  - Auto-login on success
  
- [x] **Update Dashboard Layout** (`app/(dashboard)/layout.tsx`)
  - Validates JWT token on mount
  - Calls `/api/auth/me/` to refresh session
  - Handles token expiration gracefully

---

## ✅ Completed: Profile/KYC Integration

### Files Modified (Frontend)

| File | Changes Made |
|------|--------------|
| `app/lib/hooks.ts` | ✅ Created useBanks() hook for banks API |
| `app/(dashboard)/components/ProfileModal.tsx` | ✅ Full API integration with OnePipe verification |
| `app/(dashboard)/dashboard/settings/page.tsx` | ✅ Fetches profile from API |

### Backend Endpoints Consumed

| Endpoint | Method | Purpose | Frontend Usage |
|----------|--------|---------|----------------|
| `/api/profile/me/` | GET | Get full profile | Settings page |
| `/api/profile/personal/` | PATCH | Update personal info (draft) | ProfileModal Step 1 |
| `/api/profile/bank/` | PATCH | Update bank info (draft) | ProfileModal Step 2 |
| `/api/profile/submit/` | POST | Verify with OnePipe | ProfileModal final submit |
| `/api/banks/` | GET | List Nigerian banks | Bank selection dropdown |

### Implementation Tasks

- [x] **Update `store/auth.ts` Profile Interface**
  - Updated interface to match backend fields
  - Added mapping between frontend/backend field names
  
  ```
  // Frontend Profile         -> Backend Profile
  firstName                   -> first_name
  surname                     -> surname
  dob                         -> date_of_birth
  phone                       -> phone_number
  bankCode                    -> bank_code (added)
  ```

- [x] **Create Banks API integration**
  - Created `useBanks()` hook in `app/lib/hooks.ts`
  - Fetches from `/api/banks/`
  - Used in ProfileModal Step 2
  
- [x] **Update ProfileModal** (`app/(dashboard)/components/ProfileModal.tsx`)
  - Step 1: Calls `PATCH /api/profile/personal/`
  - Step 2: Calls `PATCH /api/profile/bank/`
  - Final: Calls `POST /api/profile/submit/` for OnePipe verification
  - Shows loading/success/failure states
  
- [x] **Update Settings Page** (`app/(dashboard)/dashboard/settings/page.tsx`)
  - Fetches profile from `/api/profile/me/` on mount
  - Shows profile completion status
  - Loading state while fetching

---

## ✅ Completed: Data Structure Alignment

### Profile Interface Updated

| Frontend Field | Backend Field | Status |
|----------------|---------------|--------|
| `firstName` | `first_name` | ✅ Mapped |
| `surname` | `surname` | ✅ Mapped |
| `dob` | `date_of_birth` | ✅ Mapped |
| `phone` | `phone_number` | ✅ Mapped |
| `gender` | `gender` (M/F/O) | ✅ Mapped |
| `bvn` | `bvn` | ✅ Mapped |
| `bankName` | `bank_name` | ✅ Mapped |
| `bankCode` | `bank_code` | ✅ Added |
| `accountNumber` | `account_number` | ✅ Mapped |

### Profile Interface Mismatch

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `firstName` | `first_name` | Rename |
| `lastName` | `surname` | ⚠️ Backend uses "surname" not "last_name" |
| `dob` | `date_of_birth` | Format: YYYY-MM-DD |
| `phone` | `phone_number` | Validation: digits only |
| `gender` | `gender` | Values: M, F, O |
| `address` | ❌ NOT IN BACKEND | Remove or request backend addition |
| `bvn` | `bvn` | 11 digits, encrypted on backend |
| `bankName` | `bank_name` | Match |
| `accountNumber` | `account_number` | 10 digits, encrypted on backend |
| `bankCode` | `bank_code` | ⚠️ Frontend missing, add this |

---

## 🟢 Future: Rules/Onboarding Persistence

### Current State
- Onboarding rules (7-step wizard) saved to localStorage only
- Backend has NO rules/onboarding endpoints
- **Decision: Keep localStorage for MVP**

### Future Option: Create Backend API

Suggested endpoints:
```
GET  /api/rules/        - Get user's rules
POST /api/rules/        - Create/update rules
```

---

## 🟢 Future: Partner Integration

### Current State
- 12 mock partners in localStorage
- No backend partner management
- Partners are external services (Piggyvest, Cowrywise, etc.)

### Future Consideration
- Partner OAuth integration (phase 2)
- Partner balance aggregation APIs
- Partner webhook handling

---

## 🟢 Future: Transaction History

### Current State
- 10 sample transactions in localStorage
- No backend transaction storage

### Future Consideration
- Backend should receive transaction webhooks from payment providers
- Store and serve transaction history via API

---

## ✅ Implementation Complete

### Phase 1: Core Authentication ✅
1. [x] Create API service layer with fetch
2. [x] Update auth store with JWT handling
3. [x] Integrate signup page with `/api/auth/signup/`
4. [x] Integrate login page with `/api/auth/login/`
5. [x] Add token refresh mechanism
6. [x] Update dashboard auth guard

### Phase 2: Profile/KYC Integration ✅
1. [x] Fetch banks list from `/api/banks/`
2. [x] Update ProfileModal Step 1 for personal info
3. [x] Update ProfileModal Step 2 for bank info
4. [x] Implement profile submission & verification
5. [x] Update Settings page to show profile

### Phase 3: Error Handling & UX (Partial)
1. [x] Add error display for API errors
2. [x] Add loading states during API calls
3. [ ] Add toast notifications (optional enhancement)
4. [ ] Add retry mechanisms (optional enhancement)

### Phase 4: Polish & Testing
1. [ ] End-to-end signup → verification flow test
2. [x] Token expiration handling
3. [ ] Mobile responsiveness check
4. [ ] Error boundary implementation

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `app/lib/api.ts` | ✅ API client with JWT interceptors |
| `app/lib/hooks.ts` | ✅ Custom hooks for API data fetching |

---

## 🧪 Testing Checklist

- [ ] Signup with new email → should create user & get tokens
- [ ] Login with valid credentials → should get tokens
- [ ] Login with invalid credentials → should show error
- [ ] Access dashboard without token → should redirect to login
- [ ] Access token expires → should auto-refresh
- [ ] Complete profile → should verify with OnePipe
- [ ] Invalid bank details → should show verification error
- [ ] Banks API unavailable → should handle gracefully

---

## 📚 API Base URL

**Production:**
```
https://koreapi.onrender.com/api/
```

---

## 📊 Progress Tracker

| Task | Status | Notes |
|------|--------|-------|
| Create API service layer | ✅ Done | `app/lib/api.ts` |
| Auth store JWT handling | ✅ Done | `app/store/auth.ts` |
| Signup integration | ✅ Done | Added confirm password |
| Login integration | ✅ Done | Error handling added |
| Profile personal API | ✅ Done | Step 1 of ProfileModal |
| Profile bank API | ✅ Done | Step 2 of ProfileModal |
| Profile submit/verify | ✅ Done | OnePipe verification |
| Banks list API | ✅ Done | `useBanks()` hook |
| Settings page API | ✅ Done | Fetches profile on mount |
| Dashboard auth guard | ✅ Done | Token validation |

---

*Last Updated: February 1, 2026*
