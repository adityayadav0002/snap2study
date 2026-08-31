import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import {
  createSession,
  hashOtp,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth";

const DB_NAME = "snap2study";

const MAX_ATTEMPTS = 5;

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    if (
      !body ||
      typeof body.email !==
        "string" ||
      typeof body.otp !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Email and OTP are required.",
        },
        { status: 400 }
      );
    }

    const email =
      normalizeEmail(
        body.email
      );

    const otp =
      body.otp.trim();

    if (
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid email address.",
        },
        { status: 400 }
      );
    }

    if (
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        {
          error:
            "OTP must contain 6 digits.",
        },
        { status: 400 }
      );
    }

    const client =
      await clientPromise;

    const db =
      client.db(DB_NAME);

    const otpRecord =
      await db
        .collection("otps")
        .findOne({
          email,
        });

    if (!otpRecord) {
      return NextResponse.json(
        {
          error:
            "Verification code not found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (
      otpRecord.expiresAt <=
      new Date()
    ) {
      await db
        .collection("otps")
        .deleteOne({
          _id:
            otpRecord._id,
        });

      return NextResponse.json(
        {
          error:
            "Verification code has expired.",
        },
        { status: 400 }
      );
    }

    if (
      otpRecord.attempts >=
      MAX_ATTEMPTS
    ) {
      await db
        .collection("otps")
        .deleteOne({
          _id:
            otpRecord._id,
        });

      return NextResponse.json(
        {
          error:
            "Too many incorrect attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    const submittedHash =
      hashOtp(otp);

    if (
      submittedHash !==
      otpRecord.otpHash
    ) {
      await db
        .collection("otps")
        .updateOne(
          {
            _id:
              otpRecord._id,
          },
          {
            $inc: {
              attempts: 1,
            },
          }
        );

      return NextResponse.json(
        {
          error:
            "Incorrect verification code.",
        },
        { status: 400 }
      );
    }

    let user =
      await db
        .collection("users")
        .findOne({
          email,
        });

    const now =
      new Date();

    if (!user) {
      const insertResult =
        await db
          .collection("users")
          .insertOne({
            email,
            name: "",
            createdAt: now,
            updatedAt: now,
          });

      user = {
        _id:
          insertResult.insertedId,
        email,
        name: "",
        createdAt: now,
        updatedAt: now,
      };
    } else {
      await db
        .collection("users")
        .updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              updatedAt: now,
            },
          }
        );
    }

    await db
      .collection("otps")
      .deleteOne({
        _id:
          otpRecord._id,
      });

    await createSession(
      user._id.toString()
    );

    return NextResponse.json({
      success: true,
      message:
        "Login successful.",
      user: {
        id:
          user._id.toString(),
        email:
          user.email,
        name:
          user.name || "",
      },
    });
  } catch (error) {
    console.error(
      "[Snap2Study] OTP verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify the code.",
      },
      { status: 500 }
    );
  }
}