<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=📝+NoteFlow;Your+thoughts%2C+organized.;Secure+%7C+Fast+%7C+Beautiful" alt="Typing SVG" />

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge&logo=vercel" alt="Live" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens" alt="JWT" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT" />
</p>

<p align="center">
  <a href="https://noteflow-rt48.onrender.com/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-noteflow--rt48.onrender.com-6366F1?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

<br/>

> **NoteFlow** is a full-stack notes management platform built with Node.js, Express, and Firebase Firestore.  
> Secure. Fast. Thoughtfully designed for real productivity.

</div>

---

## ✨ What Makes NoteFlow Different

| Feature | Description |
|--------|-------------|
| 🔐 **JWT Auth** | Stateless, secure authentication with bcrypt password hashing |
| 🗑️ **Smart Trash** | Soft-delete with restore & permanent deletion — no accidents |
| 🏷️ **Tag System** | Organize and filter notes with custom tags |
| 📊 **Note Stats** | Get insights on your notes at a glance |
| ⚡ **Firestore Backend** | Real-time, scalable NoSQL database |
| 🛡️ **Helmet + CORS** | Production-grade security headers out of the box |

---

## 🖼️ Live App

<p align="center">
  <a href="https://noteflow-rt48.onrender.com/" target="_blank">
    <img src="https://img.shields.io/badge/▶_Open_Live_App-noteflow--rt48.onrender.com-6366F1?style=for-the-badge&logo=render&logoColor=white" alt="Open Live App" />
  </a>
</p>

> 📸 _To add screenshots: upload `login.png`, `dashboard.png`, `notes.png` to an `assets/` folder in your repo, then they'll appear here automatically._

| Login | Dashboard | Notes View |
|-------|-----------|------------|
| ![Login](https://placehold.co/320x200/6366f1/ffffff?text=Login+Page) | ![Dashboard](https://placehold.co/320x200/6366f1/ffffff?text=Dashboard) | ![Notes](https://placehold.co/320x200/6366f1/ffffff?text=Notes+View) |

---

## 🏗️ Architecture

```
noteflow-app/
├── backend/
│   ├── config/              # Firebase & environment config
│   ├── controllers/         # Business logic layer
│   ├── middleware/          # JWT auth & request validation
│   ├── routes/              # API route definitions
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── pages/               # HTML pages
│   └── public/              # Static assets (CSS, JS)
│
├── package.json             # Root scripts
└── README.md
```

---

## 🚀 Tech Stack

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcryptjs-003A70?style=flat-square)
![Helmet](https://img.shields.io/badge/Helmet.js-black?style=flat-square)

**Frontend**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

**Deployment**

![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js `v18+`
- Firebase project with Firestore enabled
- A `serviceAccountKey.json` from your Firebase console

### 1. Clone & Install

```bash
git clone https://github.com/your-username/noteflow.git
cd noteflow
npm run setup
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Place your `serviceAccountKey.json` inside `backend/`.

### 3. Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Visit: [http://localhost:5000](http://localhost:5000)

---

## 📡 API Reference

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login & receive JWT |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `PUT` | `/api/auth/change-password` | Change password |

</details>

<details>
<summary><b>📝 Notes</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | Get all notes |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/stats` | Get note statistics |
| `GET` | `/api/notes/trash` | List trashed notes |
| `DELETE` | `/api/notes/trash/empty` | Empty trash |
| `GET` | `/api/notes/:id` | Get single note |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Soft-delete a note |
| `PUT` | `/api/notes/:id/restore` | Restore from trash |
| `DELETE` | `/api/notes/:id/permanent` | Permanently delete |

</details>

---

## 🌍 Deployment

NoteFlow is deployed on **[Render](https://render.com)** with automatic deploys from `main`.

**Live URL:**

[![Deploy to Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://noteflow-rt48.onrender.com/)

🔗 **[https://noteflow-rt48.onrender.com/](https://noteflow-rt48.onrender.com/)**

> _Note: Free-tier Render instances spin down after inactivity — the first request may take ~30 seconds._

---

## 🛣️ Roadmap

- [ ] 🖋️ Rich Text Editor (WYSIWYG)
- [ ] 🌙 Dark Mode
- [ ] 🤝 Note Sharing & Collaboration
- [ ] 🤖 AI Note Summarization
- [ ] 📎 File Upload Support
- [ ] 🔍 Full-Text Search Optimization
- [ ] 🔔 Reminders & Notifications

---

## 🤝 Contributing

Contributions are always welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push and open a PR
git push origin feature/your-feature-name
```

Please follow conventional commit messages (`feat:`, `fix:`, `docs:`, etc.).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **[Ashish Kumar Ranjan](https://github.com/your-username)**

<br/>

⭐ **Star this repo** if NoteFlow was useful to you — it helps a lot!

<br/>

[![GitHub stars](https://img.shields.io/github/stars/your-username/noteflow?style=social)](https://github.com/your-username/noteflow)
[![GitHub forks](https://img.shields.io/github/forks/your-username/noteflow?style=social)](https://github.com/your-username/noteflow/fork)

</div>
