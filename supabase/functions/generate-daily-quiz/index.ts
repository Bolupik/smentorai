import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Today's date in UTC
    const today = new Date().toISOString().split("T")[0];

    // Check if today's quiz already exists
    const { data: existing } = await supabase
      .from("daily_quizzes")
      .select("id, quiz_date, questions")
      .eq("quiz_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ quiz: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent approved knowledge base entries for context
    const { data: knowledgeEntries } = await supabase
      .from("knowledge_base")
      .select("topic, content, category")
      .eq("approved", true)
      .order("upvotes", { ascending: false })
      .limit(20);

    const knowledgeContext =
      knowledgeEntries && knowledgeEntries.length > 0
        ? knowledgeEntries
            .map((e) => `[${e.category?.toUpperCase() ?? e.topic}] ${e.content}`)
            .join("\n\n")
        : "No community knowledge available yet.";

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPrompt = `You are an expert on the Stacks blockchain ecosystem. Your task is to generate a daily quiz of exactly 15 multiple-choice questions. 

TOPICS TO COVER (distribute questions across these):
1. Stacks Architecture (PoX, Nakamoto upgrade, Bitcoin finality, Signers)
2. Clarity Language (syntax, post-conditions, contracts, traits)
3. DeFi (AMMs, lending, yield, sBTC liquidity)
4. NFTs (Clarity standards, marketplaces, royalties)
5. Security (contract auditing, best practices, attack vectors)
6. Stacking (PoX stacking, pools, rewards, cycles)
7. sBTC (peg, decentralization, bridging, thresholds)
8. Tools & Wallets (Leather, Xverse, BNS, Clarity tools)

COMMUNITY KNOWLEDGE (use these real-world insights to inspire questions where relevant):
${knowledgeContext}

RULES:
- Generate exactly 15 questions
- Each question must have exactly 4 options (A, B, C, D)
- Vary difficulty: 5 beginner, 5 intermediate, 5 advanced
- Make questions factual and educational, not trick questions
- Explanations should be 1-2 sentences
- Date context: ${dateStr}

Return ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "questions": [
    {
      "id": 1,
      "topic": "architecture",
      "difficulty": "beginner",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of the correct answer."
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate today's (${dateStr}) Stacks ecosystem daily quiz with exactly 15 questions.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate quiz" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    // Parse JSON from AI response (strip any markdown fences)
    let parsedQuiz: { questions: unknown[] };
    try {
      const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedQuiz = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI quiz JSON:", rawContent.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse quiz content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!parsedQuiz.questions || parsedQuiz.questions.length === 0) {
      return new Response(
        JSON.stringify({ error: "AI returned empty quiz" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store quiz in DB
    const { data: saved, error: saveError } = await supabase
      .from("daily_quizzes")
      .insert({
        quiz_date: today,
        questions: parsedQuiz.questions,
        generated_by: "ai",
      })
      .select()
      .single();

    if (saveError) {
      // Could be a race condition duplicate — try to fetch existing
      const { data: raceExisting } = await supabase
        .from("daily_quizzes")
        .select("id, quiz_date, questions")
        .eq("quiz_date", today)
        .maybeSingle();

      if (raceExisting) {
        return new Response(JSON.stringify({ quiz: raceExisting }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw saveError;
    }

    return new Response(JSON.stringify({ quiz: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-daily-quiz error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
