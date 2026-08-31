import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

const DB_NAME = "snap2study";

export type AnalysisHistory = {
  userId: string;

  question: string;
  subject: string;
  topic: string;
  difficulty: string;

  answer: string;
  explanation: string;

  key_points: string[];

  similar_question: string;

  createdAt: Date;
  updatedAt: Date;
};

/* =========================================================
   SAVE ANALYSIS
========================================================= */

export async function saveAnalysis(
  userId: string,
  data: {
    question: string;
    subject: string;
    topic: string;
    difficulty: string;
    answer: string;
    explanation: string;
    key_points: string[];
    similar_question: string;
  }
) {
  if (!ObjectId.isValid(userId)) {
    throw new Error(
      "Invalid user ID."
    );
  }

  const client =
    await clientPromise;

  const db =
    client.db(DB_NAME);

  const now =
    new Date();

  const result =
    await db
      .collection<AnalysisHistory>(
        "analyses"
      )
      .insertOne({
        userId,

        question:
          data.question,

        subject:
          data.subject,

        topic:
          data.topic,

        difficulty:
          data.difficulty,

        answer:
          data.answer,

        explanation:
          data.explanation,

        key_points:
          data.key_points,

        similar_question:
          data.similar_question,

        createdAt:
          now,

        updatedAt:
          now,
      });

  return result.insertedId;
}

/* =========================================================
   GET USER HISTORY
========================================================= */

export async function getUserHistory(
  userId: string
) {
  if (!ObjectId.isValid(userId)) {
    throw new Error(
      "Invalid user ID."
    );
  }

  const client =
    await clientPromise;

  const db =
    client.db(DB_NAME);

  return db
    .collection<AnalysisHistory>(
      "analyses"
    )
    .find({
      userId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}

/* =========================================================
   GET SINGLE ANALYSIS
========================================================= */

export async function getUserAnalysis(
  userId: string,
  analysisId: string
) {
  if (
    !ObjectId.isValid(userId) ||
    !ObjectId.isValid(analysisId)
  ) {
    return null;
  }

  const client =
    await clientPromise;

  const db =
    client.db(DB_NAME);

  return db
    .collection<AnalysisHistory>(
      "analyses"
    )
    .findOne({
      _id:
        new ObjectId(
          analysisId
        ),

      userId,
    });
}