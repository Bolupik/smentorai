import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ImageMode = "infographic" | "meme" | "character";

function buildPrompt(mode: ImageMode, topic: string, context?: string): string {
  switch (mode) {
    case "meme":
      return `Create a funny, viral-worthy crypto meme image about "${topic}".

Style:
- Bold, punchy meme format (think popular meme templates but original artwork)
- Exaggerated cartoon or comic style with vivid colors
- Include expressive characters or mascots reacting to the crypto situation
- Text overlays should be large, bold, white with black outline (classic meme font style)
- The humor should be relatable to crypto/blockchain enthusiasts
- Make it shareable and instantly funny
- Use vibrant saturated colors, NOT dark/muted tones
- The image should work as a standalone meme without needing extra context

Topic context: ${context || topic}`;

    case "character":
      return `Create a unique, memorable character illustration representing "${topic}" in the Stacks/Bitcoin ecosystem.

Style:
- Anime/manga inspired or stylized digital art character design
- The character should embody the concept visually (e.g., a DeFi character might have golden armor, a security character might have a shield)
- Full character design with distinctive outfit, accessories, and pose
- Rich color palette with Stacks purple (#5546FF) and Bitcoin orange (#F7931A) accents
- Professional quality, suitable as a mascot or avatar
- Dynamic pose showing personality and energy
- Clean linework with cel-shading or polished digital art style
- Background should complement the character with subtle thematic elements

Character concept: ${context || topic}`;

    case "infographic":
    default:
      return `Create a HIGH-QUALITY, visually stunning educational infographic poster about "${topic}".

CRITICAL DESIGN REQUIREMENTS:
- This must look like a professionally designed infographic, NOT AI-generated slop
- Use a clean grid layout with clear visual hierarchy
- Dark gradient background (deep navy #0A0E1A to dark purple #1A0B2E)
- Accent colors: Bitcoin orange (#F7931A), Stacks purple (#5546FF), electric cyan (#00D4FF)
- Modern sans-serif typography with clear size hierarchy (title > subtitles > body)
- Use geometric icons, clean vector-style illustrations, and connecting lines/arrows
- Include data visualization elements: progress bars, pie charts, flow diagrams, or comparison tables where relevant
- Each section should have an icon and a short, punchy label
- White and light gray text on dark background for maximum readability
- Add subtle glow effects on accent elements for a premium tech feel
- The layout should flow logically: top-to-bottom or left-to-right storytelling
- Include at minimum 3-5 distinct information sections

Content to visualize: ${context || topic}

Make this look like something from a top-tier crypto research report or Bloomberg terminal design.`;
  }
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
        JSON.stringify({ error: "Authentication required" }),
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
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { topic, context, mode = "infographic" } = await req.json();
    
    // Validate mode
    const validModes: ImageMode[] = ["infographic", "meme", "character"];
    const imageMode: ImageMode = validModes.includes(mode) ? mode : "infographic";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service configuration error");
    }

    console.log(`Generating ${imageMode} for topic: ${topic}`);

    const imagePrompt = buildPrompt(imageMode, topic, context);

    // Use the higher-quality pro model for all image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        modalities: ["image", "text"]
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
      console.error("Image generation error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`${imageMode} generation response received`);

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No image generated", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        mode: imageMode,
        description: textContent || `${imageMode} about ${topic}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Image generation error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during image generation." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
