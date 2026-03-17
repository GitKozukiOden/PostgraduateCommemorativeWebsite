const masonry = document.getElementById("masonry");
const loadingState = document.getElementById("loadingState");
const siteTitle = document.getElementById("siteTitle");
const siteDesc = document.getElementById("siteDesc");

async function loadData() {
  const response = await fetch("data/students.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("人物数据加载失败");
  }
  return response.json();
}

function createCard(student, index) {
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
  card.append(image, content);

  return card;
}

async function render() {
  try {
    const data = await loadData();
    const students = data.students || [];

    if (data.site?.title) {
      siteTitle.textContent = data.site.title;
    }
    if (data.site?.description) {
      siteDesc.textContent = data.site.description;
    }

    if (!students.length) {
      loadingState.textContent = "目前还没有公开的人物资料。";
      return;
    }

    const fragment = document.createDocumentFragment();
    students.forEach((student, idx) => {
      fragment.append(createCard(student, idx));
    });
    masonry.append(fragment);
    loadingState.hidden = true;
  } catch (error) {
    loadingState.textContent = `${error.message}。请检查 data/students.json。`;
  }
}

render();
