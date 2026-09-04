import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, "..");
export const ARTICLES_DIR = path.join(ROOT_DIR, "content");
export const PUBLIC_DIR = path.join(ROOT_DIR, "public");
export const STATE_PATH = path.join(__dirname, "state.json");
export const TMP_DIR = path.join(__dirname, "tmp");
export const OUT_DIR = path.join(__dirname, "out");

export const BRAND_NAME = "Skydream";
export const CHIME_PATH = path.join(__dirname, "assets", "chime.mp3");
// Solid brand-color backdrop for intro/outro, used whenever the OpenAI
// cover generation is unavailable or fails.
export const INTRO_BG_PATH = path.join(__dirname, "assets", "intro-bg.png");
// Fixed brand bumper shown at the very start of every video, identical
// every time — the one recognizable element that doesn't vary with the
// topic (unlike the AI-generated cover, which is per-article on purpose).
export const TITLE_CARD_PATH = path.join(__dirname, "assets", "title-card.png");
// Subtle warm/rosé push applied to every image in every video, so the
// channel has a consistent visual signature even though the underlying
// photos vary a lot from one topic to the next.
export const COLOR_GRADE = "eq=saturation=1.07:contrast=1.03,colorbalance=rm=0.06:rh=0.03:bm=-0.02";

// Multilingual-generation neural voice — sounds noticeably warmer/more
// natural than the older single-locale neural voices (e.g. DeniseNeural).
export const TTS_VOICE = "fr-FR-VivienneMultilingualNeural";
export const TTS_PROSODY = { rate: "+3%", pitch: "+7%" };

// No contextual "in situation" photo pool yet for this niche — categories
// just skip the cutaway until some get added.
export const SITUATION_IMAGES = {};

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;

// Optional: when set, the intro/outro backdrop is generated per-video with
// OpenAI instead of the flat INTRO_BG_PATH — falls back to it automatically
// if the key is missing or the API call fails, so a bad day never breaks
// the unattended run.
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
export const OPENAI_IMAGE_MODEL = "gpt-image-1.5";
