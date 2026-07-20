const manifestPath = "posts/posts.json";
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function createTagChip(tag, activeTags) {
  const chip = document.createElement("button");
  chip.type = "button";
  const isActive = tag === "全部" ? activeTags.length === 0 : activeTags.includes(tag);
  chip.className = `tag-item tag-chip ${isActive ? " active" : ""}`;
  chip.textContent = tag;
  chip.dataset.tag = tag;
  return chip;
}

function renderArticleCard(post) {
  const card = document.createElement("article");
  card.className = "article-card";
  card.innerHTML = `
    <a class="article-link" href="index.html?post=${encodeURIComponent(post.slug)}">
      <div class="article-card-content">
        <div class="article-card-header">
          <h2>${post.title}</h2>
          <span class="article-date">${formatDate(post.published)}</span>
        </div>
        <p class="article-excerpt">${post.subtitle || "沒有摘要"}</p>
        <div class="article-meta-row">
          <span>${post.tags?.length ? post.tags.join(" ・ ") : "無標籤"}</span>
          <span>${post.updated ? `更新 ${formatDate(post.updated)}` : ""}</span>
        </div>
      </div>
    </a>
  `;
  return card;
}

function filterPosts(posts, search, selectedTags) {
  return posts
    .filter((post) => {
      const query = search.toLowerCase().trim();
      const text = [post.title, post.subtitle, ...(post.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchText = query ? text.includes(query) : true;
      const matchTag = selectedTags.length
        ? (post.tags || []).includes(selectedTags[0])
        : true;
      return matchText && matchTag;
    });
}

function renderFilterTags(posts, selectedTags) {
  const allTags = [...new Set(posts.flatMap((post) => post.tags || []))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  const filterContainer = document.getElementById("tagFilter");
  filterContainer.innerHTML = "";

  const allChip = createTagChip("全部", selectedTags);
  allChip.addEventListener("click", () => {
    currentTags = [];
    updateList(posts, document.getElementById("searchInput").value, currentTags);
  });
  filterContainer.appendChild(allChip);

  allTags.forEach((tag) => {
    const chip = createTagChip(tag, selectedTags);
    chip.addEventListener("click", () => {
      if (currentTags.includes(tag)) {
        currentTags = [];
      } else {
        currentTags = [tag];
      }
      updateList(posts, document.getElementById("searchInput").value, currentTags);
    });
    filterContainer.appendChild(chip);
  });
}

function updateList(allPosts, search, selectedTags) {
  const sortOrder = document.getElementById("sortOrder").value;
  const filtered = filterPosts(allPosts, search, selectedTags).sort((a, b) => {
    const aTime = new Date(a.published).getTime();
    const bTime = new Date(b.published).getTime();
    return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
  });

  const list = document.getElementById("articleList");
  list.innerHTML = "";

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">找不到符合的文章。</div>`;
    renderFilterTags(allPosts, selectedTags);
    return;
  }

  filtered.forEach((post) => list.appendChild(renderArticleCard(post)));
  renderFilterTags(allPosts, selectedTags);
}

let currentTags = [];

async function init() {
  try {
    const response = await fetch(manifestPath);
    if (!response.ok) throw new Error("無法載入文章清單");
    const posts = await response.json();
    const searchInput = document.getElementById("searchInput");
    const sortOrder = document.getElementById("sortOrder");

    searchInput.addEventListener("input", () => updateList(posts, searchInput.value, currentTags));
    sortOrder.addEventListener("change", () => updateList(posts, searchInput.value, currentTags));

    updateList(posts, "", []);
  } catch (error) {
    document.getElementById("articleList").innerHTML = `<div class="empty-state">無法載入文章清單。</div>`;
    console.error(error);
  }
}

init();
