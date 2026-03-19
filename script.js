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

  const codigoPix = "11995945650";

  navigator.clipboard.writeText(codigoPix).then(() => {
    alert("Código Pix copiado! Agora é só colar no seu banco.");
  });
}

//salvar ctt no insta
document.querySelectorAll('.salvar-contato').forEach((btn) => {
  btn.addEventListener('click', function (event) {
    const ua = navigator.userAgent.toLowerCase();
    const isInstagram = ua.includes("instagram");

    if (isInstagram) {
      event.preventDefault();
      alert("Para salvar o contato:\n1. Toque nos 3 pontos\n2. Abrir no navegador\n3. Clique novamente 😊");
    }
  });
});