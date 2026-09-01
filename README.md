# SNAP2STUDY

> **Snap. Understand. Learn.**

Snap2Study is a website project I built to make studying from questions a little easier.

The main idea is: you can just snap or upload the image of the question and let AI break it down for you.

---

## ✨ What Snap2Study Can Do

### 🤖 AI Question Analysis

Anyone can just upload or snap a question and the AI will do all analysis about the question.

It can generate:
- The question
- Subject
- Topic
- Difficulty level
- Final answer
- Step-by-step explanation
- Important points for revision
- A similar question for practice

---

### 🔐 Login & Signup

Snap2Study has an email-based account system.

It includes:
- Email signup/login
- OTP verification
- OTP expiry
- OTP cooldown
- Maximum OTP attempts
- Secure HTTP-only session cookies
- Persistent login sessions
- Logout

---

### 👤 Profile

Each user have their own profile.

The profile system currently includes:
- Account information
- Authenticated profile access
- Protected account data

---

### 📚 Question History

Snap2Study can:
- Save analyzed questions
- Show previous questions
- Open previous AI results

A user can only access their own saved analyses anytime from anywhere.

---

### 🛡️ Security

Some of the security measures included are:

- Authentication required for AI analysis
- Protected profile and history routes
- User ownership checks
- Hashed OTPs
- Hashed session tokens
- Input validation
- OTP attempt limits
- OTP request cooldown
- HTTP-only session cookies

---

## 🎨 Design

Snap2Study uses a clean **editorial + artistic + brutalist** style.

The design includes:
- Cream/paper-style backgrounds
- Black typography
- Yellow and coral accents
- Editorial typography
- Large visual elements
- Responsive layouts
- Clean AI answer formatting
- Mobile, tablet and desktop support

---

# 🧱 Tech Stack

The project is currently built with:
- **Next.js 16.3.3**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **MongoDB**
- **Nodemailer**
- **JOSE**
- **Vercel**

---

# 📁 Project Structure

The project currently looks like :

```text
Snap2Study/
│
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   ├── auth/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   ├── request-otp/
│   │   │   └── verify-otp/
│   │   ├── history/
│   │   └── test-db/
│   │
│   ├── auth/
│   ├── profile/
│   ├── history/
│   ├── result/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── AnswerRenderer.tsx
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   └── ...
│
├── lib/
│   ├── auth.ts
│   └── db.ts
│
├── public/
│   └── ...
│
├── .env.local
├── next.config.ts
├── package.json
└── README.md
````

---

# 🔑 Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM=your_email@gmail.com

OTP_SECRET=your_long_random_secret
SESSION_SECRET=your_long_random_secret
```

### Important

If you're using Gmail SMTP, use a **Google App Password** instead of your normal Gmail password.

---

# 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/adityayadav0002/snap2study.git
cd snap2study
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

Add all the required environment variables.

### 4. Start the development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Production Build

To check the production build:

```bash
npm run build
```

Then run:

```bash
npm start
```

---

# 🗄️ MongoDB

The applications current collections schema's are:
```text
snap2study
│
├── users
│   ├── email
│   ├── name
│   ├── createdAt
│   └── updatedAt
│
├── sessions
│   ├── userId
│   ├── tokenHash
│   ├── expiresAt
│   └── createdAt
│
├── otps
│   ├── email
│   ├── otpHash
│   ├── expiresAt
│   ├── attempts
│   └── createdAt
│
└── analyses
    ├── userId
    ├── question
    ├── subject
    ├── topic
    ├── difficulty
    ├── answer
    ├── explanation
    ├── key_points
    ├── similar_question
    └── createdAt
```

---

# 🛡️ Protected Features

These features require a logged-in account:

```text
Profile
History
Saved results
AI question analysis
```

---

# 📡 API Routes

### Authentication

```text
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/logout
GET  /api/auth/me
```

### AI Analysis

```text
POST /api/analyze
```

### History

```text
POST /api/history
GET  /api/history
GET  /api/history/[id]
```

---


# 📄 License

This is currently an independent/private project.

A proper license can be added later if the project is released publicly.

---

# 👨‍💻 About

**Aditya Yadav**

I built Snap2Study as an AI-powered study tool focused on helping students understand questions faster and learn from them instead of simply searching for answers.

**SNAP2STUDY**

> **Snap. Understand. Learn.**

```
