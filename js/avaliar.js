/* avaliar.js - lógica do checklist AIDP */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("evaluateBtn").addEventListener("click", evaluateChecklist);
  document.getElementById("saveHistoryBtn").addEventListener("click", salvarHistorico);
  document.getElementById("downloadBtn").addEventListener("click", downloadSummary);
});

function evaluateChecklist() {
  // coleta dados
  const nome = document.getElementById("nome").value.trim();
  const idadeNumber = document.getElementById("idade").value.trim();

  const dangerChecked = Array.from(document.querySelectorAll('input[name="danger"]:checked')).map(i=>i.value);
  const respChecked = Array.from(document.querySelectorAll('input[name="resp"]:checked')).map(i=>i.value);
  const sibilChecked = Array.from(document.querySelectorAll('input[name="sibilancia_det"]:checked')).map(i=>i.value);
  const diarrChecked = Array.from(document.querySelectorAll('input[name="diarr"]:checked')).map(i=>i.value);
  const fevChecked = Array.from(document.querySelectorAll('input[name="fev"]:checked')).map(i=>i.value);
  const earChecked = Array.from(document.querySelectorAll('input[name="ear"]:checked')).map(i=>i.value);
  const throatChecked = Array.from(document.querySelectorAll('input[name="throat"]:checked')).map(i=>i.value);
  const nutChecked = Array.from(document.querySelectorAll('input[name="nut"]:checked')).map(i=>i.value);

  const cough = document.getElementById("cough").value;
  const rrRaw = document.getElementById("rr").value;
  const rr = rrRaw ? parseInt(rrRaw,10) : null;
  const o2Raw = document.getElementById("o2").value;
  const o2 = o2Raw ? parseInt(o2Raw,10) : null;
  const diarrhea = document.getElementById("diarrhea").value;
  const fever = document.getElementById("fever").value;
  const temp = document.getElementById("temp").value;
  const obs = document.getElementById("obs").value.trim();

  // elementos de resultado
  const resultArea = document.getElementById("resultArea");
  const badge = document.getElementById("badge");
  const classificationText = document.getElementById("classificationText");
  const advice = document.getElementById("advice");

  // limpa classes do badge
  badge.className = "badge";
  resultArea.style.display = "block";

  /* REGRAS DE CLASSIFICAÇÃO
     Importante: alguns thresholds (ex: RR por idade) dependem de idade exata.
     Aqui usamos sinais diretos (convulsão, letargia, estridor em repouso, tiragem universal/subcostal,
     Sat O2 <= 90%) como EMERGÊNCIA. Você pode ajustar facilmente. */

  // 1) Sinais de emergência (vermelho)
  const hasDanger = dangerChecked.length > 0;


  if ( hasDanger) {
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: Doença muito grave / emergência`;
    advice.innerText = `Conduta: Referir URGENTEMENTE ao hospital. Administrar suporte (O₂ se disponível, primeiras doses conforme protocolo) e não adiar o encaminhamento. Anotações: ${obs || '—'}`;
    return;
  }

  // 2) Pneumonia (respiração rápida) -> amarelo
  // Observação: idealmente dependente da idade. Aqui usamos RR >= 50 como indicador forte,
  // e RR >= 40 como possível (conservador).

  const hasRespDanger = respChecked.includes("qualquer_sinal_perigo_Tosse") || respChecked.includes("tiragem_subcostal_Tosse") || respChecked.includes("estridor_descanso");

  if(hasRespDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: PNEUMONIA GRAVE/OU DOENÇA MUITO GRAVE`;
    advice.innerText = `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                 • Tratar a criança para evitar hipoglicemia.
                                 • Referir urgentemente ao hospital.
                                 • Oxigênio, se disponível.`;
    return;  
  }

  if ( respChecked.includes("respiracao_rapida")) {
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: Pneumonia`;
    advice.innerText = `Conduta: • Dar um antibiótico recomendado durante sete dias.
                                 • Aliviar a tosse com medidas caseiras.
                                 • Informar a mãe sobre quando retornar imediatamente.
                                 • Marcar o retorno em dois dias.`;
    return;
  }

   if ( respChecked.includes("nenhum sinal acima")) {
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: Não é Pneumonia`;
    advice.innerText = `Conduta: • Aliviar a tosse com medidas caseiras.
                                 • Informar a mãe sobre quando retornar imediatamente.
                                 • Seguimento em cinco dias, caso não melhore.
                                 • Se tosse há mais de 14 dias, realizar investigação.`;
    return;
  }

  //3) Sibilância

  const hasSibilDanger = sibilChecked.includes("letargia_demais") || sibilChecked.includes("estridor") || sibilChecked.includes("tiragem_universal") || sibilChecked.includes("fala_incompleta") || sibilChecked.includes("choro_curto") || sibilChecked.includes("sat_low");

  if(hasSibilDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: SIBILÂNCIA GRAVE/OU DOENÇA MUITO GRAVE`;
    advice.innerText = `Conduta: • Oxigênio, se disponível.
                                 • Beta-2 agonista por via inalatória.
                                 • Primeira dose do corticoide.
                                 • Primeira dose do antibiótico.
                                 • Referir urgentemente ao hospital.`;
    return;  
  }

  if(sibilChecked.includes("agitacao_normal") || sibilChecked.includes("tiragem_subcostal_Sibi") || sibilChecked.includes("choro_entrecortado") || sibilChecked.includes("sat_mid")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: SIBILÂNCIA MODERADA`;
    advice.innerText = `Conduta: • Administrar beta-2 por via inalatória (até três vezes, a cada 20 minutos).
                                 • Administrar corticoide oral. 
                                 Se não melhorar: REFERIR, após dar a primeira dose do antibiótico injetável e O2, se possível.
                                 Se melhorar:
                                 • Tratamento domiciliar com beta-2 por via inalatória (cinco dias).
                                 • Corticoide por via oral (três dias).
                                 • Dar orientações a mãe para o controle da asma e quando retornar imediatamente.
                                 • Marcar o retorno em dois dias.`;
    return;
  }

  if ( sibilChecked.includes("nenhum sinal acima_sib") || sibilChecked.includes("sat_high")) {
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `SIBILÂNCIA LEVE`;
    advice.innerText = `Conduta: • Tratamento domiciliar com beta-2 agonista por viainalatória (cinco dias).
                                 • Se estiver em uso de beta-2 há 24 horas ou mais: prescrever corticoide por via oral (três dias).
                                 • Dar orientações à mãe para o controle da asma e quando retornar imediatamente.
                                 • Seguimento em dois dias, se não melhorar ou se estiver usando corticoide.`;
    return;
  }



  // 4) Diarreia com sinais)
  
  const hasDiarrDanger = diarrChecked.includes("letargica_diarr") || diarrChecked.includes("olhos_fundos") || diarrChecked.includes("nao_bebe") || diarrChecked.includes("prega_muito_lenta");

  if(diarrChecked.includes("com_desidratacao")){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: DIARREIA PERSISTENTE GRAVE`;
    advice.innerText = `Conduta: • Tratar a desidratação antes de referir a criança, a não ser que esta se enquadre em outra classificação grave.
                                 • Referir URGENTEMENTE ao hospital.`;
    return;  
  }

  if(hasDiarrDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: DESIDRATAÇÃO GRAVE`;
    advice.innerText = `Conduta: • Se a criança não se enquadrar em outra classificação grave:
                                    Iniciar terapia endovenosa (Plano C).
                                 • Se a criança também se enquadrar em outra classificação grave:
                                    Referir URGENTEMENTE ao hospital, com mãe e o profissional de saúde administrando-lhe goles frequentes de SRO durante o trajeto, se possível.
                                  Recomendar a continuar a amamentação, se possível.
                                 • Se a criança tiver 2 ou mais anos de idade, e se houver cólera na sua região,
                                 administrar antibiótico.`;
    return;  
  }

  if(diarrChecked.includes("inquieta") || diarrChecked.includes("bebe_avido") ){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: DESIDRATAÇÃO`;
    advice.innerText = `Conduta: • Administrar SRO na unidade de saúde até hidratar (Plano B).
                                 • Dar zinco oral por dez dias.
                                 • Informar a mãe sobre quando retornar imediatamente.
                                 • Seguimento em cinco dias, se não melhorar.
                                 • Se a criança também se enquadrar em uma classificação grave devido a outro problema:
                                 • Referir URGENTEMENTE ao hospital, com a mãe e profissional de saúde administrando-lhe goles frequentes de SRO durante o trajeto.
                                 • Recomendar à mãe que continue a amamentação, se possível.`;
    return;
  }

  if(diarrChecked.includes("sem_desidratacao")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: DIARREIA PERSISTENTE`;
    advice.innerText = `Conduta: • Informar sobre como alimentar uma criança com DIARREIA PERSISTENTE.
                                 • Dar zinco oral por dez dias dias.
                                 • Informar sobre quando retornar imediatamente.
                                 • Marcar retorno em cinco dias.`;
    return;
  }

  if(diarrChecked.includes("sangue_nas_fezes")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: DESINTERIA`;
    advice.innerText = `Conduta: • Dar um antibiótico recomendado em sua região para Shigella, se houver comprometimento do estado geral.
                                 • Dar zinco oral por dez dias.
                                 • Marcar o retorno em dois dias.
                                 • Informar sobre quando retornar imediatamente.`;
    return;
  }

  if ( diarrChecked.includes("nenhum sinal acima_diarr")) {
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `SEM DESIDRATAÇÃO`;
    advice.innerText = `Conduta: • Dar alimentos e líquidos para tratar a diarreia em casa (Plano A).
                                 • Dar zinco oral por dez dias.
                                 • Informar a mãe sobre quando retornar imediatamente.
                                 • Seguimento em cinco dias se não melhorar.`;
    return;
  }


  //5) Febre
  const hasFeverDanger = fevChecked.includes("rigidez_nuca") || fevChecked.includes("petequias") || fevChecked.includes("fontanela_abaulada") ;
  const hasFeverDangerMalaria = (fevChecked.includes("rigidez_nuca") || fevChecked.includes("petequias") || fevChecked.includes("fontanela_abaulada") ) && fevChecked.includes("area_risco");
  if(hasFeverDangerMalaria){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: MALÁRiA GRAVE OU DOENÇA FEBRIL MUiTO GRAVE`;
    advice.innerText = `Conduta: • Se gota espessa/teste rápido for positivo, dar a primeira
                                  dose de um antimalárico recomendado.
                                • Dar a primeira dose de um antibiótico recomendado.
                                • Tratar a criança para evitar hipoglicemia.
                                • Dar antitérmico se temperatura for ≥ 38,0º C.
                                • Referir URGENTEMENTE ao hospital.`;
    return;  
  }
  if(hasFeverDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: DOENÇA FEBRIL MUiTO GRAVE`;
    advice.innerText = `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                • Tratar a criança para evitar hipoglicemia.
                                • Dar antitérmico se temperatura for ≥ 38,0º C.
                                • Referir URGENTEMENTE ao hospital.`;
    return;  
  }
  if(fevChecked.includes("nenhum_sinal_grave")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: MALÁRiA `;
    advice.innerText = `Conduta: •  Tratar com antimalárico oral recomendado.
                                 • Dar antitérmico se temperatura for ≥38ºC.
                                 • Informar a mãe sobre quando retornar imediatamente.
                                 • Seguimento em três dias.
                                 • Se tem tido febre todos os dias por mais de cinco dias,
                                   realizar investigação.`;
    return;
  }
  if(fevChecked.includes("nenhum_sinal_negativo")){
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: DOENÇA FEBRIL`;
    advice.innerText = `Conduta: • Dar antitérmico se temperatura for ≥38,0º.
                                 • Informar a mãe/pai/acompanhante sobre quando
                                 retornar imediatamente.
                                 • Seguimento em dois dias se a febre persistir.
                                 • Se tem tido febre todos os dias por mais de cinco dias,
                                 realizar investigação.`;
    return;
  }

  //6) Problema de ouvido

  const hasEarDanger = earChecked.includes("tumefacao_vermelhidao") ;

  if(hasEarDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: MASTOIDITE`;
    advice.innerText = `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                 • Dar analgésico em caso de dor.
                                 • Referir URGENTEMENTE ao hospital.`;

    return;  
  }
  if(earChecked.includes("secrecao_menos_14")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: INFECÇÃO AGUDA DO OUVIDO`;
    advice.innerText = `Conduta: • Antibiótico recomendado por oito dias.
                                 • Dar analgésico em caso de dor.
                                 • Secar o ouvido com uma mecha se houver secreção.
                                 • Marcar o retorno com dois dias.
                                 • Orientar sinais de retorno imediato.`;
    return;
  }
  if(earChecked.includes("secrecao_14_ou_mais")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: INFECÇÃO CRÔNICA DO OUVIDO`;
    advice.innerText = `Conduta: • Dar analgésico em caso de dor.
                                 • Marcar o retorno com dois dias.
                                 • Orientar sinais de retorno imediato.`;
    return;
  }
  if(earChecked.includes("dor_ouvido")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: POSSÍVEL INFECÇÃO AGUDA DO OUVIDO`;
    advice.innerText = `Conduta: • Secar o ouvido com uma mecha.
                                 • Marcar o retorno com cinco dias.
                                 • Orientar sinais de retorno imediato.`;
    return;
  }
  if(earChecked.includes("sem_dor_sem_secrecao")){
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: NÃO HÁ INFECÇÃO DO OUVIDO`;
    advice.innerText = `Conduta: • Nenhum tratamento adicional.`;
    return;
  }


  //7) Problema de Garganta
  const hasThroatDanger = throatChecked.includes("sinal_perigo_geral") || throatChecked.includes("amigdalas_membranas") || throatChecked.includes("abaulamento_palato");

  if(hasThroatDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: INFECÇÃO GRAVE DA GARGANTA`;
    advice.innerText = `Conduta: • Referir URGENTEMENTE ao hospital.
                                 • Dar a primeira dose de um antibiótico recomendado.`;
    return;
  }
  if(throatChecked.includes("ganglios_dolorosos") || throatChecked.includes("amigdalas_pontos_purulentos")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `INFECÇÃO MODERADA DE GARGANTA`;
    advice.innerText = `Conduta: • Dar um antibiótico recomendado.
                                 • Dar analgésico em caso de dor.
                                 • Marcar consulta de retorno com dois dias.
                                 • Informar a mãe sobre quando retornar imediatamente.`;
    return;
  }
  if(throatChecked.includes("vesiculas_hiperemia_resfriado")){
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: INFECÇÃO LEVE DE GARGANTA`;
    advice.innerText = `Conduta: • Dar analgésico em caso dor.
                                 • Seguimento em dois dias se persistir dor de garganta.
                                 • Informar a mãe/pai/acompanhante sobre quando
                                 retornar imediatamente`;
    return;
  }
  if(throatChecked.includes("nenhum_sinal")){
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: NÃO HÁ INFECÇÃO DE GARGANTA`;
    advice.innerText = `Conduta: • Nenhum tratamento adicional.`;
    return;
  }

  //7) Problema Nutricional

  const hasNutDanger = nutChecked.includes("edema_ambos_pes") || nutChecked.includes("emagrecimento_acentuado") ;
  const hasAnemiaDanger = nutChecked.includes("palidez_palmar_grave");
  
  if(hasNutDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: DESNUTRIÇÃO GRAVE`;
    advice.innerText = `Conduta: • Prevenir, controlar e, se necessário, tratar a hipoglicemia.
                                 • Prevenir a hipotermia (manter a criança agasalhada).
                                 • Dar megadose de vitamina A, se a criança não tiver tomado nos
                                 últimos 30 dias.
                                 • Referir URGENTEMENTE ao hospital.`;
    return;  
  }
  if(hasAnemiaDanger){
    badge.classList.add("vermelho");
    badge.innerText = "🔴 EMERGÊNCIA";
    classificationText.innerText = `Classificação: ANEMIA GRAVE`;
    advice.innerText = `Conduta: • Referir URGENTEMENTE ao hospital.`;
    return;  
  }
  if(nutChecked.includes("peso_idade_menor_menos3")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: PESO MUITO ABAIXO`;
    advice.innerText = `Conduta: • Avaliar a alimentação da criança e as possíveis causas de desnutrição.
                                 • Aconselhar a mãe/pai/acompanhante a tratar a criança de acordo com
                                 as dietas especiais.
                                 • Dar megadose de vitamina A, se a criança não tiver tomado nos
                                 últimos 30 dias.
                                 • Uso profilático de ferro em menores de 24 meses.
                                 • Retorno com cinco dias.
                                 • Orientar sinais de retorno imediato.`;
    return;
  }
  if(nutChecked.includes("peso_idade_menor_menos2") || nutChecked.includes("tendencia_curva_descendente")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: PESO ABAIXO OU GANHO DE PESO INSUFICIENTE`;
    advice.innerText = `Conduta: • Avaliar a alimentação da criança e as possíveis causas do peso baixo.
                                 • Orientar a alimentação adequada.
                                 • Uso profilático de ferro em menores de 24 meses.
                                 • Marcar retorno com duas semanas.
                                 • Orientar sinais de retorno imediato.`;
    return;
  }
  if(nutChecked.includes("peso_idade_maior_mais2")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: PESO ELEVADO`;
    advice.innerText = `Conduta: • valiar a alimentação da criança e as possíveis causas do peso elevado.
                                 • Orientar a alimentação adequada.
                                 • Verificar e estimular a prática de atividade física.
                                 • Uso profilático de ferro em menores de 24 meses.
                                 • Marcar o retorno com duas semanas.
                                 • Orientar sinais de retorno realizando o diagnóstico do estado nutricional.`;
    return;
  }
  if(nutChecked.includes("peso_idade_entre_menos2_mais2")){
    badge.classList.add("verde");
    badge.innerText = "🟢 ESTÁVEL";
    classificationText.innerText = `Classificação: PESO ADEQUADO`;
    advice.innerText = `Conduta: • Elogiar a mãe/pai/acompanhante pelo crescimento de seu filho.
                                 • Reforçar as recomendações para alimentação saudável, de acordo com o
                                 Quadro de Recomendações a respeito da alimentação da criança.
                                 • Uso profilático de ferro em menores de 24 meses.`;
    return;
  }
  if(nutChecked.includes("palidez_palmar_leve")){
    badge.classList.add("amarelo");
    badge.innerText = "🟡 ATENÇÃO";
    classificationText.innerText = `Classificação: ANEMIA`;
    advice.innerText = `Conduta: • Realizar tratamento com ferro.
                                 • Realizar teste de malária em área de risco.
                                 • Dar anti-helmíntico se a criança tiver um ano ou mais e não tiver
                                 tomado nenhuma dose nos últimos 6 meses.
                                 • Avaliar a alimentação da criança e orientar a mãe/pai/acompanhante
                                 sobre alimentos ricos em ferro.
                                 • Marcar retorno com 14 dias.`;
    return;
  }




  // 6) Caso leve / sem sinais de gravidade -> verde
  badge.classList.add("verde");
  badge.innerText = "🟢 ESTÁVEL";
  classificationText.innerText = `Classificação: Sem sinais de gravidade`;
  advice.innerText = `Conduta: Tratamento domiciliar, orientar sinais de alarme e retorno imediato se houver piora. Observações: ${obs || '—'}`;
}

/* Salva resumo simples no localStorage (lista de atendimentos) */
function saveToLocal() {
  const nome = document.getElementById("nome").value.trim() || "sem-nome";
  const data = {
    timestamp: new Date().toISOString(),
    nome,
    idade: document.getElementById("idade").value.trim(),
    rr: document.getElementById("rr").value || null,
    o2: document.getElementById("o2").value || null,
    resultAt: document.getElementById("classificationText").innerText,
    notes: document.getElementById("obs").value || ""
  };
  const key = "aidp_atendimentos_v1";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(data);
  localStorage.setItem(key, JSON.stringify(list));
  alert("Atendimento salvo localmente no navegador.");
}

/* Baixa um resumo do atendimento atual em .txt */
function downloadSummary() {
  const nome = document.getElementById("nome").value.trim() || "sem-nome";
  const summary = {
    nome,
    idade: document.getElementById("idade").value.trim(),
    classificacao: document.getElementById("classificationText").innerText,
    conduta: document.getElementById("advice").innerText,
    timestamp: new Date().toLocaleString()
  };
  const text = JSON.stringify(summary, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resumo_atendimento_${nome.replace(/\s+/g,'_')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}