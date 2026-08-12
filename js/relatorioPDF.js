/* =========================================================
   js/relatorioPDF.js
   Gerador ÚNICO do PDF de atendimento do suAIDPI.

   Este arquivo é usado tanto por:
   - historico.js
   - homeRecentes.js

   Importante:
   - NÃO altera os values internos do sistema.
   - Converte os values para textos clínicos legíveis somente no PDF.
   - NÃO imprime condutas no relatório.
========================================================= */

const NOMES_AREAS = {
  perigo: "Sinais de perigo geral",
  respiracao: "Tosse ou dificuldade de respirar",
  sibilancia: "Sibilância",
  diarreia: "Diarreia",
  febre: "Febre",
  ouvido: "Problema de ouvido",
  garganta: "Dor de garganta",
  nutricao: "Nutrição e anemia"
};


const NOMES_MARCACOES = {
  perigo: {
    convulsao: "Convulsões ou movimentos anormais",
    inconsiencia: "Inconsciência ou letargia",
    incapaz_beber: "Incapaz de beber ou mamar",
    tempo_enchimento_capilar: "Tempo de enchimento capilar maior que 2 segundos",
    gemencia: "Batimento de asa nasal e/ou gemência"
  },

  respiracao: {
    qualquer_sinal_perigo_Tosse: "Qualquer sinal geral de perigo",
    tiragem_subcostal_Tosse: "Tiragem subcostal",
    estridor_descanso: "Estridor em repouso",
    respiracao_rapida: "Respiração rápida",
    "nenhum sinal acima": "Nenhum dos sinais acima"
  },

  sibilancia: {
    letargia_demais: "Letargia ou agitação intensa",
    agitacao_normal: "Períodos de agitação normal",
    estridor: "Estridor em repouso",
    tiragem_universal: "Tiragem universal",
    tiragem_subcostal_Sibi: "Tiragem subcostal",
    fala_incompleta: "Fala frases incompletas",
    choro_curto: "Choro curto / não consegue chorar",
    choro_entrecortado: "Choro entrecortado",
    sat_low: "Saturação de O₂ menor ou igual a 90%",
    sat_mid: "Saturação de O₂ entre 91% e 95%",
    sat_high: "Saturação de O₂ maior ou igual a 95%",
    "nenhum sinal acima_sib": "Nenhum dos sinais acima"
  },

  diarreia: {
    letargica_diarr: "Letárgica ou inconsciente",
    olhos_fundos: "Olhos fundos",
    nao_bebe: "Não consegue beber ou bebe muito mal",
    prega_muito_lenta: "Sinal da prega: retorno muito lento da pele",
    inquieta: "Inquieta ou irritada",
    bebe_avido: "Bebe avidamente, com sede",
    "nenhum sinal acima_diarr": "Sem os sinais de desidratação descritos acima",
    sangue_nas_fezes: "Sangue nas fezes",
    com_desidratacao: "Com desidratação",
    sem_desidratacao: "Sem desidratação"
  },

  febre: {
    sinal_perigo_geral: "Qualquer sinal geral de perigo",
    rigidez_nuca: "Rigidez de nuca",
    petequias: "Petéquias",
    fontanela_abaulada: "Abaulamento de fontanela",
    nenhum_sinal_grave:
      "Sem sinais de malária grave ou doença febril muito grave, com teste para malária positivo",
    nenhum_sinal_negativo:
      "Sem sinais de doença febril muito grave",
    area_risco: "Área com risco de malária"
  },

  ouvido: {
    tumefacao_vermelhidao:
      "Tumefação e/ou vermelhidão dolorosa atrás da orelha",
    secrecao_menos_14:
      "Secreção purulenta no ouvido há menos de 14 dias ou otoscopia alterada",
    secrecao_14_ou_mais:
      "Secreção purulenta no ouvido há 14 dias ou mais",
    sem_dor_sem_secrecao:
      "Sem dor de ouvido e sem secreção purulenta observada",
    dor_ouvido: "Dor de ouvido"
  },

  garganta: {
    sinal_perigo_geral: "Qualquer sinal geral de perigo",
    amigdalas_membranas:
      "Amígdalas com membranas branco-acinzentadas",
    ganglios_dolorosos:
      "Gânglios cervicais aumentados e dolorosos",
    amigdalas_pontos_purulentos:
      "Amígdalas hiperemiadas com pontos purulentos ou petéquias em palato",
    vesiculas_hiperemia_resfriado:
      "Vesículas ou hiperemia da garganta associadas a sinais de resfriado comum",
    nenhum_sinal:
      "Não apresenta os sinais descritos para infecção de garganta",
    abaulamento_palato: "Abaulamento de palato"
  },

  nutricao: {
    emagrecimento_acentuado: "Emagrecimento acentuado visível",
    edema_ambos_pes: "Edema em ambos os pés",
    peso_idade_menor_menos3:
      "Peso para a idade menor que -3 escores z",
    peso_idade_menor_menos2:
      "Peso para a idade menor que -2 e maior ou igual a -3 escores z",
    tendencia_curva_descendente:
      "Tendência da curva peso/idade horizontal ou descendente",
    peso_idade_maior_mais2:
      "Peso para a idade maior que +2 escores z",
    peso_idade_entre_menos2_mais2:
      "Peso para a idade entre -2 e +2 escores z",
    palidez_palmar_grave:
      "Palidez palmar grave ou Hb abaixo de 5 g/dL",
    palidez_palmar_leve:
      "Palidez palmar leve ou Hb de 5 a 10,9 g/dL"
  }
};


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function naoInformado(valor, sufixo = "") {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return "Não informado";
  }

  return `${valor}${sufixo}`;
}


function limparTexto(texto) {
  return String(texto || "")
    .replace(/[🔴🟡🟢]/g, "")
    .replace(/\u0083/g, "")
    .replace(/Classificação:\s*/gi, "")
    .replace(/Conduta:\s*/gi, "")
    .trim();
}


function nomeMarcacao(area, valor) {
  return (
    NOMES_MARCACOES[area]?.[valor] ||
    String(valor)
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}


function obterStatus(resultado) {
  const texto = limparTexto(resultado?.badge).toUpperCase();

  if (texto.includes("EMERGÊNCIA")) {
    return {
      texto: "EMERGÊNCIA",
      fundo: [253, 232, 232],
      cor: [174, 42, 42]
    };
  }

  if (texto.includes("ATENÇÃO")) {
    return {
      texto: "ATENÇÃO",
      fundo: [255, 244, 214],
      cor: [157, 104, 15]
    };
  }

  return {
    texto: "ESTÁVEL",
    fundo: [229, 246, 237],
    cor: [31, 112, 76]
  };
}


function obterData(timestamp) {
  if (!timestamp) {
    return "Não informada";
  }

  let milissegundos = null;

  if (typeof timestamp.toMillis === "function") {
    milissegundos = timestamp.toMillis();
  } else if (typeof timestamp.seconds === "number") {
    milissegundos = timestamp.seconds * 1000;
  } else {
    const valor = new Date(timestamp).getTime();

    if (!Number.isNaN(valor)) {
      milissegundos = valor;
    }
  }

  if (!milissegundos) {
    return "Não informada";
  }

  return new Date(milissegundos).toLocaleString("pt-BR");
}


/* =========================================================
   FUNÇÃO PÚBLICA
========================================================= */

export function baixarRelatorioPDF(atendimento) {
  if (!atendimento) {
    alert("Atendimento não encontrado.");
    return;
  }

  if (!window.jspdf?.jsPDF) {
    console.error(
      "jsPDF não encontrado. Verifique se a biblioteca jsPDF foi carregada no HTML."
    );

    alert("Não foi possível carregar o gerador de PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  const PAGE_W = 210;
  const PAGE_H = 297;

  const MARGIN_X = 16;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;

  const BLUE = [53, 105, 212];
  const BLUE_DARK = [37, 79, 159];
  const TEXT = [31, 41, 55];
  const MUTED = [102, 112, 133];
  const LINE = [225, 230, 238];
  const LIGHT_BLUE = [240, 244, 255];
  const WHITE = [255, 255, 255];

  let y = 18;


  /* =========================
     DESENHO / LAYOUT
  ========================== */

  function cabecalho(primeira = false) {
    if (primeira) {
      pdf.setFillColor(...BLUE);
      pdf.rect(0, 0, PAGE_W, 24, "F");

      pdf.setTextColor(...WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);

      pdf.text(
        "suAIDPI",
        MARGIN_X,
        10
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);

      pdf.text(
        "Suporte na Atenção Integrada às Doenças Prevalentes na Infância",
        MARGIN_X,
        16
      );

      y = 34;
      return;
    }

    pdf.setDrawColor(...LINE);

    pdf.line(
      MARGIN_X,
      13,
      PAGE_W - MARGIN_X,
      13
    );

    pdf.setTextColor(...BLUE_DARK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
      "suAIDPI — Relatório de atendimento",
      MARGIN_X,
      9
    );

    y = 20;
  }


  function novaPagina() {
    pdf.addPage();
    cabecalho(false);
  }


  function garantirEspaco(altura) {
    if (y + altura > PAGE_H - 18) {
      novaPagina();
    }
  }


  function tituloRelatorio(texto) {
    garantirEspaco(18);

    pdf.setTextColor(...TEXT);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);

    pdf.text(
      texto,
      MARGIN_X,
      y
    );

    y += 8;

    pdf.setDrawColor(...BLUE);
    pdf.setLineWidth(0.8);

    pdf.line(
      MARGIN_X,
      y,
      MARGIN_X + 34,
      y
    );

    y += 8;
  }


  function tituloSecao(texto) {
    garantirEspaco(13);

    pdf.setFillColor(...LIGHT_BLUE);

    pdf.roundedRect(
      MARGIN_X,
      y,
      CONTENT_W,
      9,
      2,
      2,
      "F"
    );

    pdf.setTextColor(...BLUE_DARK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);

    pdf.text(
      texto.toUpperCase(),
      MARGIN_X + 4,
      y + 6
    );

    y += 14;
  }


  function paragrafo(texto, opcoes = {}) {
    const {
      cor = TEXT,
      tamanho = 9.5,
      negrito = false,
      recuo = 0
    } = opcoes;

    const largura =
      CONTENT_W - recuo;

    const linhas =
      pdf.splitTextToSize(
        String(texto),
        largura
      );

    garantirEspaco(
      linhas.length * 4.7 + 4
    );

    pdf.setTextColor(...cor);

    pdf.setFont(
      "helvetica",
      negrito ? "bold" : "normal"
    );

    pdf.setFontSize(tamanho);

    pdf.text(
      linhas,
      MARGIN_X + recuo,
      y
    );

    y +=
      linhas.length * 4.7 + 3;
  }


  function campo(
    rotulo,
    valor,
    x,
    largura
  ) {
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);

    pdf.text(
      rotulo.toUpperCase(),
      x,
      y
    );

    const linhas =
      pdf.splitTextToSize(
        String(valor),
        largura
      );

    pdf.setTextColor(...TEXT);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);

    pdf.text(
      linhas,
      x,
      y + 5
    );

    return linhas.length;
  }


  function linhaCampos(campos) {
    garantirEspaco(20);

    const gap = 7;

    const largura =
      (
        CONTENT_W -
        gap * (campos.length - 1)
      ) / campos.length;

    let maxLinhas = 1;

    campos.forEach(
      (item, index) => {
        const x =
          MARGIN_X +
          index * (largura + gap);

        maxLinhas = Math.max(
          maxLinhas,
          campo(
            item.rotulo,
            item.valor,
            x,
            largura
          )
        );
      }
    );

    y +=
      7 +
      maxLinhas * 4.5 +
      4;
  }


  function caixaTexto(texto) {
    const valor =
      texto || "Não informado";

    const linhas =
      pdf.splitTextToSize(
        valor,
        CONTENT_W - 10
      );

    const altura =
      Math.max(
        16,
        8 + linhas.length * 4.8
      );

    garantirEspaco(
      altura + 5
    );

    pdf.setFillColor(
      250,
      251,
      253
    );

    pdf.setDrawColor(...LINE);

    pdf.roundedRect(
      MARGIN_X,
      y,
      CONTENT_W,
      altura,
      2,
      2,
      "FD"
    );

    pdf.setTextColor(...TEXT);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);

    pdf.text(
      linhas,
      MARGIN_X + 5,
      y + 7
    );

    y += altura + 5;
  }


  function tituloArea(area) {
    garantirEspaco(10);

    pdf.setTextColor(...TEXT);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);

    pdf.text(
      NOMES_AREAS[area] || area,
      MARGIN_X,
      y
    );

    y += 6;
  }


  function lista(itens) {
    itens.forEach((item) => {
      const linhas =
        pdf.splitTextToSize(
          String(item),
          CONTENT_W - 8
        );

      garantirEspaco(
        linhas.length * 4.6 + 3
      );

      pdf.setFillColor(...BLUE);

      pdf.circle(
        MARGIN_X + 2,
        y - 1.1,
        0.7,
        "F"
      );

      pdf.setTextColor(...TEXT);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text(
        linhas,
        MARGIN_X + 6,
        y
      );

      y +=
        linhas.length * 4.6 + 2;
    });

    y += 2;
  }


  function etiquetaStatus(resultado) {
    const status =
      obterStatus(resultado);

    const largura =
      pdf.getTextWidth(
        status.texto
      ) + 10;

    pdf.setFillColor(
      ...status.fundo
    );

    pdf.roundedRect(
      MARGIN_X,
      y - 4.8,
      largura,
      7,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      ...status.cor
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(7.5);

    pdf.text(
      status.texto,
      MARGIN_X + 5,
      y
    );

    y += 7;
  }


  /* =========================
     CONTEÚDO
  ========================== */

  const paciente =
    atendimento.paciente || {};

  const exame =
    atendimento.exame || {};

  const marcacoes =
    atendimento.marcacoes || {};

  const resultados =
    atendimento.resultados || {};


  cabecalho(true);

  tituloRelatorio(
    "Relatório de Atendimento"
  );


  tituloSecao("Identificação");

  linhaCampos([
    {
      rotulo: "Data do atendimento",
      valor: obterData(
        atendimento.timestamp
      )
    },
    {
      rotulo: "Paciente",
      valor: naoInformado(
        paciente.nome
      )
    }
  ]);


  linhaCampos([
    {
      rotulo: "CPF",
      valor: naoInformado(
        paciente.cpf
      )
    },
    {
      rotulo: "Idade",
      valor: naoInformado(
        paciente.idade,
        " ano(s)"
      )
    }
  ]);


  linhaCampos([
    {
      rotulo: "Peso",
      valor: naoInformado(
        paciente.peso,
        " kg"
      )
    },
    {
      rotulo: "Estatura",
      valor: naoInformado(
        paciente.estatura,
        " cm"
      )
    }
  ]);


  tituloSecao(
    "Queixa principal"
  );

  caixaTexto(
    atendimento.principalQueixa ||
    "Não informada"
  );


  tituloSecao(
    "Dados do exame"
  );


  linhaCampos([
    {
      rotulo: "Tempo de tosse",
      valor: naoInformado(
        exame.tosseDias
      )
    },
    {
      rotulo: "Frequência respiratória",
      valor: naoInformado(
        exame.frequenciaRespiratoria,
        " irpm"
      )
    }
  ]);


  linhaCampos([
    {
      rotulo: "Saturação de O2",
      valor: naoInformado(
        exame.saturacao,
        "%"
      )
    },
    {
      rotulo: "Tempo de diarreia",
      valor: naoInformado(
        exame.diarreiaDias
      )
    }
  ]);


  linhaCampos([
    {
      rotulo: "Temperatura",
      valor: naoInformado(
        exame.temperatura,
        " °C"
      )
    }
  ]);


  tituloSecao(
    "Observações"
  );

  caixaTexto(
    exame.observacoes ||
    "Não informadas"
  );


  tituloSecao(
    "Achados registrados"
  );


  const areasMarcadas =
    Object.entries(marcacoes)
      .filter(
        ([, valores]) =>
          Array.isArray(valores) &&
          valores.length > 0
      );


  if (
    areasMarcadas.length === 0
  ) {
    paragrafo(
      "Nenhum achado clínico foi registrado.",
      {
        cor: MUTED
      }
    );
  } else {
    areasMarcadas.forEach(
      ([area, valores]) => {
        tituloArea(area);

        lista(
          valores.map(
            valor =>
              nomeMarcacao(
                area,
                valor
              )
          )
        );
      }
    );
  }


  tituloSecao(
    "Classificações"
  );


  const areasComResultado =
    Object.entries(resultados)
      .filter(
        ([, resultado]) =>
          resultado
      );


  if (
    areasComResultado.length === 0
  ) {
    paragrafo(
      "Nenhuma classificação foi registrada.",
      {
        cor: MUTED
      }
    );
  } else {
    areasComResultado.forEach(
      ([area, resultado]) => {
        garantirEspaco(28);

        tituloArea(area);

        etiquetaStatus(
          resultado
        );

        paragrafo(
          limparTexto(
            resultado.classificacao
          ) ||
          "Classificação não informada",
          {
            negrito: true,
            tamanho: 10.5
          }
        );

        /*
         * IMPORTANTE:
         * A conduta NÃO é impressa no PDF.
         * Ela pode continuar existindo no Firestore e
         * na lógica da avaliação sem aparecer no relatório.
         */

        pdf.setDrawColor(...LINE);

        pdf.line(
          MARGIN_X,
          y,
          PAGE_W - MARGIN_X,
          y
        );

        y += 7;
      }
    );
  }


  /* =========================
     RODAPÉ / PAGINAÇÃO
  ========================== */

  const totalPaginas =
    pdf.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {
    pdf.setPage(pagina);

    pdf.setDrawColor(...LINE);

    pdf.line(
      MARGIN_X,
      PAGE_H - 12,
      PAGE_W - MARGIN_X,
      PAGE_H - 12
    );

    pdf.setTextColor(...MUTED);
    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(7.5);

    pdf.text(
      `suAIDPI • Página ${pagina} de ${totalPaginas}`,
      MARGIN_X,
      PAGE_H - 7
    );

    pdf.text(
      "Documento gerado a partir dos dados registrados no atendimento.",
      PAGE_W - MARGIN_X,
      PAGE_H - 7,
      {
        align: "right"
      }
    );
  }


  /* =========================
     DOWNLOAD
  ========================== */

  const nomePaciente =
    paciente.nome ||
    "Paciente";

  const nomeArquivo =
    String(nomePaciente)
      .replace(
        /[^\p{L}\p{N}\s_-]/gu,
        ""
      )
      .trim()
      .replace(/\s+/g, "_");

  pdf.save(
    `Atendimento_${nomeArquivo || "Paciente"}.pdf`
  );
}
