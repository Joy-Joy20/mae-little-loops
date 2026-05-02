import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: { rejectUnauthorized: true },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Contact form email (has name/email/subject/message, no `to`)
    if (!body.to) {
      const { name, email, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
      }
      await transporter.sendMail({
        from: `"Mae Little Loops Studio" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `[Mae Little Loops] ${subject}`,
        html: `
          <h3>New message from Contact Us form</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      });
      return NextResponse.json({ success: true });
    }

    // Transactional email (order confirmation, status update, etc.)
    const { to, subject, html } = body;
    await transporter.sendMail({
      from: `"Mae Little Loops Studio" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send email.";
    console.error("Email send error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
