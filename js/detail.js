const detailCard = document.getElementById("detailCard");
const detailState = document.getElementById("detailState");
const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailYears = document.getElementById("detailYears");
const detailSummary = document.getElementById("detailSummary");
const detailStory = document.getElementById("detailStory");
const giscusContainer = document.getElementById("giscusContainer");

function getStudentId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadData() {
  const response = await fetch("data/students.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("详情数据加载失败");
  }
  return response.json();
}

function renderStory(storyList) {
  detailStory.innerHTML = "";
  storyList.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    detailStory.append(p);
  });
}

function injectGiscus(term) {
  const giscusConfig = {
    repo: "YOUR_GITHUB_USERNAME/YOUR_REPO",
    repoId: "YOUR_REPO_ID",
    category: "General",
    categoryId: "YOUR_CATEGORY_ID",
    mapping: "specific",
    term,
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "top",
    theme: "light",
    lang: "zh-CN",
    crossorigin: "anonymous",
  };

  const missingConfig =
    giscusConfig.repo.includes("YOUR_") ||
    giscusConfig.repoId.includes("YOUR_") ||
    giscusConfig.categoryId.includes("YOUR_");

  if (missingConfig) {
    giscusContainer.innerHTML =
      '<p class="giscus-missing">评论未启用：请先在 js/detail.js 中填写 Giscus 配置（repo、repoId、categoryId）。</p>';
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.setAttribute("data-repo", giscusConfig.repo);
  script.setAttribute("data-repo-id", giscusConfig.repoId);
  script.setAttribute("data-category", giscusConfig.category);
  script.setAttribute("data-category-id", giscusConfig.categoryId);
  script.setAttribute("data-mapping", giscusConfig.mapping);
  script.setAttribute("data-term", giscusConfig.term);
  script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
  script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
  script.setAttribute("data-input-position", giscusConfig.inputPosition);
  script.setAttribute("data-theme", giscusConfig.theme);
  script.setAttribute("data-lang", giscusConfig.lang);
  script.setAttribute("crossorigin", giscusConfig.crossorigin);
  giscusContainer.append(script);
}

async function render() {
  const id = getStudentId();
  if (!id) {
    detailState.textContent = "缺少人物 ID。请从首页进入。";
    return;
  }

  try {
    const data = await loadData();
    const students = data.students || [];
    const student = students.find((item) => item.id === id);

    if (!student) {
      detailState.textContent = "没有找到该人物资料。";
      return;
    }

    document.title = `${student.name} | 人物详情`;
    detailImage.src = student.photo;
    detailImage.alt = `${student.name} 的纪念照片`;
    detailName.textContent = student.name;
    detailYears.textContent = `${student.birthYear || "?"} - ${student.leaveYear || "?"}`;
    detailSummary.textContent = student.summary || "";
    renderStory(student.story || []);

    detailCard.hidden = false;
    detailState.hidden = true;

    injectGiscus(`student-${student.id}`);
  } catch (error) {
    detailState.textContent = `${error.message}。请检查 data/students.json。`;
  }
}

render();
