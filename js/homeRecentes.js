import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const atendimentos = new Map();

onAuthStateChanged(auth, async (user) => {
  const tbody = document.getElementById("recentAppointmentsBody");
  if (!tbody) return;

  if (!user) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Entre na sua conta para visualizar os atendimentos recentes.</td>
      </tr>
    `;
    return;
  }

  try {
    const consulta = query(
      collection(db, "historico"),
      where("uidMedico", "==", user.uid)
    );

    const snapshot = await getDocs(consulta);

    const registros = snapshot.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      .sort((a, b) => obterMilissegundos(b.timestamp) - obterMilissegundos(a.timestamp))
      .slice(0, 5);

    tbody.innerHTML = "";
    atendimentos.clear();

    if (registros.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4">Nenhum atendimento encontrado.</td>
        </tr>
      `;
      return;
    }

    registros.forEach((atendimento) => {
      atendimentos.set(atendimento.id, atendimento);
      tbody.appendChild(criarLinha(atendimento));
    });

    if (window.lucide) window.lucide.createIcons();
  } catch (erro) {
    console.error("Erro ao carregar atendimentos recentes:", erro);
    tbody.innerHTML = `
      <tr class="error-row">
        <td colspan="4">Não foi possível carregar os atendimentos.</td>
      </tr>
    `;
  }
});

function criarLinha(atendimento) {
  const tr = document.createElement("tr");
  const nome = atendimento.paciente?.nome?.trim() || "Paciente sem nome";
  const idade = atendimento.paciente?.idade?.trim() || "Idade não informada";
  const iniciais = obterIniciais(nome);
  const data = formatarData(atendimento.timestamp);
  const classificacoes = obterClassificacoes(atendimento.resultados);

  tr.innerHTML = `
    <td>
      <div class="patient">
        <span class="initial blue">${escaparHTML(iniciais)}</span>
        <span>
          <strong>${escaparHTML(nome)}</strong>
          <small>${escaparHTML(idade)}</small>
        </span>
      </div>
    </td>
    <td>
      <span class="date">
        ${escaparHTML(data.dia)}
        <small>${escaparHTML(data.hora)}</small>
      </span>
    </td>
    <td>
      <div class="classification-list">
        ${classificacoes.map(criarBadgeClassificacao).join("")}
      </div>
    </td>
    <td>
      <button class="download-button" type="button" data-download-id="${atendimento.id}">
        <i data-lucide="download"></i>
        Baixar
      </button>
    </td>
  `;

  tr.querySelector("[data-download-id]")?.addEventListener("click", () => {
    baixarPDF(atendimento.id);
  });

  return tr;
}

function obterClassificacoes(resultados = {}) {
  const classificacoes = Object.values(resultados)
    .filter(Boolean)
    .map((resultado) => resultado.classificacao)
    .filter(Boolean);

  return classificacoes.length > 0 ? [...new Set(classificacoes)] : ["Não classificado"];
}

function criarBadgeClassificacao(classificacao) {
  const texto = String(classificacao).trim();
  const normalizado = texto.toUpperCase();
  let classe = "unclassified";

  if (normalizado.includes("VERMELH")) classe = "red-badge";
  else if (normalizado.includes("AMAREL")) classe = "yellow";
  else if (normalizado.includes("VERDE")) classe = "green-badge";

  return `<span class="badge ${classe}">${escaparHTML(texto)}</span>`;
}

function obterMilissegundos(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.seconds === "number") return timestamp.seconds * 1000;
  const valor = new Date(timestamp).getTime();
  return Number.isNaN(valor) ? 0 : valor;
}

function formatarData(timestamp) {
  const milissegundos = obterMilissegundos(timestamp);
  if (!milissegundos) return { dia: "-", hora: "-" };

  const data = new Date(milissegundos);
  return {
    dia: data.toLocaleDateString("pt-BR"),
    hora: data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

function obterIniciais(nome) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("") || "P";
}

function escaparHTML(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baixarPDF(id) {
  const atendimento = atendimentos.get(id);

  if (!atendimento) {
    alert("Atendimento não encontrado.");
    return;
  }

  if (!window.jspdf?.jsPDF) {
    alert("Não foi possível carregar o gerador de PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 15;

  function linha(texto = "") {
    String(texto).split("\n").forEach((parte) => {
      const linhas = pdf.splitTextToSize(parte, 180);
      pdf.text(linhas, 10, y);
      y += Math.max(linhas.length, 1) * 7;

      if (y > 270) {
        pdf.addPage();
        y = 15;
      }
    });
  }

  const paciente = atendimento.paciente || {};
  const exame = atendimento.exame || {};
  const marcacoes = atendimento.marcacoes || {};
  const resultados = atendimento.resultados || {};

  pdf.setFontSize(18);
  linha("PET Saúde Digital");

  pdf.setFontSize(12);
  linha("--------------------------------------------");
  linha("DADOS DO PACIENTE");
  linha("");
  linha(`Nome: ${paciente.nome || "-"}`);
  linha(`CPF: ${paciente.cpf || "-"}`);
  linha(`Idade: ${paciente.idade || "-"}`);
  linha(`Peso: ${paciente.peso || "-"}`);
  linha(`Estatura: ${paciente.estatura || "-"}`);
  linha("");
  linha("QUEIXA PRINCIPAL");
  linha(atendimento.principalQueixa || "-");
  linha("");
  linha("EXAME");
  linha(`Dias de tosse: ${exame.duration_cough || "-"}`);
  linha(`FR: ${exame.frequenciaRespiratoria || "-"}`);
  linha(`Saturação: ${exame.saturacao || "-"}`);
  linha(`Dias de diarreia: ${exame.duration_diarrhea || "-"}`);
  linha(`Temperatura: ${exame.temperatura || "-"}`);
  linha("");
  linha("OBSERVAÇÕES");
  linha(exame.observacoes || "-");
  linha("");
  linha("MARCAÇÕES");

  Object.entries(marcacoes).forEach(([area, valores]) => {
    if (Array.isArray(valores) && valores.length > 0) {
      linha("");
      linha(area.toUpperCase());
      valores.forEach((valor) => linha(`• ${valor}`));
    }
  });

  linha("");
  linha("CLASSIFICAÇÕES");

  Object.entries(resultados).forEach(([area, resultado]) => {
    if (resultado) {
      linha("");
      linha(area.toUpperCase());
      linha(String(resultado.badge || "").replace(/[🔴🟡🟢]/g, ""));
      linha(resultado.classificacao || "-");
      linha(resultado.conduta || "-");
    }
  });

  const nomeArquivo = String(paciente.nome || "Paciente")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-ZÀ-ÿ0-9_-]/g, "");

  pdf.save(`Atendimento_${nomeArquivo || "Paciente"}.pdf`);
}
