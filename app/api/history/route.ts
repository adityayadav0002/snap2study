import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const DB_NAME = "snap2study";

export async function POST(request: Request) {
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

    const body = await request.json();

    if (
      !body ||
      typeof body.question !== "string" ||
      typeof body.subject !== "string" ||
      typeof body.topic !== "string" ||
      typeof body.difficulty !== "string" ||
      typeof body.answer !== "string" ||
      typeof body.explanation !== "string" ||
      !Array.isArray(body.key_points) ||
      typeof body.similar_question !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Invalid analysis data.",
        },
        { status: 400 }
      );
    }

    const keyPoints = body.key_points
      .filter(
        (point: unknown): point is string =>
          typeof point === "string"
      )
      .map((point: string) => point.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (keyPoints.length < 3) {
      return NextResponse.json(
        {
          error: "At least 3 key points are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const analysis = {
      userId: user._id.toString(),

      question: body.question.trim(),
      subject: body.subject.trim(),
      topic: body.topic.trim(),
      difficulty: body.difficulty.trim(),
      answer: body.answer.trim(),
      explanation: body.explanation.trim(),
      key_points: keyPoints,
      similar_question:
        body.similar_question.trim(),

      createdAt: new Date(),
    };

    const result = await db
      .collection("history")
      .insertOne(analysis);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(
      "[Snap2Study] Save history error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to save analysis.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    /* =====================================================
       VIEW SINGLE HISTORY ITEM
    ===================================================== */

    if (id) {
      const { ObjectId } = await import("mongodb");

      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            error: "Invalid history ID.",
          },
          { status: 400 }
        );
      }

      const item = await db
        .collection("history")
        .findOne({
          _id: new ObjectId(id),
          userId: user._id.toString(),
        });

      if (!item) {
        return NextResponse.json(
          {
            error: "Analysis not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        history: {
          id: item._id.toString(),
          question: item.question,
          subject: item.subject,
          topic: item.topic,
          difficulty: item.difficulty,
          answer: item.answer,
          explanation: item.explanation,
          key_points: item.key_points,
          similar_question: item.similar_question,
          createdAt: item.createdAt,
        },
      });
    }

    /* =====================================================
       VIEW HISTORY LIST
    ===================================================== */

    const history = await db
      .collection("history")
      .find({
        userId: user._id.toString(),
      })
      .sort({
        createdAt: -1,
      })
      .limit(50)
      .toArray();

    const normalizedHistory = history.map(
      (item) => ({
        id: item._id.toString(),
        question: item.question,
        subject: item.subject,
        topic: item.topic,
        difficulty: item.difficulty,
        answer: item.answer,
        explanation: item.explanation,
        key_points: item.key_points,
        similar_question:
          item.similar_question,
        createdAt: item.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      history: normalizedHistory,
    });
  } catch (error) {
    console.error(
      "[Snap2Study] Get history error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load question history.",
      },
      { status: 500 }
    );
  }
}