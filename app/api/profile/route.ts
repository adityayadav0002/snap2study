import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import clientPromise from "@/lib/db";

const DB_NAME = "snap2study";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error( "[Snap2Study] Profile GET error:", error );
    return NextResponse.json(
      {
        error: "Unable to load profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH( request: Request ) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    let body: unknown;
    try { body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if ( !body || typeof body !== "object" || !("name" in body) || typeof body.name !== "string" ) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    if (name.length > 50) {
      return NextResponse.json(
        {
          error: "Name must be 50 characters or less.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection("users").updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name,
      },
    });
  } catch (error) {
    console.error("[Snap2Study] Profile PATCH error:", error );
    return NextResponse.json(
      {
        error: "Unable to update profile.",
      },
      { status: 500 }
    );
  }
}