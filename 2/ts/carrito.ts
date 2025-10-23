window.addEventListener("DOMContentLoaded", () => {
  console.log("carrito2.js cargado correctamente");

  const container = document.getElementById("cartItems") as HTMLElement;
  const totalContainer = document.getElementById("totalPrice") as HTMLElement;

  if (!container || !totalContainer) {
    console.error("No se encontraron los elementos HTML necesarios.");
    return;
  }

  function loadCart() {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

    if (carrito.length === 0) {
      container.innerHTML = `<p>Tu carrito está vacío.</p>`;
      totalContainer.innerText = "$0.00";
      return;
    }

    container.innerHTML = carrito
      .map(
        (c: any, index: number) => `
      <div class="cart-item">
        <img src="${c.imagen}" alt="${c.nombre}">
        <div>
          <h3>${c.nombre}</h3>
          <p>Precio: $${c.precio}</p>
          <button class="btn remove" data-index="${index}">Borrar</button>
        </div>
      </div>
    `
      )
      .join("");

    const total = carrito.reduce(
      (acc: number, item: any) => acc + parseFloat(item.precio),
      0
    );

    totalContainer.innerText = `$${total.toFixed(2)}`;

    // Botones de eliminar
    container.querySelectorAll(".remove").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const index = (e.target as HTMLElement).getAttribute("data-index");
        if (index) removeItem(parseInt(index));
      })
    );
  }

  function removeItem(index: number) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    loadCart();
  }

  loadCart();
});
