const express = require('express');
const fetch = require('node-fetch'); // install with npm
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your static frontend files (index.html, login.html, style.css) from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// POST route to handle login/register form submission
app.post('/submit-form', async (req, res) => {
  const { discordUsername, password, rememberMe, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ success: false, message: 'No reCAPTCHA token provided' });
  }

  // Verify reCAPTCHA with Google
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

  try {
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ success: false, message: 'Failed reCAPTCHA verification' });
    }

    // Here you can add login/register logic, check username/password, store session, etc.

    return res.json({ success: true, message: `Welcome, ${discordUsername}! Remember Me: ${rememberMe}` });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
