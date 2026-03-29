# 🍽️ Mess Management System

> A full-stack web application to digitize and streamline hostel mess operations — from attendance tracking to billing and payments.

---

## 📌 Description

Mess Management System is a role-based web app built for hostel administrators and students. Admins can manage student records, track daily attendance, handle leave requests, generate bills, and post notices — all from a single dashboard. Students get a personalized portal to view their attendance, bills, payment history, and submit leave requests.

---

## 🚀 Live Demo

🔗 [View Live Project](https://swamisamarth.netlify.app/)

---

## ✨ Features

**Admin Panel**
- 📊 Dashboard with real-time stats and charts
- 👨‍🎓 Student management (add, view, manage profiles)
- ✅ Daily attendance tracking with auto-attendance support
- 📋 Attendance request approvals
- 🏖️ Leave management and approvals
- 🧾 Billing generation with auto-billing
- 💳 Payment tracking and receipt management
- 🍱 Mess menu / items management
- 📢 Notice board for announcements

**Student Portal**
- 🏠 Personal dashboard with attendance summary
- 📅 View and track own attendance
- 💰 View bills and payment history
- 🧾 Download payment receipts (PDF)
- 📝 Submit leave requests
- 👤 Profile management

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI Components | shadcn/ui, Radix UI, Tailwind CSS |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Authentication |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDF Export | jsPDF |
| Routing | React Router DOM v6 |
| State / Fetching | TanStack React Query |
| Deployment | Firebase Hosting |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js `>= 18.x`
- npm or bun
- A Firebase project

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd mess-management
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### 5. Build for production

```bash
npm run build
```

---

## 📖 Usage

1. **Admin** — Log in via `/admin-login` to access the full admin dashboard. Manage students, attendance, billing, and notices.
2. **Student** — Log in via `/student-login` to view personal attendance, bills, submit leave requests, and download receipts.

---

## 🗂️ Project Structure

```
mess-management/
├── src/
│   ├── components/         # Shared UI components (dialogs, panels)
│   │   └── ui/             # shadcn/ui base components
│   ├── hooks/              # Custom React hooks (auth, billing, attendance, etc.)
│   ├── lib/                # Firebase config and utility functions
│   ├── pages/
│   │   ├── admin/          # Admin-only pages (dashboard, billing, students...)
│   │   └── student/        # Student-only pages (dashboard, bills, profile...)
│   ├── App.tsx             # Root component with routing
│   └── main.tsx            # App entry point
├── functions/              # Firebase Cloud Functions
├── public/                 # Static assets
├── firebase.json           # Firebase hosting & functions config
└── .env                    # Environment variables (not committed)
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the existing code style and keep PRs focused and minimal.

---

## 🙏 Credits & Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible component library
- [Firebase](https://firebase.google.com/) — Backend, auth, and hosting
- [Lovable](https://lovable.dev/) — AI-powered full-stack development platform
- [Radix UI](https://www.radix-ui.com/) — Headless UI primitives
- [Recharts](https://recharts.org/) — Composable charting library

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by **Zishan**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?logo=github)](https://github.com/Jishaan-Azmi)

</div>
