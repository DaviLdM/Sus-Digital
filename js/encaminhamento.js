/* =========================================================
   js/encaminhamento.js
   Seleciona um atendimento salvo, preenche o encaminhamento
   e gera o documento em PDF.
========================================================= */

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


/* =========================================================
   NOMES LEGÍVEIS DOS ACHADOS
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
    nenhum_sinal_grave: "Sem sinais de malária grave ou doença febril muito grave",
    nenhum_sinal_negativo: "Sem sinais de doença febril muito grave",
    area_risco: "Área com risco de malária"
  },

  ouvido: {
    tumefacao_vermelhidao: "Tumefação e/ou vermelhidão dolorosa atrás da orelha",
    secrecao_menos_14: "Secreção purulenta no ouvido há menos de 14 dias",
    secrecao_14_ou_mais: "Secreção purulenta no ouvido há 14 dias ou mais",
    sem_dor_sem_secrecao: "Sem dor de ouvido e sem secreção purulenta observada",
    dor_ouvido: "Dor de ouvido"
  },

  garganta: {
    sinal_perigo_geral: "Qualquer sinal geral de perigo",
    amigdalas_membranas: "Amígdalas com membranas branco-acinzentadas",
    ganglios_dolorosos: "Gânglios cervicais aumentados e dolorosos",
    amigdalas_pontos_purulentos:
      "Amígdalas hiperemiadas com pontos purulentos ou petéquias em palato",
    vesiculas_hiperemia_resfriado:
      "Vesículas ou hiperemia da garganta associadas a sinais de resfriado comum",
    nenhum_sinal: "Não apresenta os sinais descritos para infecção de garganta",
    abaulamento_palato: "Abaulamento de palato"
  },

  nutricao: {
    emagrecimento_acentuado: "Emagrecimento acentuado visível",
    edema_ambos_pes: "Edema em ambos os pés",
    peso_idade_menor_menos3: "Peso para a idade menor que -3 escores z",
    peso_idade_menor_menos2:
      "Peso para a idade menor que -2 e maior ou igual a -3 escores z",
    tendencia_curva_descendente:
      "Tendência da curva peso/idade horizontal ou descendente",
    peso_idade_maior_mais2: "Peso para a idade maior que +2 escores z",
    peso_idade_entre_menos2_mais2:
      "Peso para a idade entre -2 e +2 escores z",
    palidez_palmar_grave: "Palidez palmar grave",
    palidez_palmar_leve: "Palidez palmar leve"
  }

};


/* =========================================================
   ELEMENTOS
========================================================= */

const atendimentoSelect =
  document.getElementById("atendimentoSelect");

const carregarAtendimentoBtn =
  document.getElementById("carregarAtendimentoBtn");

const selectorMessage =
  document.getElementById("selectorMessage");

const documentStatus =
  document.getElementById("documentStatus");

const form =
  document.getElementById("encaminhamentoForm");

const restaurarBtn =
  document.getElementById("restaurarBtn");

const formMessage =
  document.getElementById("formMessage");


const campos = {
  data:
    document.getElementById("dataEncaminhamento"),

  nome:
    document.getElementById("pacienteNome"),

  idade:
    document.getElementById("pacienteIdade"),

  nascimento:
    document.getElementById("pacienteNascimento"),

  cpf:
    document.getElementById("pacienteCpf"),

  acompanhante:
    document.getElementById("acompanhante"),

  unidade:
    document.getElementById("unidadeAtendimento"),

  hospital:
    document.getElementById("hospitalDestino"),

  queixa:
    document.getElementById("queixaPrincipal"),

  sinais:
    document.getElementById("sinaisSintomas"),

  classificacoes:
    document.getElementById("classificacoes"),

  condutas:
    document.getElementById("condutas")
};


/* =========================================================
   ESTADO
========================================================= */

let usuarioAtual = null;

let perfilAtual = null;

let atendimentos = [];

let dadosOriginais = null;


/* =========================================================
   AUXILIARES
========================================================= */

function mostrarMensagem(texto, tipo = "") {

  if (!formMessage) return;

  formMessage.textContent =
    texto || "";

  formMessage.className =
    "form-message";

  if (texto && tipo) {
    formMessage.classList.add(tipo);
  }

}


function obterMilissegundos(timestamp) {

  if (!timestamp) {
    return 0;
  }

  if (
    typeof timestamp.toMillis ===
    "function"
  ) {
    return timestamp.toMillis();
  }

  if (
    typeof timestamp.seconds ===
    "number"
  ) {
    return timestamp.seconds * 1000;
  }

  const valor =
    new Date(timestamp).getTime();

  return Number.isNaN(valor)
    ? 0
    : valor;
}


function formatarDataInput(timestamp) {

  const milissegundos =
    obterMilissegundos(timestamp);

  const data =
    milissegundos
      ? new Date(milissegundos)
      : new Date();

  const ano =
    data.getFullYear();

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


function formatarDataBr(dataIso) {

  if (!dataIso) {
    return "____/____/________";
  }

  const [ano, mes, dia] =
    dataIso.split("-");

  if (!ano || !mes || !dia) {
    return dataIso;
  }

  return `${dia}/${mes}/${ano}`;
}


function limparClassificacao(texto) {

  return String(texto || "")
    .replace(/Classificação:\s*/gi, "")
    .trim();
}


function limparConduta(texto) {

  return String(texto || "")
    .replace(/Conduta:\s*/gi, "")
    .replace(/\u0083/g, "")
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


function montarSinais(atendimento) {

  const marcacoes =
    atendimento.marcacoes || {};

  const blocos = [];

  Object.entries(marcacoes)
    .forEach(
      ([area, valores]) => {

        if (
          !Array.isArray(valores) ||
          valores.length === 0
        ) {
          return;
        }

        const nomeArea =
          NOMES_AREAS[area] ||
          area;

        const itens =
          valores.map(
            valor =>
              nomeMarcacao(
                area,
                valor
              )
          );

        blocos.push(
          `${nomeArea}:\n- ${itens.join("\n- ")}`
        );

      }
    );


  const exame =
    atendimento.exame || {};


  const medidas = [];


  if (
    exame.frequenciaRespiratoria
  ) {
    medidas.push(
      `Frequência respiratória: ${exame.frequenciaRespiratoria} irpm`
    );
  }


  if (
    exame.saturacao
  ) {
    medidas.push(
      `Saturação de O₂: ${exame.saturacao}%`
    );
  }


  if (
    exame.temperatura
  ) {
    medidas.push(
      `Temperatura: ${exame.temperatura} °C`
    );
  }


  if (
    medidas.length > 0
  ) {
    blocos.unshift(
      `Dados do exame:\n- ${medidas.join("\n- ")}`
    );
  }


  return blocos.join("\n\n");
}


function montarClassificacoes(atendimento) {

  return Object.values(
    atendimento.resultados || {}
  )
    .filter(Boolean)
    .map(
      resultado =>
        limparClassificacao(
          resultado.classificacao
        )
    )
    .filter(Boolean)
    .join("\n");
}


function montarCondutas(atendimento) {

  return Object.values(
    atendimento.resultados || {}
  )
    .filter(Boolean)
    .map(
      resultado =>
        limparConduta(
          resultado.conduta
        )
    )
    .filter(Boolean)
    .join("\n\n");
}


function preencherCampos(dados) {

  campos.data.value =
    dados.data || "";

  campos.nome.value =
    dados.nome || "";

  campos.idade.value =
    dados.idade || "";

  campos.nascimento.value =
    dados.nascimento || "";

  campos.cpf.value =
    dados.cpf || "";

  campos.acompanhante.value =
    dados.acompanhante || "";

  campos.unidade.value =
    dados.unidade || "";

  campos.hospital.value =
    dados.hospital || "";

  campos.queixa.value =
    dados.queixa || "";

  campos.sinais.value =
    dados.sinais || "";

  campos.classificacoes.value =
    dados.classificacoes || "";

  campos.condutas.value =
    dados.condutas || "";

}


function obterDadosFormulario() {

  return {
    data:
      campos.data.value,

    nome:
      campos.nome.value.trim(),

    idade:
      campos.idade.value.trim(),

    nascimento:
      campos.nascimento.value,

    cpf:
      campos.cpf.value.trim(),

    acompanhante:
      campos.acompanhante.value.trim(),

    unidade:
      campos.unidade.value.trim(),

    hospital:
      campos.hospital.value.trim(),

    queixa:
      campos.queixa.value.trim(),

    sinais:
      campos.sinais.value.trim(),

    classificacoes:
      campos.classificacoes.value.trim(),

    condutas:
      campos.condutas.value.trim()
  };

}


/* =========================================================
   CARREGAR PERFIL
========================================================= */

async function carregarPerfil(usuario) {

  const referencia =
    doc(
      db,
      "usuarios",
      usuario.uid
    );

  const snapshot =
    await getDoc(
      referencia
    );

  if (!snapshot.exists()) {
    return {};
  }

  return snapshot.data();
}


/* =========================================================
   CARREGAR ATENDIMENTOS
========================================================= */

async function carregarListaAtendimentos(
  usuario
) {

  const consulta =
    query(
      collection(
        db,
        "historico"
      ),
      where(
        "uidMedico",
        "==",
        usuario.uid
      )
    );


  const snapshot =
    await getDocs(
      consulta
    );


  atendimentos =
    snapshot.docs
      .map(
        documento => ({
          id:
            documento.id,

          ...documento.data()
        })
      )
      .sort(
        (a, b) =>
          obterMilissegundos(
            b.timestamp
          ) -
          obterMilissegundos(
            a.timestamp
          )
      );


  atendimentoSelect.innerHTML =
    "";


  if (
    atendimentos.length === 0
  ) {

    atendimentoSelect.innerHTML =
      `
        <option value="">
          Nenhum atendimento encontrado
        </option>
      `;

    carregarAtendimentoBtn.disabled =
      true;

    selectorMessage.textContent =
      "Salve um atendimento antes de gerar um encaminhamento.";

    return;
  }


  atendimentoSelect.innerHTML =
    `
      <option value="">
        Selecione um atendimento
      </option>
    `;


  atendimentos.forEach(
    atendimento => {

      const option =
        document.createElement(
          "option"
        );


      const data =
        obterMilissegundos(
          atendimento.timestamp
        )
          ? new Date(
              obterMilissegundos(
                atendimento.timestamp
              )
            ).toLocaleDateString(
              "pt-BR"
            )
          : "Sem data";


      const nome =
        atendimento.paciente
          ?.nome ||
        "Paciente sem nome";


      option.value =
        atendimento.id;


      option.textContent =
        `${nome} — ${data}`;


      atendimentoSelect.appendChild(
        option
      );

    }
  );


  /*
   * Se a página tiver sido aberta como:
   * encaminhamento.html?id=ID_DO_ATENDIMENTO
   * selecionamos automaticamente esse atendimento.
   */
  const parametros =
    new URLSearchParams(
      window.location.search
    );


  const idUrl =
    parametros.get("id");


  if (
    idUrl &&
    atendimentos.some(
      atendimento =>
        atendimento.id === idUrl
    )
  ) {

    atendimentoSelect.value =
      idUrl;

    carregarAtendimento(
      idUrl
    );

  }

}


/* =========================================================
   PREENCHER PELO ATENDIMENTO
========================================================= */

function carregarAtendimento(id) {

  const atendimento =
    atendimentos.find(
      item =>
        item.id === id
    );


  if (!atendimento) {

    selectorMessage.textContent =
      "Selecione um atendimento válido.";

    return;
  }


  const paciente =
    atendimento.paciente || {};


  dadosOriginais = {

    data:
      formatarDataInput(
        atendimento.timestamp
      ),

    nome:
      paciente.nome ||
      "",

    idade:
      paciente.idade ||
      "",

    /*
     * Esses campos só serão automáticos quando
     * também estiverem sendo salvos na consulta.
     * Para consultas antigas ficam editáveis.
     */
    nascimento:
      paciente.dataNascimento ||
      paciente.nascimento ||
      "",

    cpf:
      paciente.cpf ||
      "",

    acompanhante:
      paciente.acompanhante ||
      "",

    unidade:
      perfilAtual?.ubs ||
      "",

    hospital:
      perfilAtual
        ?.hospitalReferencia ||
      "",

    queixa:
      atendimento.principalQueixa ||
      "",

    sinais:
      montarSinais(
        atendimento
      ),

    classificacoes:
      montarClassificacoes(
        atendimento
      ),

    condutas:
      montarCondutas(
        atendimento
      )

  };


  preencherCampos(
    dadosOriginais
  );


  documentStatus.textContent =
    "Dados carregados";


  documentStatus.classList.add(
    "loaded"
  );


  selectorMessage.textContent =
    "Atendimento carregado. Revise ou complemente os dados antes de gerar o PDF.";


  mostrarMensagem(
    "",
    ""
  );

}


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
  auth,
  async (usuario) => {

    if (!usuario) {

      window.location.href =
        "login.html";

      return;
    }


    usuarioAtual =
      usuario;


    try {

      perfilAtual =
        await carregarPerfil(
          usuario
        );


      await carregarListaAtendimentos(
        usuario
      );


      /*
       * Data atual como padrão antes de selecionar.
       */
      if (
        !campos.data.value
      ) {
        campos.data.value =
          formatarDataInput(
            new Date()
          );
      }

    } catch (erro) {

      console.error(
        "Erro ao carregar encaminhamento:",
        erro
      );


      selectorMessage.textContent =
        "Não foi possível carregar os atendimentos.";

    }

  }
);


/* =========================================================
   EVENTOS
========================================================= */

carregarAtendimentoBtn
  ?.addEventListener(
    "click",
    () => {

      const id =
        atendimentoSelect.value;


      if (!id) {

        selectorMessage.textContent =
          "Selecione um atendimento.";

        return;
      }


      carregarAtendimento(
        id
      );

    }
  );


restaurarBtn
  ?.addEventListener(
    "click",
    () => {

      if (!dadosOriginais) {

        mostrarMensagem(
          "Carregue um atendimento antes de restaurar os dados.",
          "error"
        );

        return;
      }


      preencherCampos(
        dadosOriginais
      );


      mostrarMensagem(
        "Dados restaurados para os valores originais do atendimento.",
        "success"
      );

    }
  );


form
  ?.addEventListener(
    "submit",
    evento => {

      evento.preventDefault();


      const dados =
        obterDadosFormulario();


      if (
        !dados.nome ||
        !dados.data
      ) {

        mostrarMensagem(
          "Informe a data e o nome do paciente.",
          "error"
        );

        return;
      }


      if (
        !dados.nascimento
      ) {

        mostrarMensagem(
          "Informe a data de nascimento do paciente antes de gerar o encaminhamento.",
          "error"
        );

        campos.nascimento.focus();

        return;
      }


      if (
        !dados.acompanhante
      ) {

        mostrarMensagem(
          "Informe o nome do acompanhante antes de gerar o encaminhamento.",
          "error"
        );

        campos.acompanhante.focus();

        return;
      }


      gerarPDF(
        dados
      );

    }
  );


/* =========================================================
   PDF — MODELO DO DOCUMENTO DE ENCAMINHAMENTO
========================================================= */

function gerarPDF(dados) {

  if (!window.jspdf?.jsPDF) {

    mostrarMensagem(
      "Não foi possível carregar o gerador de PDF.",
      "error"
    );

    return;
  }


  const { jsPDF } =
    window.jspdf;


  const pdf =
    new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    });


  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 20;
  const WIDTH = PAGE_W - MARGIN * 2;

  const BLUE = [53, 105, 212];
  const TEXT = [35, 41, 50];
  const MUTED = [100, 108, 120];

  let y = 24;


  function garantirEspaco(altura) {

    if (
      y + altura >
      PAGE_H - 28
    ) {

      pdf.addPage();

      y = 22;

    }

  }


  function texto(
    valor,
    opcoes = {}
  ) {

    const {
      tamanho = 10.5,
      negrito = false,
      espacamento = 5,
      cor = TEXT
    } = opcoes;


    const linhas =
      pdf.splitTextToSize(
        String(valor),
        WIDTH
      );


    garantirEspaco(
      linhas.length *
      espacamento +
      4
    );


    pdf.setTextColor(
      ...cor
    );


    pdf.setFont(
      "helvetica",
      negrito
        ? "bold"
        : "normal"
    );


    pdf.setFontSize(
      tamanho
    );


    pdf.text(
      linhas,
      MARGIN,
      y
    );


    y +=
      linhas.length *
      espacamento +
      3;

  }


  function rotulo(
    valor
  ) {

    y += 2;

    texto(
      valor,
      {
        tamanho: 9,
        negrito: true,
        cor: BLUE
      }
    );

  }


  function bloco(
    valor
  ) {

    texto(
      valor ||
      "Não informado.",
      {
        tamanho: 10.5,
        espacamento: 5.2
      }
    );

  }


  /*
   * Cabeçalho
   */
  pdf.setTextColor(
    ...TEXT
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(18);

  pdf.text(
    "ENCAMINHAMENTO",
    PAGE_W / 2,
    y,
    {
      align: "center"
    }
  );


  y += 14;


  /*
   * O texto abaixo segue exatamente o modelo
   * ENCAMINHAMENTO.docx fornecido pelo usuário.
   */

  texto(
    `Data: ${formatarDataBr(dados.data)}.`
  );


  texto(
    `Encaminho o(a) paciente ${dados.nome},`
  );


  texto(
    `Idade ${dados.idade || "_______"} Anos, DN: ${formatarDataBr(dados.nascimento)}, CPF: ${dados.cpf || "____________________________"}.`
  );


  texto(
    `Acompanhado(a) por ${dados.acompanhante}, atendido(a) nesta unidade por meio da Estratégia AIDPI, apresentando como queixa principal:`
  );


  bloco(
    dados.queixa
  );


  texto(
    "Durante a avaliação, foram identificados os seguintes sinais e sintomas:"
  );


  bloco(
    dados.sinais
  );


  texto(
    "Após avaliação conforme estratégia AIDPI, o(a) paciente foi classificado(a) como:"
  );


  bloco(
    dados.classificacoes
  );


  texto(
    "Foram realizadas as seguintes condutas e orientações:"
  );


  bloco(
    dados.condutas
  );

  texto(
    "Solicito atendimento especializado de urgência "
  );


  garantirEspaco(
    18
  );

  y += 8;


  pdf.setDrawColor(
    80,
    86,
    96
  );


  pdf.setLineWidth(
    0.3
  );


  pdf.line(
    PAGE_W / 2 - 38,
    y,
    PAGE_W / 2 + 38,
    y
  );


  y += 6;


  pdf.setTextColor(
    ...MUTED
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.setFontSize(
    9
  );


  pdf.text(
    "Assinatura/Carimbo",
    PAGE_W / 2,
    y,
    {
      align: "center"
    }
  );


  /*
   * Rodapé
   */
  const totalPaginas =
    pdf.getNumberOfPages();


  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {

    pdf.setPage(
      pagina
    );


    pdf.setDrawColor(
      225,
      230,
      238
    );


    pdf.line(
      MARGIN,
      PAGE_H - 15,
      PAGE_W - MARGIN,
      PAGE_H - 15
    );


    pdf.setTextColor(
      ...MUTED
    );


    pdf.setFontSize(
      7.5
    );


    pdf.text(
      `suAIDPI • Encaminhamento • Página ${pagina} de ${totalPaginas}`,
      MARGIN,
      PAGE_H - 9
    );

  }


  const nomeArquivo =
    String(
      dados.nome ||
      "Paciente"
    )
      .replace(
        /[^\p{L}\p{N}\s_-]/gu,
        ""
      )
      .trim()
      .replace(
        /\s+/g,
        "_"
      );


  pdf.save(
    `Encaminhamento_${nomeArquivo || "Paciente"}.pdf`
  );


  mostrarMensagem(
    "Encaminhamento gerado com sucesso.",
    "success"
  );

}
