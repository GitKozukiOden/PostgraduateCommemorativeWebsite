const masonry = document.getElementById("masonry");
const loadingState = document.getElementById("loadingState");
const siteTitle = document.getElementById("siteTitle");
const siteDesc = document.getElementById("siteDesc");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resetSearchButton = document.getElementById("resetSearchButton");
const searchState = document.getElementById("searchState");
const cardViewButton = document.getElementById("cardViewButton");
const listViewButton = document.getElementById("listViewButton");

const VIEW_MODE_KEY = "memorial_home_view_mode";
const SEARCH_KEY = "memorial_home_search";
const RESTORE_SCROLL_KEY = "memorial_home_restore_scroll";
const SCROLL_Y_KEY = "memorial_home_scroll_y";

let allStudents = [];
let currentViewMode = "card";
let hasBoundSearchEvents = false;
let hasBoundViewEvents = false;

async function loadData() {
  const response = await fetch("data/students.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("人物数据加载失败");
  }
  return response.json();
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function readSession(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (_) {
    // Ignore quota or privacy-mode errors.
  }
}

function removeSession(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (_) {
    // Ignore storage errors.
  }
}

function buildSearchBlob(student) {
  const storyText = Array.isArray(student.story) ? student.story.join(" ") : "";
  return normalizeText([student.name, student.summary, storyText].join(" "));
}

function pickMatchedSnippet(student, normalizedKeyword) {
  if (!normalizedKeyword) {
    return "";
  }

  if (Array.isArray(student.story)) {
    const matchedStory = student.story.find((paragraph) =>
      normalizeText(paragraph).includes(normalizedKeyword),
    );
    if (matchedStory) {
      const plainStory = String(matchedStory).trim();
      return plainStory.length > 58 ? `${plainStory.slice(0, 58)}...` : plainStory;
    }
  }

  if (normalizeText(student.summary).includes(normalizedKeyword)) {
    const plainSummary = String(student.summary || "").trim();
    return plainSummary.length > 58 ? `${plainSummary.slice(0, 58)}...` : plainSummary;
  }

  return "";
}

function createCard(student, index, normalizedKeyword = "") {
  const card = document.createElement("a");
  card.className = "memory-card";
  card.href = `detail.html?id=${encodeURIComponent(student.id)}`;
  card.style.animationDelay = `${index * 0.08}s`;

  const image = document.createElement("img");
  image.src = student.photo;
  image.alt = `${student.name} 的纪念照片`;
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "memory-card-content";

  const name = document.createElement("h2");
  name.textContent = student.name;

  const summary = document.createElement("p");
  summary.textContent = student.summary;

  content.append(name, summary);

  const matchedSnippet = pickMatchedSnippet(student, normalizedKeyword);
  if (matchedSnippet) {
    const hit = document.createElement("p");
    hit.className = "search-hit";
    hit.textContent = `相关经历：${matchedSnippet}`;
    content.append(hit);
  }

  card.append(image, content);
  return card;
}

function renderList(
  students,
  { normalizedKeyword = "", displayKeyword = "" } = {},
) {
  masonry.innerHTML = "";

  if (!students.length) {
    loadingState.hidden = false;
    loadingState.textContent = displayKeyword
      ? `未找到与“${displayKeyword}”相关的人名或经历。`
      : "目前还没有公开的人物资料。";
    return;
  }

  const fragment = document.createDocumentFragment();
  students.forEach((student, idx) => {
    fragment.append(createCard(student, idx, normalizedKeyword));
  });
  masonry.append(fragment);
  loadingState.hidden = true;
}

function setViewMode(mode, { persist = true } = {}) {
  currentViewMode = mode === "list" ? "list" : "card";
  masonry.classList.toggle("masonry-list", currentViewMode === "list");

  if (cardViewButton) {
    const isCard = currentViewMode === "card";
    cardViewButton.classList.toggle("is-active", isCard);
    cardViewButton.setAttribute("aria-pressed", String(isCard));
  }
  if (listViewButton) {
    const isList = currentViewMode === "list";
    listViewButton.classList.toggle("is-active", isList);
    listViewButton.setAttribute("aria-pressed", String(isList));
  }

  if (persist) {
    writeSession(VIEW_MODE_KEY, currentViewMode);
  }
}

function saveScrollForBackNavigation() {
  writeSession(SCROLL_Y_KEY, String(window.scrollY));
  writeSession(RESTORE_SCROLL_KEY, "1");
  writeSession(VIEW_MODE_KEY, currentViewMode);
  writeSession(SEARCH_KEY, String(searchInput?.value || "").trim());
}

function restoreScrollPositionIfNeeded() {
  const shouldRestore = readSession(RESTORE_SCROLL_KEY) === "1";
  if (!shouldRestore) {
    return;
  }

  const raw = readSession(SCROLL_Y_KEY);
  const y = Number(raw);
  removeSession(RESTORE_SCROLL_KEY);
  removeSession(SCROLL_Y_KEY);

  if (!Number.isFinite(y) || y < 0) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
    });
  });
}

function renderSearchState(displayKeyword, resultCount, totalCount) {
  if (!searchState) {
    return;
  }

  if (!displayKeyword) {
    searchState.textContent = `当前共 ${totalCount} 位人物`;
    return;
  }

  if (!resultCount) {
    searchState.textContent = `没有匹配“${displayKeyword}”的人名或经历`;
    return;
  }

  searchState.textContent = `找到 ${resultCount} 位与“${displayKeyword}”相关的人物`;
}

function setReturnButtonVisible(displayKeyword) {
  if (!resetSearchButton) {
    return;
  }
  resetSearchButton.hidden = !displayKeyword;
}

function runSearch() {
  const displayKeyword = String(searchInput?.value || "").trim();
  const normalizedKeyword = normalizeText(displayKeyword);
  const result = normalizedKeyword
    ? allStudents.filter((student) =>
        buildSearchBlob(student).includes(normalizedKeyword),
      )
    : allStudents;

  renderList(result, { normalizedKeyword, displayKeyword });
  renderSearchState(displayKeyword, result.length, allStudents.length);
  setReturnButtonVisible(displayKeyword);
  writeSession(SEARCH_KEY, displayKeyword);
  writeSession(VIEW_MODE_KEY, currentViewMode);
}

function returnToMainView() {
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  runSearch();
}

function bindSearchEvents() {
  if (!searchInput || !searchButton || hasBoundSearchEvents) {
    return;
  }
  hasBoundSearchEvents = true;

  searchButton.addEventListener("click", runSearch);

  if (resetSearchButton) {
    resetSearchButton.addEventListener("click", returnToMainView);
  }

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });

  searchInput.addEventListener("input", () => {
    if (!searchInput.value.trim()) {
      runSearch();
    }
  });

  masonry.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const card = target.closest("a.memory-card");
    if (card) {
      saveScrollForBackNavigation();
    }
  });
}

function bindViewEvents() {
  if (hasBoundViewEvents) {
    return;
  }
  hasBoundViewEvents = true;

  if (cardViewButton) {
    cardViewButton.addEventListener("click", () => {
      setViewMode("card");
      runSearch();
    });
  }

  if (listViewButton) {
    listViewButton.addEventListener("click", () => {
      setViewMode("list");
      runSearch();
    });
  }
}

async function render() {
  try {
    const data = await loadData();
    const students = Array.isArray(data.students) ? data.students : [];

    if (data.site?.title) {
      siteTitle.textContent = data.site.title;
    }
    if (data.site?.description) {
      siteDesc.textContent = data.site.description;
    }

    allStudents = students;
    bindSearchEvents();
    bindViewEvents();

    const savedKeyword = readSession(SEARCH_KEY) || "";
    if (searchInput) {
      searchInput.value = savedKeyword;
    }

    const savedMode = readSession(VIEW_MODE_KEY) || "card";
    setViewMode(savedMode, { persist: false });
    runSearch();
    restoreScrollPositionIfNeeded();
  } catch (error) {
    loadingState.hidden = false;
    loadingState.textContent = `${error.message}。请检查 data/students.json。`;
    if (searchState) {
      searchState.textContent = "";
    }
    setReturnButtonVisible("");
  }
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    removeSession(RESTORE_SCROLL_KEY);
    removeSession(SCROLL_Y_KEY);
  }
});

render();
