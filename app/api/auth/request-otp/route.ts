import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/db";
import { generateOtp, getOtpExpiry, hashOtp, isValidEmail, normalizeEmail,} from "@/lib/auth";

const DB_NAME = "snap2study";
const OTP_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body.email !== "string") {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        { status: 400 }
      );
    }

    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const existing = await db.collection("otps").findOne({ email, });

    if (existing?.createdAt) {
      const elapsed = Date.now() - new Date(existing.createdAt).getTime();
      if (elapsed < OTP_COOLDOWN_MS) {
        const remaining = Math.ceil( (OTP_COOLDOWN_MS - elapsed) / 1000 );
        return NextResponse.json(
          {
            error: `Please wait ${remaining} seconds before requesting another OTP.`,
          },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await db.collection("otps").replaceOne(
      { email },
      {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      { upsert: true }
    );

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number( process.env.SMTP_PORT || 587 );
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM;

    if (
      !smtpHost ||
      !smtpUser ||
      !smtpPassword ||
      !smtpFrom
    ) {
      console.error("[Snap2Study] SMTP configuration missing.");
      return NextResponse.json(
        {
          error: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Your Snap2Study verification code",
      text: `
        Snap2Study
        Snap. Understand. Learn.
        
        Your verification code is: ${otp}
        
        This code expires in 10 minutes.
        
        If you did not request this code, you can safely ignore this email.
        
        © Snap2Study
        AI-powered question understanding
              `.trim(),
        
              html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"
          />
          <title>Snap2Study Verification Code</title>
        </head>
        
        <body
          style=" margin:0; padding:0; background:#f4efe3; font-family:Arial,Helvetica,sans-serif; color:#111111; ">
        
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" background:#f4efe3; padding:40px 16px;">
            <tr>
              <td align="center">
                <!-- MAIN CARD -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" max-width:560px; background:#f7f2e8; border:2px solid #111111; box-shadow:7px 7px 0 #111111;">
  
                  <!-- HEADER -->
                  <tr>
                    <td style=" padding:26px 28px; border-bottom:2px solid #111111; ">
                      <div style=" font-family:Arial,Helvetica,sans-serif;  font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; ">
                        SNAP2STUDY
                      </div>
        
                      <div style=" margin-top:6px; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#555555; ">
                        Snap. Understand. Learn.
                      </div>
        
                    </td>
                  </tr>
        
                  <!-- CONTENT -->
                  <tr>
                    <td style=" padding:42px 28px 36px; ">
        
                      <div style=" font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#777777; margin-bottom:12px; ">
                        ACCOUNT / VERIFICATION
                      </div>
        
                      <h1 style=" margin:0; font-family:Georgia,'Times New Roman',serif; font-size:34px; line-height:1.1; font-weight:400; ">
                        Your verification code
                      </h1>
        
                      <p style=" margin:16px 0 0; font-size:15px; line-height:1.6; color:#555555; ">
                        Use the code below to continue signing in
                        to Snap2Study.
                      </p>
        
                      <!-- OTP BOX -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" margin-top:28px; ">
                        <tr>
                          <td align="center" style=" background:#f4c928; border:2px solid #111111; padding:25px 15px; box-shadow:5px 5px 0 #111111; ">
        
                            <div style=" font-family:'Courier New',monospace; font-size:36px; line-height:1; font-weight:700; letter-spacing:8px;">
                              ${otp}
                            </div>
        
                          </td>
                        </tr>
                      </table>
        
                      <p style=" margin:30px 0 0; font-family:'Courier New',monospace; font-size:11px; line-height:1.7; color:#666666; text-transform:uppercase; letter-spacing:1px; ">
                        Expires in 10 minutes
                      </p>
        
                    </td>
                  </tr>
        
                  <!-- SECURITY NOTE -->
                  <tr>
                    <td style=" padding:22px 28px; border-top:2px solid #111111; background:#eeeeea; ">
        
                      <div style=" font-family:'Courier New',monospace; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#444444; ">
                        SECURITY NOTE
                      </div>
        
                      <p style=" margin:8px 0 0; font-size:12px; line-height:1.6; color:#666666; ">
                        If you did not request this verification
                        code, you can safely ignore this email.
                      </p>
        
                    </td>
                  </tr>
        
                  <!-- FOOTER -->
                  <tr>
                    <td style=" padding:22px 28px; border-top:2px solid #111111; ">
        
                      <div style=" font-family:'Courier New',monospace; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; ">
                        SNAP2STUDY
                      </div>
        
                      <div style=" margin-top:6px; font-size:11px; color:#777777; ">
                        AI-powered question understanding
                      </div>
        
                    </td>
                  </tr>
                </table>
        
                <!-- OUTSIDE FOOTER -->
                <div style=" max-width:560px; margin-top:22px; font-family:'Courier New',monospace; font-size:9px; line-height:1.5; color:#999999; letter-spacing:1px; text-transform:uppercase; ">
                  This is an automated security email from Snap2Study.
                </div>
        
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error("[Snap2Study] OTP request error:", error );
    return NextResponse.json(
      {
        error: "Unable to send verification code.",
      },
      { status: 500 }
    );
  }
}