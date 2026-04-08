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

function copiarPix() {
  const codigoPix = "11995945650";
  const btn = document.getElementById("pixBtn");

  navigator.clipboard.writeText(codigoPix).then(() => {
    btn.textContent = "✔ Chave copiada!";
    btn.classList.add("copiado");

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy" style="margin-right:6px"></i> Pagar via Pix';
      btn.classList.remove("copiado");
    }, 2500);
  }).catch(() => {
    // fallback para navegadores mais antigos
    const el = document.createElement("textarea");
    el.value = codigoPix;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    btn.textContent = "✔ Chave copiada!";
    btn.classList.add("copiado");

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy" style="margin-right:6px"></i> Pagar via Pix';
      btn.classList.remove("copiado");
    }, 2500);
  });
}

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