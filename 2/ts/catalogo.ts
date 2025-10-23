//Configuración general
const POOL_SIZE = 500; // cartas detalladas a obtener
const PAGE_SIZE = 40;
const MAX_CONCURRENCY = 8;

type CardBrief = { id: string; name: string; image?: string };
type CardFull = {
  id: string;
  name: string;
  image?: string;
  rarity?: string;
  types?: string[];
  set?: { name?: string };
  category?: string;
};

window.addEventListener("DOMContentLoaded", () => {
  console.log("Catálogo cargado correctamente con filtros y detalle");

  const grid = document.getElementById("cardsGrid") as HTMLElement;
  const loading = document.getElementById("loading") as HTMLElement;
  const pagination = document.getElementById("pagination") as HTMLElement;

  const filterName = document.getElementById("filterName") as HTMLInputElement | null;
  const filterType = document.getElementById("filterType") as HTMLSelectElement | null;
  const filterSet  = document.getElementById("filterSet")  as HTMLInputElement | null;
  const btnApply   = document.getElementById("applyFilters") as HTMLButtonElement | null;
  const btnClear   = document.getElementById("clearFilters") as HTMLButtonElement | null;

  let allCards: CardFull[] = [];
  let filtered: CardFull[] = [];
  let currentPage = 1;

  init();


  //FUNCIONES PRINCIPALES
  async function init() {
    showLoading(true);
    try {
      const briefs = await fetchBriefs();
      const sample = takeRandom(briefs, POOL_SIZE);
      allCards = await fetchDetailedCards(sample);

      filtered = [...allCards];
      hydrateTypeOptions(allCards);
      renderPage(1);
      wireFilters();
    } catch (err) {
      console.error("Error:", err);
      grid.innerHTML = `<p style="color:red;">Error al cargar las cartas.</p>`;
    } finally {
      showLoading(false);
    }
  }

  // --- Obtener lista breve de cartas ---
  async function fetchBriefs(): Promise<CardBrief[]> {
    console.log("Cargando lista breve...");
    const res = await fetch("https://api.tcgdex.net/v2/es/cards");
    if (!res.ok) throw new Error("Error al obtener cartas");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // --- Obtener detalles (con types[]) ---
  async function fetchDetailedCards(briefs: CardBrief[]): Promise<CardFull[]> {
    console.log("Cargando detalles...");
    const results: CardFull[] = [];
    let index = 0;

    async function worker() {
      while (index < briefs.length) {
        const i = index++;
        const id = briefs[i].id;
        try {
          const res = await fetch(`https://api.tcgdex.net/v2/es/cards/${id}`);
          if (res.ok) {
            const card = (await res.json()) as CardFull;
            results.push(card);
          }
        } catch {}
      }
    }

    await Promise.all(Array.from({ length: MAX_CONCURRENCY }, () => worker()));
    console.log(`${results.length} cartas detalladas obtenidas`);
    return results;
  }

  // --- Renderizado de cartas ---
  function renderPage(page: number) {
    grid.innerHTML = "";
    currentPage = page;
    const start = (page - 1) * PAGE_SIZE;
    const selected = filtered.slice(start, start + PAGE_SIZE);

    if (!selected.length) {
      grid.innerHTML = `<p style="text-align:center;">No se encontraron cartas.</p>`;
      return;
    }

    selected.forEach(card => grid.appendChild(createCard(card)));
    renderPagination();
  }

  // --- Crear carta individual ---
  function createCard(card: CardFull): HTMLElement {
    const div = document.createElement("div");
    div.className = "card";
    const img = buildImageUrl(card.image);

    div.innerHTML = `
      <img src="${img}" alt="${card.name}"
           onerror="this.src='https://via.placeholder.com/245x342?text=Sin+imagen'">
      <div class="card-body">
        <h3>${card.name}</h3>
        <p>${card.rarity || "Común"} • ${(card.types || []).join(", ") || "Sin tipo"}</p>
        <p class="price"><strong>Set:</strong> ${card.set?.name || "Desconocido"}</p>
        <button class="btn view-card">Ver Detalle</button>
        <button class="btn add-cart">Agregar</button>
      </div>
    `;

    div.querySelector(".add-cart")?.addEventListener("click", () => addToCart(card));
    div.querySelector(".view-card")?.addEventListener("click", () => goToDetail(card));

    return div;
  }

  //           PAGINACIÓN
  function renderPagination() {
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    pagination.innerHTML = `
      <button class="btn" id="prevPage" ${currentPage === 1 ? "disabled" : ""}>⬅ Anterior</button>
      <span>Página ${currentPage} / ${totalPages}</span>
      <button class="btn" id="nextPage" ${currentPage >= totalPages ? "disabled" : ""}>Siguiente ➡</button>
    `;
    document.getElementById("prevPage")?.addEventListener("click", () => renderPage(currentPage - 1));
    document.getElementById("nextPage")?.addEventListener("click", () => renderPage(currentPage + 1));
  }

  //              FILTROS
  function wireFilters() {
    btnApply?.addEventListener("click", applyFilters);
    btnClear?.addEventListener("click", clearFilters);
    filterType?.addEventListener("change", applyFilters);
  }

  function applyFilters() {
    const nameVal = (filterName?.value || "").toLowerCase().trim();
    const typeRaw = (filterType?.value || "").trim();
    const setVal  = (filterSet?.value  || "").toLowerCase().trim();

    const typeValEn = typeRaw ? mapTypeToEn(typeRaw) : "";

    filtered = allCards.filter(card => {
      const matchName = !nameVal || card.name.toLowerCase().includes(nameVal);
      const matchType = !typeValEn
        ? true
        : Array.isArray(card.types) && card.types.some(t => t.toLowerCase() === typeValEn.toLowerCase());
      const matchSet = !setVal || (card.set?.name && card.set.name.toLowerCase().includes(setVal));

      return matchName && matchType && matchSet;
    });

    renderPage(1);
  }

  function clearFilters() {
    if (filterName) filterName.value = "";
    if (filterType) filterType.value = "";
    if (filterSet) filterSet.value = "";
    filtered = [...allCards];
    renderPage(1);
  }

  //UTILIDADES
  function buildImageUrl(base?: string): string {
    if (!base) return "https://via.placeholder.com/245x342?text=Sin+imagen";
    const localized = base.includes("/en/") ? base.replace("/en/", "/es/") : base;
    return `${localized}/high.jpg`;
  }

  function takeRandom<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function showLoading(show: boolean) {
    loading.style.display = show ? "block" : "none";
  }

  // --- Carrito ---
  function addToCart(card: CardFull) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    carrito.push({
      id: card.id,
      nombre: card.name,
      imagen: buildImageUrl(card.image),
      precio: (Math.random() * 20 + 5).toFixed(2),
    });
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${card.name} fue agregado al carrito`);
  }

  // --- Ir al detalle ---
  function goToDetail(card: CardFull) {
    localStorage.setItem("selectedCardId", card.id);
    window.location.href = "detalle2.html";
  }

  //      MAPEO TIPOS ES / EN
  function mapTypeToEs(type: string): string {
    const map: Record<string, string> = {
      Fire: "Fuego", Water: "Agua", Grass: "Planta", Electric: "Eléctrico",
      Psychic: "Psíquico", Darkness: "Siniestro", Fighting: "Lucha",
      Colorless: "normal", Metal: "Metal", Dragon: "Dragón", Fairy: "Hada",
    };
    return map[type] || type;
  }

  function mapTypeToEn(typeEsOEn: string): string {
    const es2en: Record<string, string> = {
      fuego: "Fire", agua: "Water", planta: "Grass", eléctrico: "Electric", electrico: "Electric",
      psíquico: "Psychic", psiquico: "Psychic", siniestro: "Darkness", lucha: "Fighting",
      normal: "Colorless", metal: "Metal", dragón: "Dragon", dragon: "Dragon", hada: "Fairy",
    };
    const lower = typeEsOEn.toLowerCase();
    return es2en[lower] || capitalize(lower);
  }

  function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function hydrateTypeOptions(cards: CardFull[]) {
    if (!filterType) return;
    const first = filterType.options[0];
    filterType.innerHTML = "";
    if (first) filterType.appendChild(first);

    const types = new Set<string>();
    cards.forEach(c => (c.types || []).forEach(t => types.add(t)));

    Array.from(types)
      .sort()
      .forEach(t => {
        const opt = document.createElement("option");
        opt.value = t; // valor en inglés (para filtrar correctamente)
        opt.textContent = mapTypeToEs(t);
        filterType.appendChild(opt);
      });
  }
});

