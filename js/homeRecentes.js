/* =========================================================
   js/homeRecentes.js
========================================================= */

import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  baixarRelatorioPDF
} from "./relatorioPDF.js";


onAuthStateChanged(
  auth,
  async (user) => {

    const tbody =
      document.getElementById(
        "recentAppointmentsBody"
      );

    if (!tbody) {
      return;
    }


    if (!user) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4">
            Entre na sua conta para visualizar os atendimentos recentes.
          </td>
        </tr>
      `;

      return;
    }


    try {

      const consulta = query(
        collection(
          db,
          "historico"
        ),
        where(
          "uidMedico",
          "==",
          user.uid
        )
      );


      const snapshot =
        await getDocs(
          consulta
        );


      const registros =
        snapshot.docs
          .map(
            documento => ({
              id: documento.id,
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
          )
          .slice(0, 5);


      tbody.innerHTML = "";


      if (
        registros.length === 0
      ) {
        tbody.innerHTML = `
          <tr class="empty-row">
            <td colspan="4">
              Nenhum atendimento encontrado.
            </td>
          </tr>
        `;

        return;
      }


      registros.forEach(
        atendimento => {
          tbody.appendChild(
            criarLinha(
              atendimento
            )
          );
        }
      );


      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (erro) {

      console.error(
        "Erro ao carregar atendimentos recentes:",
        erro
      );


      tbody.innerHTML = `
        <tr class="error-row">
          <td colspan="4">
            Não foi possível carregar os atendimentos.
          </td>
        </tr>
      `;
    }

  }
);


/* =========================================================
   LINHA DA HOME
========================================================= */

function criarLinha(
  atendimento
) {

  const tr =
    document.createElement(
      "tr"
    );


  const nome =
    atendimento.paciente?.nome
      ?.trim() ||
    "Paciente sem nome";


  const idade =
    atendimento.paciente?.idade
      ?.toString()
      .trim() ||
    "Idade não informada";


  const iniciais =
    obterIniciais(
      nome
    );


  const data =
    formatarData(
      atendimento.timestamp
    );


  const classificacoes =
    obterClassificacoes(
      atendimento.resultados
    );


  tr.innerHTML = `
    <td>
      <div class="patient">

        <span class="initial blue">
          ${escaparHTML(iniciais)}
        </span>

        <span>
          <strong>
            ${escaparHTML(nome)}
          </strong>

          <small>
            ${escaparHTML(idade)}
          </small>
        </span>

      </div>
    </td>

    <td>
      <span class="date">
        ${escaparHTML(data.dia)}

        <small>
          ${escaparHTML(data.hora)}
        </small>
      </span>
    </td>

    <td>
      <div class="classification-list">
        ${
          classificacoes
            .map(
              criarBadgeClassificacao
            )
            .join("")
        }
      </div>
    </td>

    <td>
      <button
        class="download-button"
        type="button"
        data-download
      >
        <i data-lucide="download"></i>
        Baixar
      </button>
    </td>
  `;


  /*
   * A Home NÃO possui mais um gerador de PDF próprio.
   * Ela usa exatamente o mesmo relatorioPDF.js do Histórico.
   */
  tr
    .querySelector(
      "[data-download]"
    )
    ?.addEventListener(
      "click",
      () => {
        baixarRelatorioPDF(
          atendimento
        );
      }
    );


  return tr;
}


/* =========================================================
   CLASSIFICAÇÕES DA TABELA
========================================================= */

function obterClassificacoes(
  resultados = {}
) {

  const classificacoes =
    Object.values(
      resultados
    )
      .filter(Boolean)
      .map(
        resultado => ({
          texto:
            resultado.classificacao,
          badge:
            resultado.badge
        })
      )
      .filter(
        item =>
          item.texto
      );


  if (
    classificacoes.length === 0
  ) {
    return [
      {
        texto:
          "Não classificado",
        badge:
          ""
      }
    ];
  }


  const unicas =
    new Map();


  classificacoes.forEach(
    item => {
      if (
        !unicas.has(
          item.texto
        )
      ) {
        unicas.set(
          item.texto,
          item
        );
      }
    }
  );


  return [
    ...unicas.values()
  ];
}


function criarBadgeClassificacao(
  classificacao
) {

  const texto =
    String(
      classificacao.texto
    ).trim();


  const status =
    String(
      classificacao.badge ||
      ""
    ).toUpperCase();


  let classe =
    "unclassified";


  if (
    status.includes(
      "EMERGÊNCIA"
    )
  ) {
    classe =
      "red-badge";
  } else if (
    status.includes(
      "ATENÇÃO"
    )
  ) {
    classe =
      "yellow";
  } else if (
    status.includes(
      "ESTÁVEL"
    )
  ) {
    classe =
      "green-badge";
  }


  return `
    <span class="badge ${classe}">
      ${escaparHTML(texto)}
    </span>
  `;
}


/* =========================================================
   DATA
========================================================= */

function obterMilissegundos(
  timestamp
) {

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
    return (
      timestamp.seconds *
      1000
    );
  }


  const valor =
    new Date(
      timestamp
    ).getTime();


  return Number.isNaN(
    valor
  )
    ? 0
    : valor;
}


function formatarData(
  timestamp
) {

  const milissegundos =
    obterMilissegundos(
      timestamp
    );


  if (!milissegundos) {
    return {
      dia: "-",
      hora: "-"
    };
  }


  const data =
    new Date(
      milissegundos
    );


  return {
    dia:
      data.toLocaleDateString(
        "pt-BR"
      ),

    hora:
      data.toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )
  };
}


/* =========================================================
   OUTROS AUXILIARES
========================================================= */

function obterIniciais(
  nome
) {

  return (
    nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        parte =>
          parte[0]
            ?.toUpperCase() ||
          ""
      )
      .join("") ||
    "P"
  );
}


function escaparHTML(
  valor
) {

  return String(valor)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}
