# simple-google-oauthentication

⚡️ Effortless **Google OAuth 2.0** login for Express.js — drop-in middleware that handles login, session, user info, and logout automatically.

> 🎯 Just plug and play: no database, no custom logic, no headache.

---

## ✨ Features

- 🔒 **Minimal Configuration** — Only `clientID`, `clientSecret`, and `redirectURI` needed.
- 🧠 **Fully Automated Flow**:
  - Redirects user to Google login
  - Handles token exchange securely
  - Fetches user profile (email, name, picture)
  - Stores session via **JWT** (no `express-session`)
- 👤 **Access Logged-In User**: Use `getUser(req)` anywhere in your routes
- 🚪 **Logout Support**: Just `POST` to `/auth/google/logout` — done
- 🍪 **JWT via Cookie**: Sets `auth_token` in HTTP-only cookie automatically
- 🔐 **Secret Auto-Generation**: No `.env` clutter — one-time secret saved in `.simple-google-oauth.json`
- 🛠 **No DB Required**: Sessions are stateless using JWT

---

## 📦 Installation

```bash
npm install simple-google-oauth
