import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;

    await client
      .db("snap2study")
      .command({
        ping: 1,
      });

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful.",
    });
  } catch (error) {
    console.error(
      "[Snap2Study] MongoDB connection error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed.",
      },
      {
        status: 500,
      }
    );
  }
}