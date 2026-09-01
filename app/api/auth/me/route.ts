import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 200 }
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
    console.error("[Snap2Study] Auth session error:", error );
    return NextResponse.json(
      {
        error: "Unable to check authentication.",
      },
      { status: 500 }
    );
  }
}