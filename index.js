/*const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

// ✅ CORS — manually set headers on EVERY request
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// ── EMAIL SETUP ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noorulqamarmuhammad@gmail.com",      // 👈 replace with your Gmail
    pass: "ybwslcvvuzmfcblv",          // 👈 replace with your 16-char App Password
  },
});

// ── ROUTES ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("HomeBridge Lettings backend is running!");
});

app.post("/lead", async (req, res) => {
  console.log("✅ New lead received:", req.body);

  const { name, phone, location, rent } = req.body;

  const mailOptions = {
    from: "noorulqamarmuhammad@gmail.com",
    to: "noorulqamarmuhammad@gmail.com",
    subject: `🏠 New Landlord Lead — ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0B1628; padding: 24px 32px;">
          <h2 style="color: #D4A017; margin: 0;">HomeBridge Lettings</h2>
          <p style="color: #7E93B4; margin: 6px 0 0; font-size: 14px;">New Property Lead Received</p>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px; width: 40%;">Full Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #222;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">Phone</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #222;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">Property Location</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #222;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 13px;">Expected Rent</td>
              <td style="padding: 12px 0; font-weight: bold; color: #D4A017; font-size: 18px;">£${rent}/month</td>
            </tr>
          </table>
          <div style="margin-top: 28px; padding: 16px; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #D4A017;">
            <p style="margin: 0; font-size: 13px; color: #555;">
              📅 Received: <strong>${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</strong>
            </p>
          </div>
        </div>
        <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #aaa;">HomeBridge Lettings — Automated Lead Notification</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully!");
    res.status(200).json({ success: true, message: "Lead received and email sent!" });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ success: false, message: "Email failed." });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});*/
const cors = require('cors');

app.use(cors({
  origin: '*'  // or replace * with your Netlify URL
}));




const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();

// ── CORS ──────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

// ── GOOGLE SHEETS SETUP ───────────────────────
const SHEET_ID = "1PEBwFzBCUjsuJYuiwWHbMsh8eg3A2lsu5dxcsOIIK0M";   // 👈 paste your Sheet ID here
const SHEET_NAME = "HomeBridge_Letting's";

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",             // 👈 your downloaded JSON file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function saveToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const row = [
    new Date().toLocaleString("en-GB"),    // Date & Time
    data.name     || "",
    data.phone    || "",
    data.email    || "",
    data.postcode || "",
    data.rent     || "",
    data.service  || "",
    data.message  || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: "USER_ENTERED",
    resource: { values: [row] },
  });

  console.log("✅ Saved to Google Sheets!");
}

// ── EMAIL SETUP ───────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noorulqamarmuhammad@gmail.com",          // 👈 your Gmail
    pass: "ybwslcvvuzmfcblv",             // 👈 16-char App Password
  },
});

// ── ROUTES ────────────────────────────────────
app.get("/", (req, res) => {
  res.send("HomeBridge Lettings backend is running!");
});

app.post("/lead", async (req, res) => {
  const { name, phone, email, postcode, rent, service, message } = req.body;
  console.log("📥 New lead received:", req.body);

  // Run both save and email at the same time
  const [sheetResult, emailResult] = await Promise.allSettled([

    // Save to Google Sheets
    saveToSheet(req.body),

    // Send email notification
    transporter.sendMail({
      from: "noorulqamarmuhammad@gmail.com",
      to: "noorulqamarmuhammad@gmail.com",
      subject: `🏠 New Property Lead — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#0A1628;padding:24px 32px">
            <h2 style="color:#C8960C;margin:0">HomeBridge Lettings</h2>
            <p style="color:#7A90B2;margin:6px 0 0;font-size:14px">New Property Lead Received</p>
          </div>
          <div style="padding:32px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;width:35%">Full Name</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222">${name}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">Phone</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222">${phone}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">Email</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222">${email}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">Postcode</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222">${postcode}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">Expected Rent</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#C8960C;font-size:18px">£${rent}/month</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">Service</td><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222">${service}</td></tr>
              <tr><td style="padding:12px 0;color:#888;font-size:13px">Message</td><td style="padding:12px 0;color:#222">${message || "—"}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:6px;border-left:4px solid #C8960C">
              <p style="margin:0;font-size:13px;color:#555">📅 Received: <strong>${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</strong></p>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#aaa">HomeBridge Lettings — Automated Lead Notification</p>
          </div>
        </div>
      `,
    }),
  ]);

  // Log results
  if (sheetResult.status === "rejected") {
    console.error("❌ Sheets error:", sheetResult.reason?.message);
  }
  if (emailResult.status === "rejected") {
    console.error("❌ Email error:", emailResult.reason?.message);
  }

  // Respond to frontend
  res.status(200).json({ success: true, message: "Lead received!" });
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
}).on("error", (err) => {
  console.error("❌ Server error:", err.message);
});

// Keep process alive and catch any crashes
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught error:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled rejection:", reason);
});