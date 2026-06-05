// js/salvarHistorico.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

async function salvarHistorico() {
  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar logada para salvar o histórico.");
    return;
  }
  // Coletar campos do formulário (identificadores de acordo com o HTML)
  const nome = document.getElementById("nome").value.trim();
  const idade = document.getElementById("idade").value.trim();
  // (repita para outros campos: sinais, valores, observações, etc.)
  const rr = document.getElementById("rr").value || null;
  const o2 = document.getElementById("o2").value || null;
  const obs = document.getElementById("obs").value.trim();
  const classificacao = document.getElementById("classificationText").innerText;
  const conduta = document.getElementById("advice").innerText;

  // Montar objeto completo com todos os dados do atendimento
  const data = {
    uidMedico: user.uid,
    timestamp: serverTimestamp(),  // carimbo de data/hora do servidor
    nome: nome || null,
    idade: idade || null,
    rr: rr,
    o2: o2,
    // Incluir aqui **todos** os sinais e sintomas coletados (por exemplo):
    // dangerSigns: dangerChecked, respSigns: respChecked, ...
    observacoes: obs,
    classificacao: classificacao,
    conduta: conduta
  };

  try {
    const docRef = await addDoc(collection(db, "historico"), data);
    alert("Histórico salvo com sucesso! (ID: " + docRef.id + ")");
  } catch (e) {
    console.error("Erro ao salvar histórico: ", e);
    alert("Erro ao salvar histórico.");
  }
}

// Associa a função ao botão “Salvar no navegador” ou outro botão
document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("saveHistoryBtn")
    .addEventListener("click", salvarHistorico);

});