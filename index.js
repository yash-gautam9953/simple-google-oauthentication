const express = require("express");
const axios = require("axios");
const qs = require("querystring");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const SECRET_FILE = path.join(process.cwd(), ".simple-google-oauth.json");
let oauthOptions = {};

function getOrCreateSecret(userProvidedSecret) {
  if (userProvidedSecret) {
    console.log("[simple-google-oauth] Using provided jwtSecret.");
    return userProvidedSecret;
  }

  if (fs.existsSync(SECRET_FILE)) {
    const data = JSON.parse(fs.readFileSync(SECRET_FILE));
    console.log("[simple-google-oauth] Loaded jwtSecret from file.");
    return data.jwtSecret;
  }

  const newSecret = require("crypto").randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, JSON.stringify({ jwtSecret: newSecret }, null, 2));
  console.log("[simple-google-oauth] Generated and saved new jwtSecret.");
  return newSecret;
}

function simpleGoogleOAuth({ clientID, clientSecret, redirectURI, jwtSecret }) {
  const router = express.Router();
  const secret = getOrCreateSecret(jwtSecret);
  oauthOptions = { clientID, clientSecret, redirectURI };

  const cookieName = "auth_token";
  router.use(cookieParser());

  router.use((req, res, next) => {
    const token = req.cookies[cookieName];
    if (token) {
      try {
        req.user = jwt.verify(token, secret);
        console.log(`[simple-google-oauth] JWT verified for user: ${req.user.email}`);
      } catch (e) {
        console.warn("[simple-google-oauth] Invalid JWT. Clearing user.");
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  });

  const callbackPath = new URL(redirectURI).pathname || "/callback";
  router.get(callbackPath, async (req, res) => {
    console.log("[simple-google-oauth] Received callback with code:", req.query.code);
    try {
      const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify({
          code: req.query.code,
          client_id: clientID,
          client_secret: clientSecret,
          redirect_uri: redirectURI,
          grant_type: "authorization_code",
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("[simple-google-oauth] Access token received from Google.");

      const { access_token } = tokenRes.data;
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      console.log("[simple-google-oauth] User info fetched:", userRes.data.email);

      const token = jwt.sign(userRes.data, secret, { expiresIn: "1h" });
      res.cookie(cookieName, token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        maxAge: 1000 * 60 * 60,
      });

      console.log("[simple-google-oauth] User logged in and JWT cookie set.");
      res.redirect("/");
    } catch (err) {
      console.error("[simple-google-oauth] OAuth flow failed:", err.message);
      res.status(500).send("OAuth failed");
    }
  });

  return router;
}

function login(req, res) {
  console.log("[simple-google-oauth] Initiating Google OAuth login...");
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    qs.stringify({
      client_id: oauthOptions.clientID,
      redirect_uri: oauthOptions.redirectURI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

  console.log("[simple-google-oauth] Redirecting to:", url);
  res.redirect(url);
}

function logout(req, res) {
  res.clearCookie("auth_token");
  console.log("[simple-google-oauth] User logged out. Cookie cleared.");
  res.redirect("/");
}

function getUser(req) {
  return req.user || null;
}

module.exports = {
  simpleGoogleOAuth,
  login,
  logout,
  getUser,
};
