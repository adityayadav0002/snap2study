import crypto from "crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import clientPromise from "@/lib/db";

const DB_NAME = "snap2study";

const SESSION_COOKIE = "snap2study_session";

const SESSION_DURATION_MS =
  1000 * 60 * 60 * 24 * 30; // 30 days

const OTP_DURATION_MS =
  1000 * 60 * 10; // 10 minutes

const OTP_SECRET =
  process.env.OTP_SECRET;

const SESSION_SECRET =
  process.env.SESSION_SECRET;

if (!OTP_SECRET) {
  throw new Error(
    "OTP_SECRET is not configured."
  );
}

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is not configured."
  );
}

/* =========================================================
   HASH
========================================================= */

function hashValue(
  value: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

/* =========================================================
   NORMALIZE EMAIL
========================================================= */

export function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

/* =========================================================
   EMAIL VALIDATION
========================================================= */

export function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/* =========================================================
   OTP
========================================================= */

export function generateOtp(): string {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export function hashOtp(
  otp: string
): string {
  return hashValue(
    otp,
    OTP_SECRET!
  );
}

export function getOtpExpiry(): Date {
  return new Date(
    Date.now() + OTP_DURATION_MS
  );
}

/* =========================================================
   SESSION TOKEN
========================================================= */

export function generateSessionToken(): string {
  return crypto
    .randomBytes(32)
    .toString("hex");
}

export function hashSessionToken(
  token: string
): string {
  return hashValue(
    token,
    SESSION_SECRET!
  );
}

/* =========================================================
   CREATE SESSION
========================================================= */

export async function createSession(
  userId: string
): Promise<string> {
  const client =
    await clientPromise;

  const db =
    client.db(DB_NAME);

  const token =
    generateSessionToken();

  const tokenHash =
    hashSessionToken(token);

  const expiresAt =
    new Date(
      Date.now() +
        SESSION_DURATION_MS
    );

  await db
    .collection("sessions")
    .insertOne({
      userId,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    }
  );

  return token;
}

/* =========================================================
   GET CURRENT USER
========================================================= */

export async function getCurrentUser() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  const tokenHash =
    hashSessionToken(token);

  const client =
    await clientPromise;

  const db =
    client.db(DB_NAME);

  const session =
    await db
      .collection("sessions")
      .findOne({
        tokenHash,
      });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt <=
    new Date()
  ) {
    await db
      .collection("sessions")
      .deleteOne({
        _id: session._id,
      });

    return null;
  }

  let userObjectId: ObjectId;

try {
  userObjectId = new ObjectId(
    session.userId
  );
} catch {
  await db
    .collection("sessions")
    .deleteOne({
      _id: session._id,
    });

  return null;
}

const user =
  await db
    .collection("users")
    .findOne({
      _id: userObjectId,
    });

  if (!user) {
    return null;
  }

  return user;
}

/* =========================================================
   DELETE SESSION
========================================================= */

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  if (token) {
    const tokenHash =
      hashSessionToken(token);

    const client =
      await clientPromise;

    const db =
      client.db(DB_NAME);

    await db
      .collection("sessions")
      .deleteOne({
        tokenHash,
      });
  }

  cookieStore.delete(
    SESSION_COOKIE
  );
}