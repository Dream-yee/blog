const defaultPost = "posts/home.md";

async function loadMarkdown(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      res = await fetch("https://raw.githubusercontent.com/Dream-yee/blog/refs/heads/main/" + url);
      if(!res.ok) {
        throw new Error(`Unable to load ${url}`);
      }
    }
    return await res.text();
  } catch (error) {
    document.getElementById("postBody").innerText = "文章載入失敗，請確認檔案路徑是否正確。";
    console.error(error);
    return null;
  }
}

function parseFrontMatter(markdown) {
  const metadata = {};
  let content = markdown;
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);

  if (match) {
    const rawMeta = match[1].trim();
    content = markdown.slice(match[0].length);
    rawMeta.split(/\n+/).forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key) return;
      const value = rest.join(":").trim();
      if (key.toLowerCase() === "tags") {
        metadata.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
      } else {
        metadata[key.trim()] = value;
      }
    });
  }

  return { metadata, content };
}

function renderMarkdown(md) {
  let html = md
    .replace(/^######\s*(.*)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s*(.*)$/gm, "<h5>$1</h5>")
    .replace(/^####\s*(.*)$/gm, "<h4>$1</h4>")
    .replace(/^###\s*(.*)$/gm, "<h3>$1</h3>")
    .replace(/^##\s*(.*)$/gm, "<h2>$1</h2>")
    .replace(/^#\s*(.*)$/gm, "<h1>$1</h1>")
    .replace(/^---\s*$/gm, "<hr />")
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const mappedLang = mapLanguage(lang);
      const className = mappedLang ? ` class="language-${mappedLang}"` : "";
      return `<pre><code${className}>${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`)
    .replace(/\n\n+/g, "\n\n")
    .replace(/(^|\n)[*+-]\s+(.+)(\n|$)/gm, "$1<li>$2</li>$3")
    .replace(/(<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>\n`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)(\{([^}]+)\})?/g, (match, alt, src, _attrs, attrText) => {
      let attrs = '';
      if (attrText) {
        attrText.split(/\s+/).forEach((pair) => {
          const [name, value] = pair.split('=');
          if (name && value) {
            const cleanValue = value.replace(/^['"]|['"]$/g, '');
            attrs += ` ${name}="${cleanValue}"`;
          }
        });
      }
      return `<img src='${src}' alt='${alt}'${attrs}>`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noreferrer'>$1</a>")
    .replace(/(^|\n)([^<\n][^\n]*)(\n|$)/g, (match, before, line, after) => {
      const isBlock = /^(<h|<ul|<pre|<blockquote|<img|<li|<p|<\/)/.test(line.trim());
      return isBlock ? match : `${before}<p>${line.trim()}</p>${after}`;
    });

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mapLanguage(lang) {
  if (!lang) return "";
  const normalized = lang.toLowerCase();
  const alias = {
    py: "python",
    js: "javascript",
    ts: "typescript",
  };
  return alias[normalized] || normalized;
}

function getPostPath() {
  const params = new URLSearchParams(window.location.search);
  const post = params.get("post");
  if (!post) return defaultPost;
  return `posts/${post}.md`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildBaseUrl() {
  const location = window.location;
  let pathname = location.pathname;
  if (!pathname.endsWith("/")) {
    pathname = pathname.replace(/\/[^/]*$/, "/");
  }
  return `${location.origin}${pathname}`;
}

function updatePageMeta(meta) {
  const title = meta.title ? `${meta.title} | Dreamyee's blog` : "Dreamyee's blog";
  const description = meta.subtitle || "A dark lavender blog built with Markdown.";

  document.title = title;
  updateMetaTag("description", description);
  updateMetaTag("og:title", title, true);
  updateMetaTag("og:description", description, true);
  updateMetaTag("twitter:title", title);
  updateMetaTag("twitter:description", description);
  if (meta.banner) {
    const imageUrl = new URL(meta.banner, buildBaseUrl()).href;
    updateMetaTag("og:image", imageUrl, true);
    updateMetaTag("twitter:image", imageUrl);
  }
  updateJsonLd(meta, description);
}

function updateMetaTag(name, content, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    if (isProperty) {
      node.setAttribute("property", name);
    } else {
      node.setAttribute("name", name);
    }
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function updateJsonLd(meta, description) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title || "Dreamyee's blog",
    description,
    url: window.location.href,
    datePublished: meta.published || undefined,
    dateModified: meta.updated || undefined,
    author: {
      "@type": "Person",
      name: "Dream-yee",
    },
  };

  if (meta.banner) {
    data.image = new URL(meta.banner, buildBaseUrl()).href;
  }

  let script = document.getElementById("jsonld");
  if (!script) {
    script = document.createElement("script");
    script.id = "jsonld";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

function updateBanner(metadata) {
  const banner = document.getElementById("heroBanner");
  if (metadata.banner) {
    banner.style.backgroundImage = `linear-gradient(135deg, rgba(88, 64, 204, 0.4), rgba(59, 27, 102, 0.75)), url('${metadata.banner}')`;
  }
}

function renderPost(meta, content) {
  updatePageMeta(meta);
  document.getElementById("postTitle").textContent = meta.title || "未命名文章";
  document.getElementById("postMeta").textContent = meta.subtitle || "";
  updateBanner(meta);

  const postLength = content.trim().split(/\s+/).length;
  document.getElementById("postLength").textContent = `字數：約 ${postLength} 字`;

  const publish = formatDate(meta.published);
  const update = formatDate(meta.updated);
  const dates = [publish ? `發布：${publish}` : null, update ? `更新：${update}` : null].filter(Boolean).join(" • ");
  document.getElementById("postDates").textContent = dates;

  const tags = document.getElementById("tagList");
  tags.innerHTML = "";
  (meta.tags || []).forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tag-item";
    chip.textContent = tag;
    tags.appendChild(chip);
  });

  document.getElementById("postBody").innerHTML = renderMarkdown(content);
  if (window.hljs) {
    hljs.highlightAll();
  }
}

async function init() {
  const path = getPostPath();
  const markdown = await loadMarkdown(path);
  if (!markdown) return;

  const { metadata, content } = parseFrontMatter(markdown);
  renderPost(metadata, content);
}

init();
