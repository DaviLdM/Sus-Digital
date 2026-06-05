// js/historico.js

import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

console.log("historico.js carregado");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    console.log("Usuário não logado");
    return;
  }

  console.log("Usuário logado:", user.uid);

  try {

    const tabela = document.querySelector("#historicoTable tbody");

    tabela.innerHTML = "";

    const historicoRef = collection(db, "historico");

    const q = query(
      historicoRef,
      where("uidMedico", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);

    console.log("Registros encontrados:", querySnapshot.size);

    if (querySnapshot.empty) {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td colspan="4" style="text-align:center">
          Nenhum atendimento encontrado.
        </td>
      `;

      tabela.appendChild(row);

      return;
    }

    querySnapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const row = document.createElement("tr");

      let dataFormatada = "-";

      if (data.timestamp) {
        dataFormatada = new Date(
          data.timestamp.seconds * 1000
        ).toLocaleString("pt-BR");
      }

      row.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${data.nome || "-"}</td>
        <td>${data.classificacao || "-"}</td>
        <td>
          <button
            class="btn ghost"
            onclick="excluirConsulta('${docSnap.id}')">
            Excluir
          </button>
        </td>
      `;

      tabela.appendChild(row);

    });

  } catch (erro) {

    console.error("Erro ao carregar histórico:", erro);

    alert("Erro ao carregar histórico.");

  }

});

window.excluirConsulta = async function(docId) {

  const confirmar = confirm(
    "Deseja realmente excluir este atendimento?"
  );

  if (!confirmar) return;

  try {

    await deleteDoc(
      doc(db, "historico", docId)
    );

    alert("Atendimento excluído.");

    location.reload();

  } catch (erro) {

    console.error("Erro ao excluir:", erro);

    alert("Erro ao excluir atendimento.");

  }

};