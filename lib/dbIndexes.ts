import clientPromise from "@/lib/db";

export async function ensureAuthIndexes() {
  const client =
    await clientPromise;

  const db =
    client.db("snap2study");

  await db
    .collection("users")
    .createIndex(
      { email: 1 },
      { unique: true }
    );

  await db
    .collection("otps")
    .createIndex(
      { email: 1 },
      { unique: true }
    );

  await db
    .collection("otps")
    .createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

  await db
    .collection("sessions")
    .createIndex(
      { tokenHash: 1 },
      { unique: true }
    );

  await db
    .collection("sessions")
    .createIndex({
      expiresAt: 1,
    });
}