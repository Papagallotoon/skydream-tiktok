import fs from "node:fs";
import path from "node:path";
import { OPENAI_API_KEY, OPENAI_IMAGE_MODEL } from "./config.mjs";

const STYLE_SUFFIX =
  "Photographie beauté professionnelle haut de gamme, esthétique soft glam, lumière douce et flatteuse, " +
  "tons pastel rosés, très net, aucun texte, aucun logo, format vertical.";

// Intro and outro get distinct prompts (not the same image shown twice) —
// a close-up hero shot to open, a wider lifestyle shot to close, so a
// single-topic video still shows more than just its 5 product photos.
const ANGLE_VARIANTS = {
  intro: "Plan rapproché sur une chevelure soignée et brillante, cadrage dynamique façon couverture de magazine beauté.",
  outro: "Plan large lifestyle, coiffeuse ou salle de bain épurée avec une ambiance cosy et lumineuse.",
};

function promptForArticle(article, variant) {
  return `${article.title}. ${ANGLE_VARIANTS[variant]} ${STYLE_SUFFIX}`;
}

async function requestImage(prompt) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: "1024x1536",
      quality: "medium",
      n: 1,
    }),
  });
  return res;
}

// Generates one thematic image for the given variant ("intro" or "outro"),
// saved to outPath. Returns true on success, false on any failure — callers
// should fall back to the static brand background rather than let this
// crash an unattended run.
export async function generateThemedImage(article, variant, outPath) {
  if (!OPENAI_API_KEY) return false;

  try {
    const res = await requestImage(promptForArticle(article, variant));

    if (!res.ok) {
      console.error(`OpenAI image generation failed (${res.status}): ${await res.text()}`);
      return false;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      console.error("OpenAI image generation: no image data in response");
      return false;
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
    return true;
  } catch (err) {
    console.error("OpenAI image generation error:", err);
    return false;
  }
}
