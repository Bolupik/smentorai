import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewResult {
  approved: boolean;
  score: number;
  summary: string;
  issues: string[];
  suggestions: string[];
  category_match: boolean;
  factual_accuracy: "verified" | "unverified" | "incorrect";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth verification failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired session", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has admin role for reviews
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: roleData } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required", success: false }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.id} requesting AI review`);

    const { entryId, topic, content, category, linkUrl } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service configuration error");
    }

    console.log(`Reviewing contribution: ${topic} (${category})`);

    const reviewPrompt = `You are The Architect's Knowledge Reviewer, an expert AI system that evaluates community contributions to the Stacks ecosystem knowledge base.

EVALUATION CRITERIA:

1. **FACTUAL ACCURACY** (Critical):
   - Is the information about Stacks, Bitcoin, Clarity, DeFi, NFTs, or related topics accurate?
   - Are there any factual errors or outdated information?
   - Does it align with official Stacks documentation and current state of the ecosystem?

2. **RELEVANCE & VALUE**:
   - Is this genuinely useful for someone learning about Stacks?
   - Does it add value to The Architect's knowledge base?
   - Is it specific enough to be actionable?

3. **QUALITY & CLARITY**:
   - Is the content well-written and understandable?
   - Is it free of spam, promotional content, or off-topic material?
   - Is the category correctly assigned?

4. **SAFETY**:
   - Does it contain any harmful advice (e.g., security vulnerabilities)?
   - Is it trying to promote scams or phishing?
   - Does it encourage unsafe practices?

STACKS ECOSYSTEM KNOWLEDGE FOR VERIFICATION:
- Stacks is a Bitcoin Layer (not L2 in traditional sense) that uses Proof of Transfer
- STX is the native token, used for stacking to earn BTC rewards
- Clarity is the smart contract language (decidable, not Turing-complete)
- sBTC is the decentralized Bitcoin peg (launched 2024-2025)
- Key protocols: ALEX, Arkadiko, Velar, Zest, StackingDAO, Bitflow
- NFT marketplace: Gamma.io
- Wallets: Xverse, Leather (formerly Hiro), Asigna
- Nakamoto upgrade brought fast blocks and Bitcoin finality

CONTRIBUTION TO REVIEW:

**Category**: ${category}
**Topic**: ${topic}
**Content**: ${content}
${linkUrl ? `**Reference Link**: ${linkUrl}` : ''}

RESPOND WITH ONLY A VALID JSON OBJECT (no markdown, no code blocks):
{
  "approved": boolean,
  "score": number (0-100),
  "summary": "Brief assessment of the contribution quality",
  "issues": ["List of any problems found"],
  "suggestions": ["Suggestions for improvement if any"],
  "category_match": boolean,
  "factual_accuracy": "verified" | "unverified" | "incorrect"
}

APPROVAL GUIDELINES:
- Score 70+ with no critical issues = approved
- Any factual inaccuracies = NOT approved
- Spam, promotional, or harmful content = NOT approved
- Poorly written but factual = suggest improvements, may approve with score 60-69
- Exceptional contributions = score 90+`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: reviewPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent reviews
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI review service error");
    }

    const data = await response.json();
    const reviewContent = data.choices?.[0]?.message?.content;
    
    if (!reviewContent) {
      throw new Error("No review content received from AI");
    }

    console.log("Raw AI response:", reviewContent);

    // Parse the JSON response - handle potential markdown wrapping
    let review: ReviewResult;
    try {
      // Remove potential markdown code blocks
      let cleanContent = reviewContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      review = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI review:", parseError, reviewContent);
      // Return a safe default if parsing fails
      review = {
        approved: false,
        score: 0,
        summary: "Unable to complete automated review. Manual review required.",
        issues: ["Automated review parsing failed"],
        suggestions: ["Please review this contribution manually"],
        category_match: true,
        factual_accuracy: "unverified"
      };
    }

    // Store the review result in the database if entryId provided
    if (entryId) {
      // We could store reviews in a separate table, but for now just log
      console.log(`Review complete for entry ${entryId}:`, review);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        review,
        message: review.approved 
          ? "Contribution passed AI review and is ready for final approval." 
          : "Contribution needs attention before approval."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Review error:", e);
    return new Response(
      JSON.stringify({ 
        error: "Failed to complete AI review. Please try again.",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
