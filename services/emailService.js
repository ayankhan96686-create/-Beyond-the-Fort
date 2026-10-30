/**
 * Provider-Independent Email Service
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Supports standard SMTP providers via environment variables:
 * - EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, APP_PUBLIC_URL
 * 
 * Security:
 * - Never logs passwords, reset tokens, or credentials
 * - Fails safely if credentials are not configured
 * - Provides both responsive HTML and plain-text alternatives
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.host = process.env.EMAIL_HOST || '';
    this.port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    this.secure = process.env.EMAIL_SECURE === 'true' || this.port === 465;
    this.user = process.env.EMAIL_USER || '';
    this.password = process.env.EMAIL_PASSWORD || '';
    this.from = process.env.EMAIL_FROM || '"Beyond the Fort · Gwalior" <no-reply@beyondthefort.org>';
    this.appPublicUrl = process.env.APP_PUBLIC_URL || '';
  }

  isConfigured() {
    return Boolean(this.host && this.user && this.password);
  }

  createTransporter() {
    if (!this.isConfigured()) return null;
    return nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.user,
        pass: this.password
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
  }

  /**
   * Generates branded HTML template for password reset
   */
  generatePasswordResetHtml(resetUrl, recipientEmail) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password · Beyond the Fort</title>
  <style>
    body { margin:0; padding:0; background-color:#FAF7F2; font-family:'Helvetica Neue', Arial, sans-serif; color:#40372E; }
    .email-wrapper { width:100%; max-width:600px; margin:0 auto; padding:40px 20px; }
    .email-card { background:#FFFFFF; border:1px solid #E7DFD1; border-radius:12px; padding:36px; box-shadow:0 4px 16px rgba(74,21,33,0.06); }
    .brand-header { font-size:11px; font-weight:700; letter-spacing:0.18em; color:#8A5C22; text-transform:uppercase; margin-bottom:8px; }
    .brand-title { font-family:Georgia, serif; font-size:24px; font-weight:bold; color:#4A1521; margin:0 0 16px 0; }
    .copy { font-size:14px; line-height:1.6; color:#5A4F46; margin:0 0 24px 0; }
    .button-wrap { text-align:center; margin:32px 0; }
    .reset-btn { display:inline-block; background-color:#702220; color:#FFFFFF !important; font-size:14px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:6px; letter-spacing:0.04em; }
    .reset-btn:hover { background-color:#4A1521; }
    .notice { font-size:12px; line-height:1.6; color:#80756B; border-top:1px solid #F0EAE1; padding-top:20px; margin-top:28px; }
    .url-fallback { font-size:11px; color:#9E9284; word-break:break-all; margin-top:12px; }
    .footer { text-align:center; font-size:11px; color:#A89E92; margin-top:28px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">
      <div class="brand-header">Time-Aware Digital Discoverability</div>
      <h1 class="brand-title">Reset Your Password</h1>
      <p class="copy">Hello,</p>
      <p class="copy">We received a request to reset the password for your account associated with <strong>${recipientEmail}</strong>. Click the button below to choose a new password:</p>
      
      <div class="button-wrap">
        <a href="${resetUrl}" class="reset-btn" target="_blank" rel="noopener noreferrer">Reset Password</a>
      </div>
      
      <p class="copy">This password reset link will expire in <strong>60 minutes</strong> and can only be used once.</p>
      
      <div class="notice">
        <strong>Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
        <div class="url-fallback">Button not working? Copy and paste this link into your browser:<br>${resetUrl}</div>
      </div>
    </div>
    
    <div class="footer">
      Beyond the Fort — The City of Music & Living Heritage, Gwalior<br>
      AI Synergy Hackathon 2026 • Team Venator (ID: 60358412)
    </div>
  </div>
</body>
</html>`;
  }

  generatePasswordResetText(resetUrl, recipientEmail) {
    return `BEYOND THE FORT — GWALIOR TOURISM AI
Reset Your Password

Hello,

We received a request to reset the password for your account (${recipientEmail}).
Visit the link below to set a new password:

${resetUrl}

This link is single-use and will expire in 60 minutes.

If you did not request this, please ignore this email. Your account remains secure.

—
Beyond the Fort · Team Venator (ID: 60358412)`;
  }

  /**
   * Sends the password reset email via configured SMTP
   */
  async sendPasswordResetEmail(recipientEmail, resetUrl) {
    if (!this.isConfigured()) {
      const err = new Error('SMTP email delivery is not configured');
      err.code = 'SMTP_NOT_CONFIGURED';
      throw err;
    }

    const transporter = this.createTransporter();
    const mailOptions = {
      from: this.from,
      to: recipientEmail,
      subject: 'Reset Your Password · Beyond the Fort Gwalior',
      text: this.generatePasswordResetText(resetUrl, recipientEmail),
      html: this.generatePasswordResetHtml(resetUrl, recipientEmail)
    };

    return await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
