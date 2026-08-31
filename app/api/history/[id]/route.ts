import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const DB_NAME = "snap2study";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid history ID.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const analysis = await db
      .collection("analyses")
      .findOne({
        _id: new ObjectId(id),
        userId: user._id.toString(),
      });

    if (!analysis) {
      return NextResponse.json(
        {
          error: "Analysis not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        id: analysis._id.toString(),
        question: analysis.question,
        subject: analysis.subject,
        topic: analysis.topic,
        difficulty: analysis.difficulty,
        answer: analysis.answer,
        explanation: analysis.explanation,
        key_points: analysis.key_points,
        similar_question:
          analysis.similar_question,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "[Snap2Study] History detail error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load saved analysis.",
      },
      { status: 500 }
    );
  }
}