// // js/salvarHistorico.js
// import { auth, db } from "./firebase.js";
// import {
//   collection,
//   addDoc,
//   serverTimestamp
// } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// async function salvarHistorico() {
//   const user = auth.currentUser;
//   if (!user) {
//     alert("Você precisa estar logada para salvar o histórico.");
//     return;
//   }
//   // Coletar campos do formulário (identificadores de acordo com o HTML)
//   const nome = document.getElementById("nome").value.trim();
//   const idade = document.getElementById("idade").value.trim();
//   // (repita para outros campos: sinais, valores, observações, etc.)
//   const rr = document.getElementById("rr").value || null;
//   const o2 = document.getElementById("o2").value || null;
//   const obs = document.getElementById("obs").value.trim();
//   const classificacao = document.getElementById("classificationText").innerText;
//   const conduta = document.getElementById("advice").innerText;

//   // Montar objeto completo com todos os dados do atendimento
//   const data = {
//     uidMedico: user.uid,
//     timestamp: serverTimestamp(),  // carimbo de data/hora do servidor
//     nome: nome || null,
//     idade: idade || null,
//     rr: rr,
//     o2: o2,
//     // Incluir aqui **todos** os sinais e sintomas coletados (por exemplo):
//     // dangerSigns: dangerChecked, respSigns: respChecked, ...
//     observacoes: obs,
//     classificacao: classificacao,
//     conduta: conduta
//   };

//   try {
//     const docRef = await addDoc(collection(db, "historico"), data);
//     alert("Histórico salvo com sucesso! (ID: " + docRef.id + ")");
//   } catch (e) {
//     console.error("Erro ao salvar histórico: ", e);
//     alert("Erro ao salvar histórico.");
//   }
// }

// // Associa a função ao botão “Salvar no navegador” ou outro botão
// document.addEventListener("DOMContentLoaded", () => {

//   document
//     .getElementById("saveHistoryBtn")
//     .addEventListener("click", salvarHistorico);

// });


// js/salvarHistorico.js

import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

export async function salvarHistorico() {

    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado.");
        return;
    }

    //-----------------------------
    // Dados da criança
    //-----------------------------

    const nome = document.getElementById("nome").value.trim();

    const cpf = document.getElementById("cpf").value.trim();

    const idade = document.getElementById("idade").value.trim();

    const peso = document.getElementById("peso").value.trim();

    const estatura = document.getElementById("estatura").value.trim();

    const queixa = document.getElementById("queixa").value.trim();



    //-----------------------------
    // Campos numéricos
    //-----------------------------

    const cough = document.getElementById("cough").value;

    const rr = document.getElementById("rr").value;

    const o2 = document.getElementById("o2").value;

    const diarrhea = document.getElementById("diarrhea").value;

    const fever = document.getElementById("fever").value;

    const temp = document.getElementById("temp").value;

    const obs = document.getElementById("obs").value.trim();

    const duration_cough = document.getElementById("duration_cough").value.trim();

    const duration_diarr = document.getElementById("duration_diarr").value.trim();



    //-----------------------------
    // Checkboxes
    //-----------------------------

    const dangerChecked = Array.from(
        document.querySelectorAll('input[name="danger"]:checked')
    ).map(i => i.value);

    const respChecked = Array.from(
        document.querySelectorAll('input[name="resp"]:checked')
    ).map(i => i.value);

    const sibilChecked = Array.from(
        document.querySelectorAll('input[name="sibilancia_det"]:checked')
    ).map(i => i.value);

    const diarrChecked = Array.from(
        document.querySelectorAll('input[name="diarr"]:checked')
    ).map(i => i.value);

    const fevChecked = Array.from(
        document.querySelectorAll('input[name="fev"]:checked')
    ).map(i => i.value);

    const earChecked = Array.from(
        document.querySelectorAll('input[name="ear"]:checked')
    ).map(i => i.value);

    const throatChecked = Array.from(
        document.querySelectorAll('input[name="throat"]:checked')
    ).map(i => i.value);

    const nutChecked = Array.from(
        document.querySelectorAll('input[name="nut"]:checked')
    ).map(i => i.value);



    //-----------------------------
    // Resultado de cada área
    //-----------------------------

    function pegarResultado(prefixo){

        const caixa = document.getElementById(prefixo + "Result");

        if(!caixa || caixa.style.display === "none") return null;

        return {

            classificacao:
                document.getElementById(prefixo + "Classification")?.innerText || "",

            conduta:
                document.getElementById(prefixo + "Advice")?.innerText || "",

            badge:
                document.getElementById(prefixo + "Badge")?.innerText || ""

        };

    }



    const resultados = {

        perigo: pegarResultado("danger"),

        respiracao: pegarResultado("resp"),

        sibilancia: pegarResultado("sibil"),

        diarreia: pegarResultado("diarr"),

        febre: pegarResultado("fever"),

        ouvido: pegarResultado("ear"),

        garganta: pegarResultado("throat"),

        nutricao: pegarResultado("nut")

    };



    //-----------------------------
    // Documento Firestore
    //-----------------------------

    const atendimento = {

        uidMedico: user.uid,

        timestamp: serverTimestamp(),

        paciente:{

            nome,

            cpf,

            idade,

            peso,

            estatura

        },

        principalQueixa: queixa,



        exame:{

            tosseDias: duration_cough,

            frequenciaRespiratoria: rr,

            saturacao: o2,

            diarreiaDias: duration_diarr,

            temperatura: temp,

            observacoes: obs

        },



        marcacoes:{

            perigo: dangerChecked,

            respiracao: respChecked,

            sibilancia: sibilChecked,

            diarreia: diarrChecked,

            febre: fevChecked,

            ouvido: earChecked,

            garganta: throatChecked,

            nutricao: nutChecked

        },



        resultados

    };



    //-----------------------------
    // Salvar
    //-----------------------------

    try{

        const doc = await addDoc(
            collection(db,"historico"),
            atendimento
        );

        alert("Histórico salvo com sucesso!");

        console.log(doc.id);

    }

    catch(e){

        console.error(e);

        alert("Erro ao salvar histórico.");

    }

}



document.addEventListener("DOMContentLoaded",()=>{

    document
        .getElementById("saveHistoryBtn")
        .addEventListener("click",salvarHistorico);

});