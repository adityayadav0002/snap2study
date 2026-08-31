import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "[Snap2Study] Logout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to log out.",
      },
      { status: 500 }
    );
  }
}