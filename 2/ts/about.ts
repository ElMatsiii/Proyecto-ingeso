const form = document.querySelector(".form") as HTMLFormElement;

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputs = form.querySelectorAll("input, textarea");
  const data: Record<string, string> = {};
  inputs.forEach((input: any) => (data[input.placeholder] = input.value.trim()));

  alert(`Gracias ${data["Nombre"] || ""}, tu mensaje ha sido enviado.`);
  form.reset();
});
