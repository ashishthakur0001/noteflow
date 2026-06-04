📝 NoteFlow - Online Notes Application
A Modern Full-Stack Notes Management Platform

Store, organize, search, and manage your notes securely with Firebase Firestore and JWT Authentication.









🌐 Live Application: https://noteflow-rt48.onrender.com/

✨ Features
🔐 Authentication & Security
User Registration & Login
JWT Authentication
Password Hashing with bcryptjs
Protected Routes
Secure Session Management
📝 Notes Management
Create Notes
Edit Notes
Delete Notes
Restore Deleted Notes
Permanent Deletion
Trash Management
Note Statistics
🏷️ Tags & Organization
Create Tags
Organize Notes
Filter Notes by Tags
Better Content Management
⚡ Performance
Fast Firestore Queries
RESTful API Architecture
Optimized Backend Structure
Responsive Frontend
🏗️ Project Architecture
noteflow-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── pages/
│   └── public/
│
├── package.json
└── README.md
🚀 Tech Stack
Backend
Technology	Purpose
Node.js	Runtime Environment
Express.js	Backend Framework
Firebase Firestore	Database
JWT	Authentication
bcryptjs	Password Hashing
Helmet	Security Headers
CORS	Cross-Origin Resource Sharing
Frontend
Technology	Purpose
HTML5	Structure
CSS3	Styling
JavaScript	Client-side Logic
🛠️ Technologies Used
⚙️ Installation
Clone Repository
git clone https://github.com/your-username/noteflow.git

cd noteflow
Install Dependencies
npm run setup
🔥 Firebase Configuration

Create:

backend/serviceAccountKey.json

Update:

PORT=5000

NODE_ENV=development

FRONTEND_URL=http://localhost:5000

JWT_SECRET=your_secret_key

JWT_EXPIRE=7d

FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
📦 Run Application

Development Mode

npm run dev

Production Mode

npm start

Open:

http://localhost:5000
📚 API Reference
Authentication
Method	Endpoint
POST	/api/auth/register
POST	/api/auth/login
GET	/api/auth/me
PUT	/api/auth/profile
PUT	/api/auth/change-password
Notes
Method	Endpoint
GET	/api/notes
POST	/api/notes
GET	/api/notes/stats
GET	/api/notes/trash
DELETE	/api/notes/trash/empty
GET	/api/notes/
PUT	/api/notes/
DELETE	/api/notes/
PUT	/api/notes//restore
DELETE	/api/notes//permanent
🌍 Deployment
Render

The application is deployed on Render.

🔗 Live URL:

https://noteflow-rt48.onrender.com/

📸 Screenshots

Add screenshots here:

assets/dashboard.png

assets/login.png

assets/notes.png
🎯 Future Improvements
Rich Text Editor
Note Sharing
Real-Time Collaboration
Dark Mode
File Upload Support
AI Note Summarization
Search Optimization
🤝 Contributing

Contributions are welcome.

Fork the Repository
Create a Feature Branch
git checkout -b feature/new-feature
Commit Changes
git commit -m "Added new feature"
Push
git push origin feature/new-feature
Create Pull Request
📄 License

MIT License

Copyright (c) 2026 Ashish Kumar Ranjan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

⭐ If you found this project useful, consider giving it a star on GitHub!

Made with ❤️ by Ashish Kumar Ranja
