# ✨ MusafirWords

> **Words that travel with you.**

MusafirWords is a social writing platform designed for people who love expressing themselves through **Shayari, Kavita, Poems, Quotes, Lines, Thoughts and Stories**.

A quiet digital place where people can **read something, feel something, and write something.**

---

## 🌐 Live Demo

**Live Website:** https://musafirwords.vercel.app

**GitHub Repository:** https://github.com/hardahapulkit19-creator/Musafirwords

---
<img width="2930" height="1624" alt="image" src="https://github.com/user-attachments/assets/01134337-ed3f-45e2-8cb1-933eeb1850ee" />

## ✨ Features

- 🔐 Google Authentication
- 👤 Personal User Profiles
- ✍️ Create and publish writings
- 📖 Multiple writing categories
- ❤️ Like writings
- 💬 Comment on writings
- 🔖 Save writings
- 👥 Follow writers
- 📰 Following Feed
- 🌎 For You Feed
- 🔎 Search and discovery
- 📊 Writing and following counts
- 📤 Share writings
- 🖼️ Create shareable images
- 📱 Responsive interface
- 🔥 Firebase Authentication
- ☁️ Cloud Firestore
- 🚀 Vercel deployment

---

## 📝 Writing Categories

MusafirWords supports multiple types of writing:

- Shayari
- Poem
- Kavita
- Quote
- Line
- Thought
- Story

---

## 👤 User Profiles

Every registered user gets a personal profile.

Users can:

- View their own profile
- View their published writings
- See their writing count
- See their following count
- Explore other writers
- Follow writers
- Interact with writings

---

## 📰 Feed System

### 🌎 For You

The **For You** feed helps users discover writings from the wider MusafirWords community.

### 👥 Following

The **Following** feed shows writings from writers that the user follows.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS

## Backend & Cloud

- Firebase Authentication
- Cloud Firestore

## Development

- VS Code
- Git
- GitHub
- npm

## Deployment

- Vercel

---

# 🔐 Authentication

MusafirWords uses **Firebase Authentication** for user authentication.

Authentication is used for features such as:

- Google Sign-In
- User sessions
- Creating writings
- Publishing posts
- Likes
- Comments
- Saves
- Following writers
- Profile access

---

# ☁️ Firebase

Firebase is used as the cloud backend for MusafirWords.

### Firebase Authentication

Used for:

- User authentication
- Google Sign-In
- Managing authenticated sessions

### Cloud Firestore

Used for application data such as:

- User information
- Writings
- Comments
- Likes
- Following relationships
- Saved writings

---

# 🔒 Firebase Authorized Domain

The production Vercel domain is configured as an authorized Firebase Authentication domain.

Production domain:

```text
musafirwords.vercel.app
```

This allows Firebase Authentication to work correctly on the deployed website.

---

# 📁 Project Structure

```text
Musafirwords/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

---

# ⚙️ Run Locally

## 1. Clone the Repository

```bash
git clone https://github.com/hardahapulkit19-creator/Musafirwords.git
```

## 2. Open the Project

```bash
cd Musafirwords
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Development Server

```bash
npm run dev
```

Vite will start the local development server.

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Create an optimized production build using:

```bash
npm run build
```

The production files are generated inside:

```text
dist/
```

---

# 🚀 Deployment

MusafirWords is deployed using **Vercel** and connected to the GitHub repository.

## Deployment Flow

```text
Local Development
       ↓
      Git
       ↓
    GitHub
       ↓
    Vercel
       ↓
Production Website
```

### Production URL

https://musafirwords.vercel.app

---

# 🔄 Updating the Live Website

After making changes locally:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Update MusafirWords"
```

Push the changes:

```bash
git push origin main
```

After the changes are pushed to GitHub, the connected Vercel project can deploy the updated version.

---

# 🧪 Testing Status

**Current Status: Live & Testing**

The application is currently live and being tested with multiple users.

Testing includes:

- Google Authentication
- User Profiles
- Creating writings
- Publishing
- For You Feed
- Following Feed
- Likes
- Comments
- Saves
- Search
- Sharing
- Firebase integration
- Production deployment
- Responsive UI

---

# 🔍 Current Testing Goal

The initial development phase focuses on testing the platform with real users and collecting feedback.

Users can test:

1. Sign Up / Login
2. Create a profile
3. Write a post
4. Publish a writing
5. Like a post
6. Comment
7. Save a writing
8. Follow another writer
9. Check the Following feed
10. Explore the For You feed
11. Search for writings or writers
12. Share a writing

---

# 🛡️ Security

MusafirWords uses Firebase Authentication and Cloud Firestore.

Authentication helps protect user-specific features, while Firestore Security Rules are used to control access to stored application data.

The project does **not** intentionally expose private authentication credentials or passwords in the repository.

> Firebase client configuration used by web applications should still be protected with appropriate Firebase Security Rules and authorized-domain configuration.

---

# 📱 Responsive Experience

MusafirWords is designed to provide a clean experience across different screen sizes.

The interface focuses on:

- Clean typography
- Dark UI
- Minimal design
- Easy navigation
- Readable writing layouts
- Mobile-friendly interaction

---

# 🎯 Project Vision

MusafirWords is built around a simple idea:

> **Words have journeys too.**

The goal is to create a peaceful digital space where people can express themselves through writing and discover words that connect with them.

Whether it is a:

- Shayari
- Poem
- Story
- Quote
- Thought
- Line

Every word can carry a feeling.

---

# 🚀 Future Improvements

Planned improvements include:

- 🔔 Notifications
- 💬 Enhanced commenting
- ❤️ Improved social interactions
- 🔎 Advanced search
- 🏆 Writer recognition
- 📱 Further mobile improvements
- 🎨 More personalization
- 📈 Writer analytics
- 🖼️ Advanced sharing tools
- 🛡️ Further security improvements
- ⚡ Performance optimization

---

# 📊 Project Status

**MusafirWords is live and currently in active testing.**

The project is continuously being improved based on user feedback and testing.

---

# 👨‍💻 Creator

## Pulkit Hardaha

Computer Engineering Student & Developer

**GitHub:**  
https://github.com/hardahapulkit19-creator

---

# ⭐ MusafirWords

> **Read something. Feel something. Write something.**

---

<p align="center">
  Made with ❤️ by Pulkit Hardaha
</p>
