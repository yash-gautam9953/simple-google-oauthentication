# 🚀 simple-google-oauthentication

Effortless **Google OAuth 2.0** login for Express.js — drop-in middleware that handles everything from login → session → user info → logout.  

No database. No boilerplate. Just **plug & play**. ⚡  

---

## ✨ Features

- 🔑 **Super Simple Setup** — Just provide `clientID`, `clientSecret`, and `redirectURI`.
- 🔄 **Automated Flow**:
  - Redirects users to Google login
  - Exchanges auth code for tokens
  - Fetches user profile (email, name, picture)
  - Creates JWT session (no `express-session` required)
- 🍪 **JWT via Cookie** — `auth_token` stored in secure, HTTP-only cookies.
- 👤 **User Access Anywhere** — Grab logged-in user with `getUser(req)`.
- 🚪 **Logout Support** — Just clear the cookie with `logout(req, res)`.
- 🔐 **Secret Auto-Generation** — Automatically creates a JWT secret and stores it in `.simple-google-oauth.json`.
- 🛠 **Zero DB Needed** — Everything is stateless.

---

## 📦 Installation
    npm install simple-google-oauthentication


⚡ Usage

  1️⃣ Setup Middleware

    const express = require("express");
    const { simpleGoogleOAuth, login, logout, getUser } = require("simple-google-oauthentication");

    const app = express();

    // 🔧 Configure Google OAuth
    app.use(
      simpleGoogleOAuth({
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      redirectURI: "http://localhost:3000/auth/google/callback",
    })
    );

    // 👤 Routes
    app.get("/", (req, res) => {
      const user = getUser(req);
      res.send(user ? `Welcome, ${user.email}!` : "Not logged in.");
    });

    app.get("/auth/google/login", login);
    app.get("/auth/google/logout", logout);

    app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

2️⃣ Flow in Action

  1. Visit http://localhost:3000/auth/google/login → Redirects to Google

  2. Login with your Google account → Redirects back to /

  3. req.user is now available everywhere 🎉

  4. Logout with http://localhost:3000/auth/google/logout


🧑‍💻 Example User Object

    {
      "id": "1234567890",
      "email": "your-email@gmail.com",
      "verified_email": true,
      "name": "Your Name",
      "given_name": "Your",
      "family_name": "Name",
      "picture": "https://lh3.googleusercontent.com/a-/profile.jpg",
      "locale": "en"
    }


🔐 Security Notes

    JWT cookies are httpOnly (cannot be accessed by JS).

    In production, set secure: true so cookies only work over HTTPS.

    Secret key is generated once and stored in .simple-google-oauth.json.

  



```bash
npm install simple-google-oauthentication


