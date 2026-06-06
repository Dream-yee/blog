const fs = require("fs").promises;
const path = require("path");

const postsDir = path.join(__dirname, "posts");
const manifestPath = path.join(postsDir, "posts.json");

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const metadata = {};
  if (!match) return metadata;

  const raw = match[1].trim();
  raw.split(/\r?\n/).forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key) return;
    const value = rest.join(":").trim();
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey === "tags") {
      metadata.tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else {
      metadata[normalizedKey] = value;
    }
  });

  return metadata;
}

async function buildManifest() {
  const files = await fs.readdir(postsDir);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const posts = await Promise.all(
    markdownFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const content = await fs.readFile(path.join(postsDir, file), "utf8");
      const meta = parseFrontMatter(content);

      return {
        slug,
        title: meta.title || slug,
        subtitle: meta.subtitle || "",
        published: meta.published || "",
        updated: meta.updated || "",
        tags: meta.tags || [],
        banner: meta.banner || "",
      };
    })
  );

  posts.sort((a, b) => {
    if (a.published === b.published) return a.slug.localeCompare(b.slug, "zh-Hant");
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  await fs.writeFile(manifestPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
  console.log(`Generated ${path.relative(__dirname, manifestPath)} with ${posts.length} posts.`);
}

buildManifest().catch((error) => {
  console.error("Failed to generate posts.json:", error);
  process.exit(1);
});
