const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

// ✅ CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

// ──────────────────────────────────────────────────────────────
// ✅ GMAIL SETUP
// IMPORTANT: Do NOT use your normal Gmail password here.
// You MUST use a Gmail App Password (16 characters, no spaces).
//
// How to get one:
//   1. Go to https://myaccount.google.com/security
//   2. Make sure 2-Step Verification is ON
//   3. Go to https://myaccount.google.com/apppasswords
//   4. Select App: "Mail", Device: "Other" → type "HomeBridge"
//   5. Click Generate → copy the 16-char password
//   6. Paste it below (no spaces)
// ──────────────────────────────────────────────────────────────
const GMAIL_USER = "noorulqamarmuhammad@gmail.com"; // 👈 your Gmail
const GMAIL_APP_PASSWORD = "ybwslcvvuzmfcblv";       // 👈 paste fresh App Password here

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",       // ✅ explicit host (more reliable than service:"gmail")
  port: 465,                    // ✅ SSL port
  secure: true,                 // ✅ use SSL
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,  // ✅ avoids self-signed cert errors on localhost
  },
});

// ✅ Verify SMTP connection on startup — tells you immediately if credentials are wrong
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP CONNECTION FAILED:", error.message);
    console.error("👉 Fix: Go to https://myaccount.google.com/apppasswords and generate a fresh App Password");
  } else {
    console.log("✅ SMTP connected — Gmail is ready to send emails!");
  }
});

// ── ROUTES ───────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("HomeBridge Lettings backend is running!");
});

app.post("/lead", async (req, res) => {
  console.log("📬 New lead received:", req.body);

  // ✅ Safely destructure all fields with fallbacks
  const {
    name     = "Not provided",
    phone    = "Not provided",
    email    = "Not provided",
    postcode = "Not provided",
    rent     = "Not provided",
    service  = "Not provided",
    message  = "No message",
  } = req.body;

  // ✅ Basic validation
  if (!name || name === "Not provided") {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  const mailOptions = {
    from: `"HomeBridge Lettings" <${GMAIL_USER}>`,
    to: GMAIL_USER,   // 👈 sends to yourself — change if needed
    replyTo: email,   // ✅ clicking Reply goes to the client's email
    subject: `🏠 New Property Lead — ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- HEADER -->
        <div style="background: #0B1628; padding: 28px 36px;">
          <h2 style="color: #D4A017; margin: 0; font-size: 22px; letter-spacing: 0.5px;">🏡 HomeBridge Lettings</h2>
          <p style="color: #7E93B4; margin: 8px 0 0; font-size: 13px;">New Property Enquiry Received</p>
        </div>

        <!-- BODY -->
        <div style="padding: 36px;">
          <p style="font-size: 15px; color: #333; margin: 0 0 24px;">
            A new lead has been submitted through your website. Details below:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f9f9f9;">
              <td style="padding: 14px 16px; color: #888; width: 38%; border-bottom: 1px solid #eee;">👤 Full Name</td>
              <td style="padding: 14px 16px; font-weight: 600; color: #111; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; color: #888; border-bottom: 1px solid #eee;">📞 Phone</td>
              <td style="padding: 14px 16px; font-weight: 600; color: #111; border-bottom: 1px solid #eee;">${phone}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 14px 16px; color: #888; border-bottom: 1px solid #eee;">✉️ Email</td>
              <td style="padding: 14px 16px; font-weight: 600; color: #111; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #D4A017;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; color: #888; border-bottom: 1px solid #eee;">📍 Postcode</td>
              <td style="padding: 14px 16px; font-weight: 600; color: #111; border-bottom: 1px solid #eee;">${postcode}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 14px 16px; color: #888; border-bottom: 1px solid #eee;">💰 Expected Rent</td>
              <td style="padding: 14px 16px; font-weight: 700; color: #D4A017; font-size: 16px; border-bottom: 1px solid #eee;">£${rent}/month</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; color: #888; border-bottom: 1px solid #eee;">🛠 Service Required</td>
              <td style="padding: 14px 16px; font-weight: 600; color: #111; border-bottom: 1px solid #eee;">${service}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 14px 16px; color: #888; vertical-align: top;">💬 Message</td>
              <td style="padding: 14px 16px; color: #333; line-height: 1.6;">${message}</td>
            </tr>
          </table>

          <!-- TIMESTAMP -->
          <div style="margin-top: 28px; padding: 16px 20px; background: #fffbf0; border-radius: 8px; border-left: 4px solid #D4A017;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              📅 <strong>Received:</strong> ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>

          <!-- CTA -->
          <div style="margin-top: 24px; text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; background: #D4A017; color: #0B1628; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; text-decoration: none;">
              Reply to ${name} →
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #f5f5f5; padding: 16px 36px; text-align: center; border-top: 1px solid #e8e8e8;">
          <p style="margin: 0; font-size: 11px; color: #aaa;">
            HomeBridge Lettings — Automated Lead Notification · Do not reply to this email directly
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent! Message ID:", info.messageId);
    res.status(200).json({ success: true, message: "Lead received and email sent!" });
  } catch (error) {
    // ✅ Full error logging so you can debug exactly what went wrong
    console.error("❌ Email send FAILED:");
    console.error("   Code   :", error.code);
    console.error("   Message:", error.message);
    console.error("   Response:", error.response);

    res.status(500).json({
      success: false,
      message: "Email failed — check server console for details.",
      error: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on https://homebridgelet-backend-1-4gm4.onrender.com/lead");
});