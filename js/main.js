const masonry = document.getElementById("masonry");
const loadingState = document.getElementById("loadingState");
const siteTitle = document.getElementById("siteTitle");
const siteDesc = document.getElementById("siteDesc");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resetSearchButton = document.getElementById("resetSearchButton");
const searchState = document.getElementById("searchState");

let allStudents = [];

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
}

function returnToMainView() {
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  runSearch();
}

function bindSearchEvents() {
  if (!searchInput || !searchButton) {
    return;
  }

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
    renderList(allStudents);
    renderSearchState("", allStudents.length, allStudents.length);
    setReturnButtonVisible("");
    bindSearchEvents();
  } catch (error) {
    loadingState.hidden = false;
    loadingState.textContent = `${error.message}。请检查 data/students.json。`;
    if (searchState) {
      searchState.textContent = "";
    }
    setReturnButtonVisible("");
  }
}

render();
