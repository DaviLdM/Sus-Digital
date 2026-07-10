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

let atendimentos = {};

onAuthStateChanged(auth, async (user)=>{

    if(!user) return;
    // console.log(document.querySelector("#historicoTable"));
    // console.log(document.querySelector("#historicoTable tbody"));
    const lista = document.getElementById("historicoLista");

    lista.innerHTML = "";

    const q=query(
        collection(db,"historico"),
        where("uidMedico","==",user.uid)
    );

    const snap=await getDocs(q);

    if(snap.empty){

        tabela.innerHTML=`
        <tr>
            <td colspan="4" style="text-align:center">
                Nenhum atendimento encontrado.
            </td>
        </tr>`;

        return;
    }

    snap.forEach(docSnap=>{

        const data=docSnap.data();

        atendimentos[docSnap.id]=data;

        let dataFormatada="-";

        if(data.timestamp){

            dataFormatada=new Date(
                data.timestamp.seconds*1000
            ).toLocaleString("pt-BR");

        }

        const nome=data.paciente?.nome ?? "-";

        const resumo=Object.values(data.resultados || {})
            .filter(r=>r)
            .map(r=>r.classificacao)
            .join(" | ");
        //aa
        const card = document.createElement("div");

        card.className = "historico-item";

        card.innerHTML = `
            <div class="historico-linha">
                <strong>📅 Data:</strong>
                <span>${dataFormatada}</span>
            </div>

            <div class="historico-linha">
                <strong>👤 Paciente:</strong>
                <span>${nome}</span>
            </div>

            <div class="historico-linha">
                <strong>📋 Classificações:</strong>
                <span>${resumo || "-"}</span>
            </div>

            <div class="acoes">
                <button
                    class="btn ghost"
                    onclick="baixarPDF('${docSnap.id}')">
                    📄 PDF
                </button>

                <button
                    class="btn ghost"
                    onclick="excluirConsulta('${docSnap.id}')">
                    🗑 Excluir
                </button>
            </div>
        `;

        lista.appendChild(card);

    });

});

window.baixarPDF = function(id){

  const atendimento = atendimentos[id];

  if(!atendimento){
      alert("Atendimento não encontrado.");
      return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  let y = 15;

  function linha(texto){

    const partes = String(texto).split("\n");

    partes.forEach(parte => {

        const linhas = pdf.splitTextToSize(parte, 180);

        pdf.text(linhas, 10, y);

        y += linhas.length * 7;

        if (y > 270) {
            pdf.addPage();
            y = 15;
        }

    });

  }

  pdf.setFontSize(18);

  linha("PET Saúde Digital");

  pdf.setFontSize(12);

  linha("--------------------------------------------");

  linha("DADOS DO PACIENTE");

  linha("");

  linha("Nome: " + (atendimento.paciente.nome || "-"));

  linha("CPF: " + (atendimento.paciente.cpf || "-"));

  linha("Idade: " + (atendimento.paciente.idade || "-"));

  linha("Peso: " + (atendimento.paciente.peso || "-"));

  linha("Estatura: " + (atendimento.paciente.estatura || "-"));

  linha("");

  linha("QUEIXA PRINCIPAL");

  linha(atendimento.principalQueixa || "-");

  linha("");

  linha("EXAME");

  linha("Dias de tosse: " + (atendimento.exame.duration_cough || "-"));

  linha("FR: " + (atendimento.exame.frequenciaRespiratoria || "-"));

  linha("Saturação: " + (atendimento.exame.saturacao || "-"));

  linha("Dias de diarreia: " + (atendimento.exame.duration_diarrhea || "-"));


  linha("Temperatura: " + (atendimento.exame.temperatura || "-"));

  linha("");

  linha("OBSERVAÇÕES");

  linha(atendimento.exame.observacoes || "-");

  linha("");

  linha("MARCAÇÕES");

  Object.entries(atendimento.marcacoes).forEach(([area,valores])=>{

      if(valores.length>0){

          linha("");

          linha(area.toUpperCase());

          valores.forEach(v=>linha("• "+v));

      }

  });

  linha("");

  linha("CLASSIFICAÇÕES");

  Object.entries(atendimento.resultados).forEach(([area,res])=>{

      if(res){

          linha("");

          linha(area.toUpperCase());

          linha(res.badge.replace(/[🔴🟡🟢]/g, ""));

          linha(res.classificacao);

          linha(res.conduta);

      }

  });

  pdf.save(
      "Atendimento_" +
      atendimento.paciente.nome.replace(/\s+/g,"_") +
      ".pdf"
  );

}

window.excluirConsulta=async function(id){

    if(!confirm("Deseja excluir este atendimento?"))
        return;

    await deleteDoc(doc(db,"historico",id));

    alert("Atendimento excluído.");

    location.reload();

}