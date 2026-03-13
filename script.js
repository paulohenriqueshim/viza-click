const revealElements = document.querySelectorAll('.reveal-item, .reveal');

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;

    if (elementTop < windowHeight - 80 && elementBottom > 50) {
      element.classList.add("reveal-active");
    } else {
      element.classList.remove("reveal-active");
    }
  });
}
 
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
function copiarPix(event) {
  event.preventDefault();

  const codigoPix = "COLE_AQUI_SEU_CODIGO_PIX_COPIA_E_COLA";

  navigator.clipboard.writeText(codigoPix).then(() => {
    alert("Código Pix copiado! Agora é só colar no seu banco.");
  });
}
