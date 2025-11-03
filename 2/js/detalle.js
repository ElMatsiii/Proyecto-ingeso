"use strict";

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("detalleContainer");
  const loading = document.getElementById("loading");
  const cardId = localStorage.getItem("selectedCardId");

  if (!cardId) {
    container.innerHTML = `<p style="text-align:center; color:white;">No se ha seleccionado ninguna carta.</p>`;
    return;
  }

  loadCardDetail(cardId);

  // === CARGA PRINCIPAL ===
  async function loadCardDetail(id) {
    try {
      showLoading(true);
      const res = await fetch(`https://api.tcgdex.net/v2/es/cards/${id}`);
      if (!res.ok) throw new Error("No se encontró la carta");
      const card = await res.json();
      renderCardDetail(card);
      await loadRecommendedCards(id);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p style="color:red;text-align:center;">Error al cargar el detalle.</p>`;
    } finally {
      showLoading(false);
    }
  }

  function showLoading(show) {
    loading.style.display = show ? "block" : "none";
  }

  // === RENDER PRINCIPAL ===
  function renderCardDetail(card) {
    const imgUrl = buildImageUrl(card.image);

    container.innerHTML = `
      <div class="detalle-card">
        <div class="detalle-img">
          <img src="${imgUrl}" alt="${card.name}" 
               onerror="this.onerror=null; this.src='../assets/no-imagen.png';">
        </div>
        <div class="detalle-info">
          <h1>${card.name}</h1>
          <p><strong>Rareza:</strong> ${card.rarity || "Común"}</p>
          <p><strong>Tipo:</strong> ${(card.types || []).join(", ") || "—"}</p>
          <p><strong>Set:</strong> ${card.set?.name || "Desconocido"}</p>
          <p><strong>HP:</strong> ${card.hp || "—"}</p>
          <p><strong>Etapa:</strong> ${card.stage || "—"}</p>
          <p><strong>Descripción:</strong> ${card.description || "Sin descripción disponible."}</p>
          ${renderAttacks(card.attacks)}
          <div class="detalle-buttons">
            <button class="btn add-cart">Agregar al carrito</button>
            <button class="btn back-btn" onclick="window.history.back()">⬅ Volver</button>
          </div>
        </div>
      </div>

      <section class="section-related">
        <h2>Otras cartas que podrían interesarte</h2>
        <div id="relatedGrid" class="grid"></div>
      </section>
    `;

    container.querySelector(".add-cart")?.addEventListener("click", () => addToCart(card));
  }

  // === ATAQUES ===
  function renderAttacks(attacks) {
    if (!attacks || !attacks.length) return "";
    return `
      <div class="detalle-attacks">
        <h3>Ataques</h3>
        <ul>
          ${attacks
            .map(
              (atk) => `
                <li>
                  <strong>${atk.name}</strong> — ${atk.damage || ""} <br>
                  <em>${atk.effect || ""}</em>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `;
  }

  // === RECOMENDADAS ===
  async function loadRecommendedCards(excludeId) {
    try {
      const res = await fetch("https://api.tcgdex.net/v2/es/cards");
      const data = await res.json();
      const sample = takeRandom(data.filter((c) => c.id !== excludeId), 8);
      const relatedGrid = document.getElementById("relatedGrid");
      if (!relatedGrid) return;

      for (const brief of sample) {
        const detailRes = await fetch(`https://api.tcgdex.net/v2/es/cards/${brief.id}`);
        if (!detailRes.ok) continue;

        const card = await detailRes.json();
        const div = document.createElement("div");
        div.className = "card";
        const img = buildImageUrl(card.image);

        div.innerHTML = `
          <img src="${img}" alt="${card.name}" 
               onerror="this.onerror=null; this.src='../assets/no-imagen.png';">
          <div class="card-body">
            <h3>${card.name}</h3>
            <p>${card.rarity || "Común"} • ${(card.types || []).join(", ") || "Sin tipo"}</p>
            <button class="btn view-card">Ver Detalle</button>
          </div>
        `;

        div.querySelector(".view-card")?.addEventListener("click", () => goToDetail(card));
        relatedGrid.appendChild(div);
      }
    } catch (e) {
      console.warn("No se pudieron cargar cartas relacionadas:", e);
    }
  }

  // === GENERADOR DE URL DE IMAGEN ===
  function buildImageUrl(base) {
    if (!base) return "../assets/no-imagen.png";
    try {
      const localized = base.includes("/en/") ? base.replace("/en/", "/es/") : base;
      return `${localized}/high.jpg`;
    } catch {
      return "../assets/no-imagen.png";
    }
  }

  // === FUNCIONES AUXILIARES ===
  function takeRandom(arr, n) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function addToCart(card) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    carrito.push({
      id: card.id,
      nombre: card.name,
      imagen: buildImageUrl(card.image),
      precio: (Math.random() * 20 + 5).toFixed(2),
    });
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${card.name} fue agregado al carrito 🛒`);
  }

  function goToDetail(card) {
    localStorage.setItem("selectedCardId", card.id);
    window.location.href = "detalle2.html";
  }

  // === FALLBACK GLOBAL DE IMÁGENES ===
  window.addEventListener(
    "error",
    (e) => {
      const target = e.target;
      if (target.tagName === "IMG") {
        target.onerror = null;
        target.src = "../assets/no-imagen.png";
      }
    },
    true
  );
});
