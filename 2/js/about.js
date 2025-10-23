"use strict";
const form = document.querySelector(".form");
form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll("input, textarea");
    const data = {};
    inputs.forEach((input) => (data[input.placeholder] = input.value.trim()));
    alert(`Gracias ${data["Nombre"] || ""}, tu mensaje ha sido enviado.`);
    form.reset();
});
