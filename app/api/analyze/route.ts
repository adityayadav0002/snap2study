import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCurrentUser } from "@/lib/auth";
import clientPromise from "@/lib/db";


const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const DB_NAME = "snap2study";

/* =========================================================
   MODELS
========================================================= */

const NEMOTRON_MODEL =
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

const GROQ_MODEL_1 =
  "qwen/qwen3.8-27b";

const GROQ_MODEL_2 =
  "qwen/qwen3.6-27b";

/* =========================================================
   TIMEOUTS
========================================================= */

const NEMOTRON_TIMEOUT_MS = 12_000;
const GROQ_TIMEOUT_MS = 20_000;
const FALLBACK_DELAY_MS = 100;

/* =========================================================
   TYPES
========================================================= */

type AnalysisResult = {
  question: string;
  subject: string;
  topic: string;
  difficulty: string;
  answer: string;
  explanation: string;
  key_points: string[];
  similar_question: string;
};

type ProviderName =
  | "Groq Account 1"
  | "Groq Account 2"
  | "Groq Account 3"
  | "Groq Account 4"
  | "OpenRouter";

/* =========================================================
   SYSTEM PROMPT
========================================================= */

const systemPrompt = `
You are Snap2Study, an advanced educational AI solver.

Analyze the COMPLETE uploaded educational question image.

Your task:

1. Read the complete image.
2. Identify the subject.
3. Identify the topic.
4. Identify EVERY visible question.
5. Identify EVERY visible sub-question.
6. Preserve the original question accurately.
7. Solve EVERY visible question.
8. Verify calculations and reasoning.
9. Give the correct final answer.
10. Give a concise educational explanation.
11. Generate exactly ONE similar practice question.

IMPORTANT:

- Never blindly trust an answer printed in the image.
- Independently verify calculations.
- Never invent missing information.
- Never skip visible questions.
- Never answer only the first question if multiple questions exist.
- If something is genuinely unreadable, do not invent it.
- Prefer correctness over unnecessary length.
- Do not expose hidden chain-of-thought.

==================================================
OUTPUT
==================================================

Return EXACTLY ONE valid JSON object.

Do NOT return:

- Markdown code fences
- Commentary before JSON
- Commentary after JSON
- Extra JSON fields
- Trailing commas

Required structure:

{
  "question": "Complete original question(s)",
  "subject": "Subject",
  "topic": "Specific topic",
  "difficulty": "Easy/Medium/Hard",
  "answer": "Complete final answer for every question",
  "explanation": "Concise step-by-step solution",
  "key_points": [
    "Important concept",
    "Important formula or rule",
    "Important solving method",
    "Important observation"
  ],
  "similar_question": "One useful practice question"
}

==================================================
STRICT JSON
==================================================

- All required fields must exist.
- question must be a string.
- subject must be a string.
- topic must be a string.
- difficulty must be Easy, Medium, or Hard.
- answer must be a string.
- explanation must be a string.
- key_points must contain 4-6 strings.
- similar_question must exist.
- Do not add extra fields.
- Return ONLY JSON.

==================================================
QUESTION
==================================================

The question field must preserve the complete visible
question.

Preserve:

- Question numbers
- Sub-question numbers
- Mathematical expressions
- Values
- Units
- Options
- Conditions

Do not unnecessarily rewrite the question.

==================================================
ANSWER
==================================================

Solve every visible question.

Give answers in original order.

Clearly label answers.

For numerical questions:

Given:
Required:
Formula:
Substitution:
Calculation:
Final Answer:

Use units.

For multiple-choice questions:

Include the correct option and answer when identifiable.

==================================================
EXPLANATION
==================================================

Keep explanations concise.

Simple:
1-4 essential steps.

Medium:
3-7 essential steps.

Hard:
Only the essential reasoning required to understand the answer.

Do not expose private reasoning or chain-of-thought.

==================================================
MATHEMATICS
==================================================

Use valid Markdown + LaTeX.

Inline:

$...$

Display:

$$
...
$$

Use valid LaTeX for mathematical expressions.

Never output malformed LaTeX.

Never output bare LaTeX commands.

==================================================
PHYSICS
==================================================

Use SI units where appropriate.

Check:

- Units
- Signs
- Powers
- Dimensions
- Vector direction
- Magnitude

==================================================
CHEMISTRY
==================================================

Preserve:

- Chemical formulas
- Subscripts
- Superscripts
- Ionic charges
- Coefficients
- Reaction equations
- Oxidation states
- Units

Balance equations when required.

==================================================
BIOLOGY
==================================================

Preserve scientific terminology.

Do not invent unclear diagram labels.

Explain structures and processes accurately and concisely.

==================================================
COMPUTER SCIENCE
==================================================

If code is requested:

- Provide actual executable code.
- Use requested language.
- If language is unspecified, use Python.
- If output is requested, trace the supplied code exactly.

==================================================
MULTIPLE QUESTIONS
==================================================

If multiple questions exist:

1. Question 1
2. Question 2
3. Question 3

Solve ALL of them.

Preserve original order.

==================================================
DIFFICULTY
==================================================

Easy:
Direct formula, definition, one-step calculation.

Medium:
Multiple steps or moderate reasoning.

Hard:
Complex reasoning or multiple concepts.

==================================================
KEY POINTS
==================================================

Return 4-6 concise useful points.

Do not repeat the entire solution.

==================================================
SIMILAR QUESTION
==================================================

Generate EXACTLY ONE useful practice question.

It must test the same main concept.

Use different values or a slightly different situation.

Do not simply copy the original.

Do not provide the solution unless necessary.

==================================================
IMAGE READING
==================================================

Inspect the COMPLETE image.

Pay attention to:

- Numbers
- Decimal points
- Negative signs
- Superscripts
- Subscripts
- Units
- Mathematical symbols
- Answer choices
- Diagram labels

Do not confuse:

1 and l
0 and O
× and x
− and —
+ and ±

If something is genuinely unreadable, do not invent it.

==================================================
ACCURACY
==================================================

Before returning JSON:

- Recalculate numerical answers.
- Check algebra.
- Check signs.
- Check units.
- Check powers.
- Check fractions.
- Check square roots.
- Check equations.
- Check chemical balancing.
- Check code syntax.
- Check that every visible question is answered.

==================================================
FINAL VALIDATION
==================================================

Verify:

- Entire image inspected.
- Every visible question identified.
- Every sub-question identified.
- Every question solved.
- Calculations verified.
- Units verified.
- LaTeX verified.
- key_points contains 4-6 strings.
- similar_question exists.
- No extra fields.
- JSON is valid.

RETURN ONLY THE JSON OBJECT.
`;

/* =========================================================
   ERROR HELPERS
========================================================= */

function getErrorMessage(data: any): string {
  return (
    data?.error?.message ||
    data?.error?.error?.message ||
    data?.message ||
    "Unknown provider error."
  );
}

function isProviderError(data: any): boolean {
  return Boolean(
    data?.error ||
      data?.provider_error ||
      data?.providerError
  );
}

/* =========================================================
   FETCH WITH TIMEOUT
========================================================= */

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   WAIT
========================================================= */

async function wait(ms: number): Promise<void> {
  if (ms <= 0) return;

  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}



/* =========================================================
   IMAGE VALIDATION
========================================================= */

function validateImage(image: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof image !== "string") {
    return {
      valid: false,
      error: "Image must be a string.",
    };
  }

  const value = image.trim();

  if (!value) {
    return {
      valid: false,
      error: "No image provided.",
    };
  }

  const MAX_IMAGE_STRING_LENGTH =
    20 * 1024 * 1024;

  if (
    value.length >
    MAX_IMAGE_STRING_LENGTH
  ) {
    return {
      valid: false,
      error: "Image is too large.",
    };
  }

  const match = value.match(
    /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/
  );

  if (!match) {
    return {
      valid: false,
      error:
        "Invalid image format. Please upload a PNG, JPEG, WebP, or GIF image.",
    };
  }

  const base64Data =
    match[2].replace(/\s/g, "");

  if (!base64Data) {
    return {
      valid: false,
      error: "Image data is empty.",
    };
  }

  if (base64Data.length % 4 !== 0) {
    return {
      valid: false,
      error: "Invalid base64 image data.",
    };
  }

  const estimatedBytes =
    Math.floor(
      (base64Data.length * 3) / 4
    ) -
    (base64Data.endsWith("==")
      ? 2
      : base64Data.endsWith("=")
        ? 1
        : 0);

  const MAX_IMAGE_BYTES =
    15 * 1024 * 1024;

  if (estimatedBytes <= 0) {
    return {
      valid: false,
      error: "Image data is empty.",
    };
  }

  if (
    estimatedBytes >
    MAX_IMAGE_BYTES
  ) {
    return {
      valid: false,
      error: "Image is too large.",
    };
  }

  return {
    valid: true,
  };
}

/* =========================================================
   CLEAN AI CONTENT
========================================================= */

function cleanAIContent(
  content: string
): string {
  let cleaned = content.trim();

  cleaned = cleaned.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ""
  );

  cleaned = cleaned.replace(
    /^```json\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /^```\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /\s*```$/i,
    ""
  );

  cleaned = cleaned.trim();

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  return cleaned.trim();
}

/* =========================================================
   NORMALIZE RESULT
========================================================= */

function validateAndNormalize(
  raw: any
): AnalysisResult | null {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    return null;
  }

  const getString = (
    value: unknown
  ): string => {
    return typeof value === "string"
      ? value.trim()
      : "";
  };

  const question =
    getString(raw.question);

  const subject =
    getString(raw.subject);

  const topic =
    getString(raw.topic);

  const difficulty =
    getString(raw.difficulty);

  const answer =
    getString(raw.answer);

  const explanation =
    getString(raw.explanation);

  const similarQuestion =
    getString(raw.similar_question);

  if (!question) return null;
  if (!subject) return null;
  if (!topic) return null;
  if (!difficulty) return null;
  if (!answer) return null;
  if (!explanation) return null;
  if (!similarQuestion) return null;

  const normalizedDifficulty =
    difficulty.toLowerCase();

  if (
    !["easy", "medium", "hard"].includes(
      normalizedDifficulty
    )
  ) {
    return null;
  }

  let keyPoints: string[] = [];

  if (
    Array.isArray(
      raw.key_points
    )
  ) {
    keyPoints =
      raw.key_points
        .map((point: unknown) => {
          if (
            typeof point === "string"
          ) {
            return point.trim();
          }

          if (
            typeof point === "object" &&
            point !== null
          ) {
            const values =
              Object.values(point);

            if (
              values.length > 0
            ) {
              return String(
                values[0]
              ).trim();
            }
          }

          return "";
        })
        .filter(Boolean);
  }

  if (keyPoints.length < 3) {
    return null;
  }

  keyPoints = Array.from(
    new Set(keyPoints)
  ).slice(0, 6);

  const failurePatterns = [
    /^i cannot/i,
    /^i can't/i,
    /^unable to analyze/i,
    /^unable to solve/i,
    /^cannot analyze/i,
    /^cannot solve/i,
    /^no answer/i,
    /^not enough information/i,
  ];

  for (
    const field of [
      answer,
      explanation,
    ]
  ) {
    for (
      const pattern of failurePatterns
    ) {
      if (pattern.test(field)) {
        return null;
      }
    }
  }

  const combinedText = [
    question,
    answer,
    explanation,
    similarQuestion,
    ...keyPoints,
  ]
    .join(" ")
    .toLowerCase();

  const placeholders = [
    "answer here",
    "your answer",
    "solution here",
    "insert answer",
    "todo",
    "tbd",
  ];

  for (
    const placeholder of placeholders
  ) {
    if (
      combinedText.includes(
        placeholder
      )
    ) {
      return null;
    }
  }

  if (answer.length < 2) {
    return null;
  }

  if (explanation.length < 5) {
    return null;
  }

  const mathFields = [
    question,
    answer,
    explanation,
    similarQuestion,
    ...keyPoints,
  ];

  for (
    const field of mathFields
  ) {
    if (
      /\\frac\s+[^{}\s]+\s+[^{}\s]+/.test(
        field
      )
    ) {
      return null;
    }

    if (
      /\\sqrt\s+[A-Za-z0-9]/.test(
        field
      )
    ) {
      return null;
    }
  }

  const finalDifficulty =
    normalizedDifficulty
      .charAt(0)
      .toUpperCase() +
    normalizedDifficulty.slice(1);

  return {
    question,
    subject,
    topic,
    difficulty:
      finalDifficulty,
    answer,
    explanation,
    key_points:
      keyPoints,
    similar_question:
      similarQuestion,
  };
}

/* =========================================================
   QUESTION COUNT
========================================================= */

function getQuestionCount(
  text: string
): number {
  const value = text.trim();

  if (!value) {
    return 0;
  }

  const matches =
    value.match(
      /(?:^|\n)\s*(?:Q(?:uestion)?\s*)?\d+\s*[.):]/gi
    );

  if (
    matches &&
    matches.length > 0
  ) {
    return matches.length;
  }

  return 1;
}

/* =========================================================
   BUILD REQUEST BODY
========================================================= */

function buildRequestBody(
  model: string,
  image: string
) {
  return {
    model,

    messages: [
      {
        role: "system",
        content: systemPrompt,
      },

      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Analyze the COMPLETE uploaded educational question image. Solve EVERY visible question and sub-question. Return ONLY the required JSON object. Make all mathematical expressions valid Markdown LaTeX.",
          },

          {
            type: "image_url",
            image_url: {
              url: image,
            },
          },
        ],
      },
    ],

    response_format: {
      type: "json_object",
    },

    temperature: 0.1,

    max_tokens: 4000,
  };
}

/* =========================================================
   SAVE TO HISTORY
========================================================= */

async function saveAnalysisToHistory(
  userId: string,
  result: AnalysisResult,
  provider: string,
  model: string
): Promise<void> {
  try {
    const client =
      await clientPromise;

    const db =
      client.db(DB_NAME);

    await db
      .collection("history")
      .insertOne({
        userId,

        question:
          result.question,

        subject:
          result.subject,

        topic:
          result.topic,

        difficulty:
          result.difficulty,

        answer:
          result.answer,

        explanation:
          result.explanation,

        key_points:
          result.key_points,

        similar_question:
          result.similar_question,

        provider,

        model,

        createdAt:
          new Date(),
      });

    console.log(
      "[Snap2Study] Analysis saved to history."
    );
  } catch (error) {
    /*
     * IMPORTANT:
     *
     * History failure must NOT make a successful
     * AI analysis fail.
     */
    console.error(
      "[Snap2Study] Failed to save analysis to history:",
      error
    );
  }
}

/* =========================================================
   PROVIDER REQUEST
========================================================= */

async function requestProvider(
  provider: ProviderName,
  url: string,
  apiKey: string,
  model: string,
  image: string,
  timeoutMs: number
):
  Promise<
    | {
        success: true;
        result: AnalysisResult;
        model: string;
        provider: string;
      }
    | {
        success: false;
        reason: string;
      }
  > {
  console.log(
    `[Snap2Study] ${provider}: trying ${model}`
  );

  try {
    const response =
      await fetchWithTimeout(
        url,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "https://snap2study.vercel.app",

            "X-Title":
              "Snap2Study",
          },

          body: JSON.stringify(
            buildRequestBody(
              model,
              image
            )
          ),
        },
        timeoutMs
      );

    console.log(
      `[Snap2Study] ${provider} HTTP: ${response.status}`
    );

    let data: any;

    try {
      data =
        await response.json();
    } catch {
      return {
        success: false,
        reason:
          "Invalid HTTP JSON response",
      };
    }

    console.log(
      `[Snap2Study] ${provider} model: ${
        data?.model ?? model
      }`
    );

    console.log(
      `[Snap2Study] ${provider} provider: ${
        data?.provider ?? "unknown"
      }`
    );

    if (isProviderError(data)) {
      const errorMessage =
        getErrorMessage(data);

      console.error(
        `[Snap2Study] ${provider} provider error: ${errorMessage}`
      );

      return {
        success: false,
        reason:
          errorMessage,
      };
    }

    if (!response.ok) {
      const errorMessage =
        getErrorMessage(data);

      console.error(
        `[Snap2Study] ${provider} HTTP error: ${errorMessage}`
      );

      return {
        success: false,
        reason:
          `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const choice =
      data?.choices?.[0];

    if (!choice) {
      return {
        success: false,
        reason:
          "No choice returned",
      };
    }

    const finishReason =
      choice?.finish_reason;

    const nativeFinishReason =
      choice?.native_finish_reason;

    console.log(
      `[Snap2Study] ${provider} finish reason: ${
        finishReason ?? "undefined"
      }`
    );

    console.log(
      `[Snap2Study] ${provider} native finish reason: ${
        nativeFinishReason ?? "undefined"
      }`
    );

    if (
      finishReason === "length" ||
      nativeFinishReason === "length"
    ) {
      return {
        success: false,
        reason:
          "Output was truncated",
      };
    }

    const content =
      choice?.message?.content;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return {
        success: false,
        reason:
          "AI returned no usable content",
      };
    }

    console.log(
      `[Snap2Study] ${provider} AI content received.`
    );

    const cleaned =
      cleanAIContent(content);

    console.log(
      `[Snap2Study] ${provider} cleaned JSON length: ${cleaned.length}`
    );

    let parsed: any;

    try {
      parsed =
        JSON.parse(cleaned);
    } catch (error) {
      console.error(
        `[Snap2Study] Invalid JSON from ${provider} ${model}.`
      );

      console.error(
        "[Snap2Study] JSON parse error:",
        error
      );

      console.error(
        "[Snap2Study] Content:",
        cleaned.slice(0, 2500)
      );

      return {
        success: false,
        reason:
          "Invalid AI JSON",
      };
    }

    const result =
      validateAndNormalize(
        parsed
      );

    if (!result) {
      console.error(
        `[Snap2Study] ${provider} local validation failed.`
      );

      console.error(
        "[Snap2Study] Received keys:",
        Object.keys(
          parsed ?? {}
        )
      );

      return {
        success: false,
        reason:
          "Invalid or incomplete result structure",
      };
    }

    /* =====================================================
       QUESTION COUNT CHECK
    ===================================================== */

    const detectedQuestionCount =
      getQuestionCount(
        result.question
      );

    const answerQuestionCount =
      getQuestionCount(
        result.answer
      );

    const explanationQuestionCount =
      getQuestionCount(
        result.explanation
      );

    console.log(
      `[Snap2Study] ${provider} question count: ${detectedQuestionCount}`
    );

    console.log(
      `[Snap2Study] ${provider} answer count: ${answerQuestionCount}`
    );

    console.log(
      `[Snap2Study] ${provider} explanation count: ${explanationQuestionCount}`
    );

    if (
      detectedQuestionCount > 1 &&
      answerQuestionCount > 0 &&
      answerQuestionCount <
        detectedQuestionCount
    ) {
      console.error(
        `[Snap2Study] ${provider}: answer appears incomplete.`
      );

      return {
        success: false,
        reason:
          "Answer appears incomplete",
      };
    }

    if (
      detectedQuestionCount > 1 &&
      explanationQuestionCount > 0 &&
      explanationQuestionCount <
        detectedQuestionCount
    ) {
      console.error(
        `[Snap2Study] ${provider}: explanation appears incomplete.`
      );

      return {
        success: false,
        reason:
          "Explanation appears incomplete",
      };
    }

    console.log(
      `[Snap2Study] SUCCESS: ${provider} → ${model}`
    );

    return {
      success: true,
      result,
      model,
      provider,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      console.error(
        `[Snap2Study] ${provider} timeout after ${timeoutMs}ms.`
      );

      return {
        success: false,
        reason:
          `Request timeout after ${timeoutMs}ms`,
      };
    }

    console.error(
      `[Snap2Study] ${provider} request failed: ${errorMessage}`
    );

    return {
      success: false,
      reason:
        errorMessage,
    };
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
): Promise<NextResponse> {
  console.log(
    "[Snap2Study] Starting analysis..."
  );

  try {
    /* =====================================================
       1. METHOD
    ===================================================== */

    if (
      request.method !== "POST"
    ) {
      return NextResponse.json(
        {
          error:
            "Method not allowed.",
        },
        {
          status: 405,
          headers: {
            Allow: "POST",
          },
        }
      );
    }

    /* =====================================================
       2. RATE LIMIT
    ===================================================== */

    const forwardedFor =
      request.headers.get(
        "x-forwarded-for"
      );

    const realIp =
      request.headers.get(
        "x-real-ip"
      );

    const identifier =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      realIp ||
      "anonymous";

    const rateLimit =
      checkRateLimit(
        identifier
      );

    console.log(
      "[Snap2Study] Rate limit:",
      {
        allowed:
          rateLimit.allowed,
        remaining:
          rateLimit.remaining,
      }
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please try again later.",
        },
        {
          status: 429,

          headers: {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil(
                  (rateLimit.resetAt -
                    Date.now()) /
                    1000
                )
              )
            ),

            "X-RateLimit-Remaining":
              "0",
          },
        }
      );
    }

    /* =====================================================
       3. CONTENT TYPE
    ===================================================== */

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType
        .toLowerCase()
        .includes(
          "application/json"
        )
    ) {
      return NextResponse.json(
        {
          error:
            "Request body must be JSON.",
        },
        {
          status: 415,
        }
      );
    }

    /* =====================================================
       4. BODY
    ===================================================== */

    let body: any;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       5. IMAGE
    ===================================================== */

    const image =
      body?.image;

    const imageValidation =
      validateImage(image);

    if (
      !imageValidation.valid
    ) {
      return NextResponse.json(
        {
          error:
            imageValidation.error ??
            "Invalid image.",
        },
        {
          status: 400,
        }
      );
    }

    const imageString =
      image as string;

   /* =====================================================
   6. AUTHENTICATION
===================================================== */

const currentUser = await getCurrentUser();

if (!currentUser) {
  console.log(
    "[Snap2Study] Analysis rejected: user not authenticated."
  );

  return NextResponse.json(
    {
      error:
        "You must be logged in to analyze a question.",
      code: "AUTH_REQUIRED",
    },
    {
      status: 401,
    }
  );
}

console.log(
  `[Snap2Study] Authenticated user: ${currentUser.email}`
);


const authenticatedUser = currentUser;

console.log(
  `[Snap2Study] Authenticated user: ${authenticatedUser.email}`
);

    /* =====================================================
       7. API KEYS
    ===================================================== */

    const groqKey1 =
      process.env.GROQ_API_KEY_1;

    const groqKey2 =
      process.env.GROQ_API_KEY_2;

    const groqKey3 =
      process.env.GROQ_API_KEY_3;

    const groqKey4 =
      process.env.GROQ_API_KEY_4;

    const openRouterKey =
      process.env.OPENROUTER_API_KEY_2;

    console.log(
      "[Snap2Study] Providers available:",
      {
        groqAccount1:
          Boolean(groqKey1),

        groqAccount2:
          Boolean(groqKey2),

        groqAccount3:
          Boolean(groqKey3),

        groqAccount4:
          Boolean(groqKey4),

        openRouterAccount2:
          Boolean(openRouterKey),
      }
    );

    /* =====================================================
       8. AT LEAST ONE PROVIDER
    ===================================================== */

    if (
      !groqKey1 &&
      !groqKey2 &&
      !groqKey3 &&
      !groqKey4 &&
      !openRouterKey
    ) {
      console.error(
        "[Snap2Study] No AI provider keys configured."
      );

      return NextResponse.json(
        {
          error:
            "No AI provider is configured.",
        },
        {
          status: 500,
        }
      );
    }

    const failures: string[] =
      [];

    /* =====================================================
       HELPER: RETURN SUCCESS + SAVE HISTORY
    ===================================================== */

    async function handleSuccess(
  result: {
    success: true;
    result: AnalysisResult;
    model: string;
    provider: string;
  }
) {
  await saveAnalysisToHistory(
    authenticatedUser._id.toString(),
    result.result,
    result.provider,
    result.model
  );

  return NextResponse.json(
    result.result,
    {
      status: 200,
      headers: {
        "X-Snap2Study-Provider":
          result.provider,

        "X-Snap2Study-Model":
          result.model,

        "X-RateLimit-Remaining":
          String(rateLimit.remaining),
      },
    }
  );
}

    /* =====================================================
       9. GROQ ACCOUNT 1
    ===================================================== */

    if (groqKey1) {
      const result =
        await requestProvider(
          "Groq Account 1",
          GROQ_URL,
          groqKey1,
          GROQ_MODEL_1,
          imageString,
          GROQ_TIMEOUT_MS
        );

      if (
        result.success
      ) {
        return handleSuccess(
          result
        );
      }

      failures.push(
        `Groq Account 1: ${result.reason}`
      );
    } else {
      failures.push(
        "Groq Account 1: API key missing"
      );
    }

    await wait(
      FALLBACK_DELAY_MS
    );

    /* =====================================================
       10. GROQ ACCOUNT 2
    ===================================================== */

    if (groqKey2) {
      const result =
        await requestProvider(
          "Groq Account 2",
          GROQ_URL,
          groqKey2,
          GROQ_MODEL_2,
          imageString,
          GROQ_TIMEOUT_MS
        );

      if (
        result.success
      ) {
        return handleSuccess(
          result
        );
      }

      failures.push(
        `Groq Account 2: ${result.reason}`
      );
    } else {
      failures.push(
        "Groq Account 2: API key missing"
      );
    }

    await wait(
      FALLBACK_DELAY_MS
    );

    /* =====================================================
       11. GROQ ACCOUNT 3
    ===================================================== */

    if (groqKey3) {
      const result =
        await requestProvider(
          "Groq Account 3",
          GROQ_URL,
          groqKey3,
          GROQ_MODEL_1,
          imageString,
          GROQ_TIMEOUT_MS
        );

      if (
        result.success
      ) {
        return handleSuccess(
          result
        );
      }

      failures.push(
        `Groq Account 3: ${result.reason}`
      );
    } else {
      failures.push(
        "Groq Account 3: API key missing"
      );
    }

    await wait(
      FALLBACK_DELAY_MS
    );

    /* =====================================================
       12. GROQ ACCOUNT 4
    ===================================================== */

    if (groqKey4) {
      const result =
        await requestProvider(
          "Groq Account 4",
          GROQ_URL,
          groqKey4,
          GROQ_MODEL_2,
          imageString,
          GROQ_TIMEOUT_MS
        );

      if (
        result.success
      ) {
        return handleSuccess(
          result
        );
      }

      failures.push(
        `Groq Account 4: ${result.reason}`
      );
    } else {
      failures.push(
        "Groq Account 4: API key missing"
      );
    }

    await wait(
      FALLBACK_DELAY_MS
    );

    /* =====================================================
       13. OPENROUTER → NEMOTRON
    ===================================================== */

    if (openRouterKey) {
      const result =
        await requestProvider(
          "OpenRouter",
          OPENROUTER_URL,
          openRouterKey,
          NEMOTRON_MODEL,
          imageString,
          NEMOTRON_TIMEOUT_MS
        );

      if (
        result.success
      ) {
        return handleSuccess(
          result
        );
      }

      failures.push(
        `OpenRouter Nemotron: ${result.reason}`
      );
    } else {
      failures.push(
        "OpenRouter Nemotron: API key missing"
      );
    }

    /* =====================================================
       14. ALL PROVIDERS FAILED
    ===================================================== */

    console.error(
      "[Snap2Study] All AI providers failed."
    );

    console.error(
      "[Snap2Study] Failure summary:",
      failures
    );

    return NextResponse.json(
      {
        error:
          "The AI service is temporarily busy. Please try again in a few seconds.",
      },
      {
        status: 503,

        headers: {
          "X-RateLimit-Remaining":
            String(
              rateLimit.remaining
            ),
        },
      }
    );
  } catch (error) {
    console.error(
      "[Snap2Study] Global API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while analyzing the image. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}