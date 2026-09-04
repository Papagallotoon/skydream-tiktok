import fs from "node:fs";
import path from "node:path";
import { selectNextArticle, loadArticleBySlug, markUsed } from "./select-article.mjs";
import { buildScript } from "./build-script.mjs";
import { synthesizeLines } from "./tts.mjs";
import { renderVideo } from "./render.mjs";
import { generateThemedImage } from "./generate-image.mjs";
import { TMP_DIR, OUT_DIR, INTRO_BG_PATH } from "./config.mjs";

// No YouTube (or TikTok) upload step here — TikTok's official API only
// allows unattended *public* posting for audited apps, so for now this
// pipeline just renders the video and leaves it in OUT_DIR (committed to
// the repo, not gitignored, so it's downloadable from GitHub) for manual
// posting from the TikTok app.
async function main() {
  const forcedSlug = process.env.FORCE_ARTICLE_SLUG;
  const picked = forcedSlug ? loadArticleBySlug(forcedSlug) : selectNextArticle();
  if (!picked) {
    console.log(
      forcedSlug
        ? `Article "${forcedSlug}" not found or has no product with a real price.`
        : "No unused article left in content/ — nothing to do this run."
    );
    return;
  }
  const { slug, article } = picked;
  console.log(`Selected article: ${slug}`);

  const runTmpDir = path.join(TMP_DIR, slug);
  fs.rmSync(runTmpDir, { recursive: true, force: true });
  fs.mkdirSync(runTmpDir, { recursive: true });

  const introCoverPath = path.join(runTmpDir, "cover-intro.png");
  const outroCoverPath = path.join(runTmpDir, "cover-outro.png");
  const introGenerated = await generateThemedImage(article, "intro", introCoverPath);
  const outroGenerated = await generateThemedImage(article, "outro", outroCoverPath);
  const coverImage = introGenerated ? introCoverPath : INTRO_BG_PATH;
  const outroImage = outroGenerated ? outroCoverPath : coverImage;
  console.log(
    introGenerated
      ? `Generated themed cover images with OpenAI (outro: ${outroGenerated ? "distinct" : "reused intro"})`
      : "Using the static brand background"
  );

  const scriptLines = buildScript(article, { coverImage, outroImage });
  console.log(`Built script with ${scriptLines.length} lines`);

  const linesWithAudio = await synthesizeLines(scriptLines, runTmpDir);
  console.log("Voice-over generated for all lines");

  const outPath = path.join(OUT_DIR, `${slug}.mp4`);
  await renderVideo({ lines: linesWithAudio, article, tmpDir: runTmpDir, outPath });
  console.log(`Video rendered: ${outPath}`);

  markUsed(slug);
  console.log(`Marked "${slug}" as used.`);

  if (process.env.KEEP_TMP !== "1") {
    fs.rmSync(runTmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  if (err?.response?.data) {
    console.error("API error response:", JSON.stringify(err.response.data, null, 2));
  }
  console.error(err);
  process.exit(1);
});
