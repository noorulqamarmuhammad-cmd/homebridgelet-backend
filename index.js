const express = require("express");
const { google } = require("googleapis");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

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
const SHEET_ID = "1PEBwFzBCUjsuJYuiwWHbMsh8eg3A2lsu5dxcsOIIK0M";
const SHEET_NAME = "HomeBridge_Letting's";

async function saveToSheet(data) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const row = [
      new Date().toLocaleString("en-GB"),
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
  } catch(err) {
    console.error("❌ Sheets error:", err.message);
  }
}

// ── ROUTES ────────────────────────────────────
app.get("/", (req, res) => {
  res.send("HomeBridge Lettings backend is running!");
});

app.post("/lead", async (req, res) => {
  const { name, phone, email, postcode, rent, service, message } = req.body;
  console.log("📥 New lead received:", req.body);

  // Save to Google Sheets
  await saveToSheet(req.body);

  // Send email via Resend
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
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
    });
    console.log("📧 Email sent!");
  } catch(err) {
    console.error("❌ Email error:", err.message);
  }

  res.status(200).json({ success: true, message: "Lead received!" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running!");
});

process.on("uncaughtException", (err) => console.error("💥", err.message));
process.on("unhandledRejection", (reason) => console.error("💥", reason));