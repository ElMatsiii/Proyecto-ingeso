window.addEventListener("DOMContentLoaded", () => {
  console.log("Inicio cargado correctamente");

  const newCards = document.getElementById("newCards") as HTMLElement;
  const featuredCards = document.getElementById("featuredCards") as HTMLElement;
  const loading = document.getElementById("loading") as HTMLElement;

  loadHomeCards();

  async function loadHomeCards() {
    try {
      showLoading(true);

      const res = await fetch("https://api.tcgdex.net/v2/es/cards");
      if (!res.ok) throw new Error("Error al obtener cartas");
      const data = await res.json();

      const shuffled = shuffle(data);
      const newSelection = shuffled.slice(0, 7);   //  7 cartas nuevas
      const featuredSelection = shuffled.slice(7, 14); //  1 grande + 6 pequeñas

      renderNewCards(newSelection, newCards);
      renderFeatured(featuredSelection, featuredCards);
    } catch (err) {
      console.error("Error al cargar cartas:", err);
      newCards.innerHTML = `<p style="color:red;">No se pudieron cargar las cartas.</p>`;
    } finally {
      showLoading(false);
    }
  }

  function renderNewCards(cards: any[], container: HTMLElement) {
    container.innerHTML = "";
    cards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      const img = buildImageUrl(card.image);
      div.innerHTML = `
        <img src="${img}" alt="${card.name}" 
             onerror="this.src='https://via.placeholder.com/245x342?text=Sin+imagen'">
        <div class="card-body">
          <h3>${card.name}</h3>
          <p><strong>Set:</strong> ${card.set?.name || "Desconocido"}</p>
          <button class="btn view-card">Ver Detalle</button>
        </div>
      `;
      div.querySelector(".view-card")?.addEventListener("click", () => goToDetail(card));
      container.appendChild(div);
    });
  }

  function renderFeatured(cards: any[], container: HTMLElement) {
    if (cards.length < 7) return;

    const [main, ...others] = cards;
    const mainImg = buildImageUrl(main.image);

    container.innerHTML = `
      <div class="featured-main">
        <img src="${mainImg}" alt="${main.name}">
        <div class="card-body">
          <h3>${main.name}</h3>
          <p><strong>Set:</strong> ${main.set?.name || "Desconocido"}</p>
          <button class="btn view-card" data-id="${main.id}">Ver Detalle</button>
        </div>
      </div>
      <div class="featured-side">
        ${others.map(card => `
          <div class="featured-mini">
            <img src="${buildImageUrl(card.image)}" alt="${card.name}">
            <p>${card.name}</p>
            <button class="btn-mini view-card" data-id="${card.id}">Ver</button>
          </div>
        `).join("")}
      </div>
    `;

    container.querySelectorAll(".view-card").forEach(btn => {
      btn.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.getAttribute("data-id") || main.id;
        localStorage.setItem("selectedCardId", id);
        window.location.href = "detalle2.html";
      });
    });
  }

  function buildImageUrl(base?: string): string {
    if (!base) return "https://via.placeholder.com/245x342?text=Sin+imagen";
    const localized = base.includes("/en/") ? base.replace("/en/", "/es/") : base;
    return `${localized}/high.jpg`;
  }

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showLoading(show: boolean) {
    loading.style.display = show ? "block" : "none";
  }

  function goToDetail(card: any) {
    localStorage.setItem("selectedCardId", card.id);
    window.location.href = "detalle2.html";
  }
});

