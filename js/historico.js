/* =========================================================
   js/historico.js
========================================================= */

import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  baixarRelatorioPDF
} from "./relatorioPDF.js";


const atendimentos = new Map();


/* =========================================================
   CARREGAR HISTÓRICO
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) return;

    const lista =
      document.getElementById(
        "historicoLista"
      );

    if (!lista) return;

    lista.innerHTML = "";

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


      if (snapshot.empty) {
        lista.innerHTML = `
          <div class="historico-item historico-vazio">
            Nenhum atendimento encontrado.
          </div>
        `;

        return;
      }


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
          );


      atendimentos.clear();


      registros.forEach(
        atendimento => {

          atendimentos.set(
            atendimento.id,
            atendimento
          );

          const card =
            criarCard(
              atendimento
            );

          lista.appendChild(
            card
          );

        }
      );

    } catch (erro) {
      console.error(
        "Erro ao carregar histórico:",
        erro
      );

      lista.innerHTML = `
        <div class="historico-item historico-vazio">
          Não foi possível carregar o histórico.
        </div>
      `;
    }

  }
);


/* =========================================================
   CARD
========================================================= */

function criarCard(
  atendimento
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "historico-item";


  const dataFormatada =
    formatarDataCompleta(
      atendimento.timestamp
    );


  const nome =
    atendimento.paciente?.nome
      ?.trim() ||
    "-";


  const resumo =
    Object.values(
      atendimento.resultados ||
      {}
    )
      .filter(Boolean)
      .map(
        resultado =>
          resultado.classificacao
      )
      .filter(Boolean)
      .join(" | ");


  card.innerHTML = `
    <div class="historico-linha">
      <strong>📅 Data:</strong>
      <span>${escaparHTML(dataFormatada)}</span>
    </div>

    <div class="historico-linha">
      <strong>👤 Paciente:</strong>
      <span>${escaparHTML(nome)}</span>
    </div>

    <div class="historico-linha">
      <strong>📋 Classificações:</strong>
      <span>${escaparHTML(resumo || "-")}</span>
    </div>

    <div class="acoes">

      <button
        class="btn ghost"
        type="button"
        data-pdf-id="${atendimento.id}"
      >
        📄 PDF
      </button>

      <button
        class="btn ghost"
        type="button"
        data-delete-id="${atendimento.id}"
      >
        🗑 Excluir
      </button>

    </div>
  `;


  card
    .querySelector(
      "[data-pdf-id]"
    )
    ?.addEventListener(
      "click",
      () => {
        baixarRelatorioPDF(
          atendimento
        );
      }
    );


  card
    .querySelector(
      "[data-delete-id]"
    )
    ?.addEventListener(
      "click",
      () => {
        excluirConsulta(
          atendimento.id
        );
      }
    );


  return card;
}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirConsulta(
  id
) {

  const confirmar =
    confirm(
      "Deseja excluir este atendimento?"
    );

  if (!confirmar) {
    return;
  }


  try {
    await deleteDoc(
      doc(
        db,
        "historico",
        id
      )
    );

    alert(
      "Atendimento excluído."
    );

    location.reload();

  } catch (erro) {
    console.error(
      "Erro ao excluir atendimento:",
      erro
    );

    alert(
      "Não foi possível excluir o atendimento."
    );
  }
}


/* =========================================================
   AUXILIARES
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


  return Number.isNaN(valor)
    ? 0
    : valor;
}


function formatarDataCompleta(
  timestamp
) {

  const milissegundos =
    obterMilissegundos(
      timestamp
    );


  if (!milissegundos) {
    return "-";
  }


  return new Date(
    milissegundos
  ).toLocaleString(
    "pt-BR"
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
