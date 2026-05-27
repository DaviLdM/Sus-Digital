document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("downloadBtn");

  if (!botao) return;

  botao.addEventListener("click", gerarPDF);
});

function gerarPDF() {
  const area = document.getElementById("area-relatorio");


  // container dos botões
  const botoes = document.querySelector(".actions");

  // esconder temporariamente
  if (botoes) {
    botoes.style.display = "none";
  }


  if (!area) {
    alert("Área do relatório não encontrada.");
    return;
  }

  const data = new Date();

  const nomeArquivo =
    `avaliacao-sus-${data.getDate()}-${data.getMonth() + 1}-${data.getFullYear()}.pdf`;

  // salva scroll atual
  const scrollAtual = window.scrollY;

  // vai pro topo antes da captura
  window.scrollTo(0, 0);

  const opcoes = {
    margin: [5, 5, 5, 5],

    filename: nomeArquivo,

    image: {
      type: "jpeg",
      quality: 0.98
    },

    html2canvas: {
      scale: 2,

      useCORS: true,

      backgroundColor: "#ffffff",

      scrollX: 0,
      scrollY: 0,

      windowWidth: document.documentElement.scrollWidth,

      windowHeight: document.documentElement.scrollHeight
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },

    pagebreak: {
      mode: ["css", "legacy"]
    }
  };

  html2pdf()
    .set(opcoes)
    .from(area)
    .save()
    .then(() => {
      // volta scroll depois
      // mostrar de novo
      if (botoes) {
        botoes.style.display = "";
      }
      window.scrollTo(0, scrollAtual);
    });
}