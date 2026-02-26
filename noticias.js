const NEWS_ASSETS_BASE = "assets/noticias";
const TORNEO_STORAGE_KEY = "uaja_torneo";
const TORNEO_ALL_VALUE = "historico";
const NEWS_POSTS = [
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-18(1).png`,
        caption: "Bob Esponja se quería sacar una foto con su ídolo.",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-18(2).jpg`,
        caption: "Pipa lideró la derrota, eligieron la negra.",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-18(3).jpeg`,
        caption: "Un Ombú",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-18(4).jpeg`,
        caption: "Lo ultimo que ve una Oslava.",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-18(5).jpeg`,
        caption: "Genio",
      },
    ],
    title: "Al cole con el Pisto",
    text: "Olivia empanadas conoce el código secreto.",
    date: "18/02/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-07(1).jpg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-07(2).jpg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-07(3).jpg`,
        caption: ".",
      },
    ],
    title: "28 de Don Balón",
    text: "Capoooo",
    date: "07/01/2026",
    torneo: "Cumpleaños Feliz",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-01(1).jpg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-01(2).jpg`,
        caption: ".",
      },
    ],
    title: "Auxilio Mecánico",
    text: "Sin sumar en la tabla, ibo suma una moto nueva al garaje.",
    date: "01/02/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-29(1).png`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-29(2).png`,
        caption: ".",
      },
    ],
    title: "La Noche del Genio",
    text: "Con 3 empanadas y 6 lucas menos, el Genio respondió con los puntos en el bolsillo.",
    date: "29/01/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-01-14(1).png`,
        caption: ".",
      },
    ],
    title: "Comienza la Liga",
    text: "Don Balón y Ornet se llevan el MVP de la primera fecha.",
    date: "14/01/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(1).png`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(2).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(3).jpeg`,
        caption: "Un 25",
      },
    ],
    title: "¿Para que te traje matador?",
    text: "Ibo y El Matador canjearon las millas por puntos en la tabla. Primer y segundo puesto para los rescatistas de la comida.",
    date: "25/02/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(4).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(5).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(6).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(7).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(8).jpeg`,
        caption: ".",
      },
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-25(9).jpeg`,
        caption: ".",
      },
    ],
    title: "Interrupción de Servicio",
    text: "Se cortó la luz en el barrio; El Gordo cada vez mas cerca de la cama.",
    date: "25/02/2026",
    torneo: "1era Edición",
  },
  {
    media: [
      {
        type: "image",
        src: `${NEWS_ASSETS_BASE}/2026-02-11(1).jpeg`,
        caption: ".",
      },
    ],
    title: "Operación Derrumbe",
    text: "Ibo necesitó una sola mano para mandar a Cede al fondo. Mientras tanto, Guada se llevó el MVP.",
    date: "11/02/2026",
    torneo: "1era Edición",
  },
];

const newsFeed = document.getElementById("newsFeed");
const torneoSelect = document.getElementById("torneoSelect");
const mediaModal = createMediaModal();
let activeModalItems = [];
let activeModalIndex = 0;
let activeModalTitle = "";

function renderNewsFeed(posts) {
  if (!newsFeed) {
    return;
  }
  if (!posts || posts.length === 0) {
    newsFeed.innerHTML = "<p class=\"muted\">Sin noticias aún.</p>";
    return;
  }

  newsFeed.innerHTML = "";
  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "news-card";

    const mediaItems = Array.isArray(post.media) ? post.media : [];
    const media = createMediaCarousel(mediaItems, post.title);

    const content = document.createElement("div");
    content.className = "news-content";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const text = document.createElement("p");
    text.textContent = post.text;

    const meta = document.createElement("span");
    meta.className = "muted";
    meta.textContent = post.date;

    const torneo = document.createElement("span");
    torneo.className = "badge news-torneo";
    torneo.textContent = post.torneo;

    content.appendChild(torneo);
    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(meta);

    if (media) {
      card.appendChild(media);
    }
    card.appendChild(content);

    newsFeed.appendChild(card);
  });
}

function createMediaCarousel(mediaItems, title) {
  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  let currentIndex = 0;
  const wrapper = document.createElement("div");
  wrapper.className = "news-media";

  const container = document.createElement("div");
  container.className = "news-media-container";

  const renderMedia = () => {
    container.innerHTML = "";
    const item = mediaItems[currentIndex];
    if (!item) {
      return;
    }
    if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      video.controls = true;
      video.preload = "metadata";
      video.className = "news-media-item";
      container.appendChild(video);
      return;
    }
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = title || "Imagen";
    img.loading = "lazy";
    img.decoding = "async";
    img.className = "news-media-item news-media-zoomable";
    img.onerror = () => img.remove();
    img.addEventListener("click", () => {
      openMediaModal(mediaItems, currentIndex, title);
    });
    container.appendChild(img);
  };

  const controls = document.createElement("div");
  controls.className = "news-media-controls";
  const prev = document.createElement("button");
  prev.className = "news-media-btn";
  prev.textContent = "◀";
  const next = document.createElement("button");
  next.className = "news-media-btn";
  next.textContent = "▶";
  const counter = document.createElement("span");
  counter.className = "news-media-counter";

  const updateCounter = () => {
    counter.textContent = `${currentIndex + 1}/${mediaItems.length}`;
  };

  prev.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
    renderMedia();
    updateCounter();
  });

  next.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % mediaItems.length;
    renderMedia();
    updateCounter();
  });

  if (mediaItems.length > 1) {
    controls.appendChild(prev);
    controls.appendChild(counter);
    controls.appendChild(next);
  }

  wrapper.appendChild(container);
  if (mediaItems.length > 1) {
    wrapper.appendChild(controls);
  }

  renderMedia();
  updateCounter();
  return wrapper;
}

function createMediaModal() {
  const modal = document.createElement("div");
  modal.className = "media-modal";
  modal.innerHTML = `
    <div class="media-modal-content">
      <button class="media-modal-close" type="button" aria-label="Cerrar">×</button>
      <button class="media-modal-nav prev" type="button" aria-label="Anterior">◀</button>
      <div class="media-modal-body"></div>
      <button class="media-modal-nav next" type="button" aria-label="Siguiente">▶</button>
      <div class="media-modal-caption"></div>
    </div>
  `;

  const closeButton = modal.querySelector(".media-modal-close");
  const prevButton = modal.querySelector(".media-modal-nav.prev");
  const nextButton = modal.querySelector(".media-modal-nav.next");
  closeButton.addEventListener("click", () => closeMediaModal(modal));
  prevButton.addEventListener("click", () => stepModal(-1));
  nextButton.addEventListener("click", () => stepModal(1));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeMediaModal(modal);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMediaModal(modal);
    }
    if (event.key === "ArrowLeft") {
      stepModal(-1);
    }
    if (event.key === "ArrowRight") {
      stepModal(1);
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openMediaModal(items, index, title) {
  if (!mediaModal || !items || items.length === 0) {
    return;
  }
  activeModalItems = items;
  activeModalIndex = index;
  activeModalTitle = title || "";
  const item = activeModalItems[activeModalIndex];
  if (!item) {
    return;
  }
  const body = mediaModal.querySelector(".media-modal-body");
  const caption = mediaModal.querySelector(".media-modal-caption");
  if (!body || !caption) {
    return;
  }
  body.innerHTML = "";
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    video.className = "media-modal-media";
    body.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = title || "Imagen";
    img.className = "media-modal-media";
    body.appendChild(img);
  }
  caption.textContent = item.caption || activeModalTitle;
  mediaModal.classList.add("open");
  document.body.classList.add("modal-open");
  updateModalNav();
}

function stepModal(direction) {
  if (!mediaModal || !mediaModal.classList.contains("open")) {
    return;
  }
  if (!activeModalItems || activeModalItems.length <= 1) {
    return;
  }
  activeModalIndex =
    (activeModalIndex + direction + activeModalItems.length) %
    activeModalItems.length;
  const item = activeModalItems[activeModalIndex];
  const body = mediaModal.querySelector(".media-modal-body");
  if (!body || !item) {
    return;
  }
  body.innerHTML = "";
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    video.className = "media-modal-media";
    body.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.caption || activeModalTitle || "Imagen";
    img.className = "media-modal-media";
    body.appendChild(img);
  }
  const caption = mediaModal.querySelector(".media-modal-caption");
  if (caption) {
    caption.textContent = item.caption || activeModalTitle;
  }
  updateModalNav();
}

function updateModalNav() {
  if (!mediaModal) {
    return;
  }
  const prevButton = mediaModal.querySelector(".media-modal-nav.prev");
  const nextButton = mediaModal.querySelector(".media-modal-nav.next");
  if (!prevButton || !nextButton) {
    return;
  }
  const hasMultiple = activeModalItems && activeModalItems.length > 1;
  prevButton.disabled = !hasMultiple;
  nextButton.disabled = !hasMultiple;
}

function closeMediaModal(modal) {
  if (!modal || !modal.classList.contains("open")) {
    return;
  }
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
  activeModalItems = [];
  activeModalIndex = 0;
  activeModalTitle = "";
  const body = modal.querySelector(".media-modal-body");
  if (body) {
    body.innerHTML = "";
  }
}

const sortedPosts = [...NEWS_POSTS].sort((a, b) => {
  const dateA = parseDateValue(a.date);
  const dateB = parseDateValue(b.date);
  return dateB - dateA;
});

initTorneoSelector(sortedPosts);

function parseDateValue(value) {
  if (!value) {
    return 0;
  }
  const [day, month, year] = value.split("/").map((part) => Number(part));
  if (!day || !month || !year) {
    return 0;
  }
  return new Date(year, month - 1, day).getTime();
}

function getStoredTorneo() {
  return localStorage.getItem(TORNEO_STORAGE_KEY) || TORNEO_ALL_VALUE;
}

function setStoredTorneo(value) {
  localStorage.setItem(TORNEO_STORAGE_KEY, value);
}

function initTorneoSelector(posts) {
  if (!torneoSelect) {
    renderNewsFeed(posts);
    return;
  }
  const torneos = new Set();
  const validatedPosts = posts.filter((post) => {
    if (!post.torneo) {
      console.warn("Post sin torneo:", post.title || post);
      return false;
    }
    torneos.add(post.torneo);
    return true;
  });

  torneoSelect.innerHTML = "";
  const historicoOption = document.createElement("option");
  historicoOption.value = TORNEO_ALL_VALUE;
  historicoOption.textContent = "Histórico";
  torneoSelect.appendChild(historicoOption);

  Array.from(torneos)
    .sort((a, b) => a.localeCompare(b, "es"))
    .forEach((torneo) => {
      const option = document.createElement("option");
      option.value = torneo;
      option.textContent = torneo;
      torneoSelect.appendChild(option);
    });

  const applyFilter = () => {
    const activeTorneo = torneoSelect.value;
    setStoredTorneo(activeTorneo);
    const filtered = validatedPosts.filter((post) => {
      if (activeTorneo === TORNEO_ALL_VALUE) {
        return true;
      }
      return post.torneo === activeTorneo;
    });
    renderNewsFeed(filtered);
  };

  const latestTorneo = getLatestTorneoFromPosts(validatedPosts);
  const storedTorneo = getStoredTorneo();
  torneoSelect.value = latestTorneo || storedTorneo;
  if (torneoSelect.value !== storedTorneo) {
    setStoredTorneo(torneoSelect.value);
  }
  torneoSelect.addEventListener("change", applyFilter);
  applyFilter();
}

function getLatestTorneoFromPosts(posts) {
  if (!posts || posts.length === 0) {
    return "";
  }
  let latest = "";
  let latestTime = 0;
  posts.forEach((post) => {
    if (!post.torneo || !post.date) {
      return;
    }
    const time = parseDateValue(post.date);
    if (time >= latestTime) {
      latestTime = time;
      latest = post.torneo;
    }
  });
  return latest;
}
