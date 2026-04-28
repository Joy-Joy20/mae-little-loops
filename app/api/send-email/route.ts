import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Welcome email (from signup)
  if (body.to) {
    const { to, subject, html } = body;
    await transporter.sendMail({
      from: `"Mae Little Loops Studio" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true });
  }

  // Contact form email
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
