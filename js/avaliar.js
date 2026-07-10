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

  const tempo_tosse  = document.getElementById("duration_cough").value.trim();

  // elementos de resultado
  const resultArea = document.getElementById("resultArea");
  //const badge = document.getElementById("badge");
  const badgePerigo = document.getElementById("dangerBadge");
  const badgeResp = document.getElementById("respBadge");
  const badgeSibilancia = document.getElementById("sibilBadge");
  const badgeDiarr = document.getElementById("diarrBadge");
  const badgeFebre = document.getElementById("feverBadge");
  const badgeOuvido = document.getElementById("earBadge");
  const badgeGarganta = document.getElementById("throatBadge");
  const badgeNutricao = document.getElementById("nutBadge");


  //nova parte//
  const temPerigo = dangerChecked.length;
  const temRespiracao = respChecked.length;
  const temSibilancia = sibilChecked.length;
  const temDiarreia = diarrChecked.length;
  const temFebre = fevChecked.length;
  const temOuvido = earChecked.length;
  const temGarganta = throatChecked.length;
  const temNutricao = nutChecked.length;

  // limpa classes do badge
  //badge.className = "badge";
  resultArea.style.display = "block";
  document.getElementById("resultArea").style.display = "block";

  document.getElementById("dangerResult").style.display = "none";
  document.getElementById("respResult").style.display = "none";
  document.getElementById("sibilResult").style.display = "none";
  document.getElementById("diarrResult").style.display = "none";
  document.getElementById("feverResult").style.display = "none";
  document.getElementById("earResult").style.display = "none";
  document.getElementById("throatResult").style.display = "none";
  document.getElementById("nutResult").style.display = "none";

  /* REGRAS DE CLASSIFICAÇÃO
     Importante: alguns thresholds (ex: RR por idade) dependem de idade exata.
     Aqui usamos sinais diretos (convulsão, letargia, estridor em repouso, tiragem universal/subcostal,
     Sat O2 <= 90%) como EMERGÊNCIA. Você pode ajustar facilmente. */

  // 1) Sinais de emergência (vermelho)
  const hasDanger = dangerChecked.length > 0;

  console.log(dangerChecked);
  console.log(hasDanger);
  if ( hasDanger) {

    document.getElementById("dangerResult").style.display = "block";
    
    badgePerigo.classList.add("vermelho");
    badgePerigo.innerText = "🔴 EMERGÊNCIA";
    document.getElementById("dangerClassification").innerText = `Classificação: Doença muito grave / emergência`;
    document.getElementById("dangerAdvice").innerText = `Conduta: Referir URGENTEMENTE ao hospital. Administrar suporte (O₂ se disponível, primeiras doses conforme protocolo) e não adiar o encaminhamento. Anotações: ${obs || '—'}`;
    
  }

  // 2) Pneumonia (respiração rápida) -> amarelo
  // Observação: idealmente dependente da idade. Aqui usamos RR >= 50 como indicador forte,
  // e RR >= 40 como possível (conservador).

  const hasRespDanger = respChecked.includes("qualquer_sinal_perigo_Tosse") || respChecked.includes("tiragem_subcostal_Tosse") || respChecked.includes("estridor_descanso");
  if (temRespiracao > 0){
    console.log(respChecked);
    document.getElementById("respResult").style.display = "block";
    if(hasRespDanger){
      

      

      badgeResp.className = "badge vermelho";
      badgeResp.innerText = "🔴 EMERGÊNCIA";

      document.getElementById("respClassification").innerText =
      "Classificação: PNEUMONIA GRAVE";

      document.getElementById("respAdvice").innerText =
      `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                  • Tratar a criança para evitar hipoglicemia.
                                  • Referir urgentemente ao hospital.
                                  • Oxigênio, se disponível.`;
        
    }

    else if ( respChecked.includes("respiracao_rapida")) {
      badgeResp.className = "badge amarelo";
      badgeResp.innerText = "🟡 ATENÇÃO";
      document.getElementById("respClassification").innerText = `Classificação: Pneumonia`;
      document.getElementById("respAdvice").innerText = `Conduta: • Dar um antibiótico recomendado durante sete dias.
                                  • Aliviar a tosse com medidas caseiras.
                                  • Informar a mãe sobre quando retornar imediatamente.
                                  • Marcar o retorno em dois dias.`;
      
    }

    else if ( respChecked.includes("nenhum sinal acima")) {
      badgeResp.className = "badge verde";
      badgeResp.innerText = "🟢 ESTÁVEL";
      document.getElementById("respClassification").innerText = `Classificação: Não é Pneumonia`;
      document.getElementById("respAdvice").innerText = `Conduta: • Aliviar a tosse com medidas caseiras.
                                  • Informar a mãe sobre quando retornar imediatamente.
                                  • Seguimento em cinco dias, caso não melhore.
                                  • Se tosse há mais de 14 dias, realizar investigação.`;
      
    }
  }
  

  //3) Sibilância  sibilResult

  const hasSibilDanger = sibilChecked.includes("letargia_demais") || sibilChecked.includes("estridor") || sibilChecked.includes("tiragem_universal") || sibilChecked.includes("fala_incompleta") || sibilChecked.includes("choro_curto") || sibilChecked.includes("sat_low");
  if (temSibilancia>0){
    console.log(sibilChecked);
    document.getElementById("sibilResult").style.display = "block";
    if(hasSibilDanger){
      badgeSibilancia.className = "badge vermelho";
      badgeSibilancia.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("sibilClassification").innerText = `Classificação: SIBILÂNCIA GRAVE/OU DOENÇA MUITO GRAVE`;
      document.getElementById("sibilAdvice").innerText = `Conduta: • Oxigênio, se disponível.
                                  • Beta-2 agonista por via inalatória.
                                  • Primeira dose do corticoide.
                                  • Primeira dose do antibiótico.
                                  • Referir urgentemente ao hospital.`;
        
    }

    if(sibilChecked.includes("agitacao_normal") || sibilChecked.includes("tiragem_subcostal_Sibi") || sibilChecked.includes("choro_entrecortado") || sibilChecked.includes("sat_mid")){
      badgeSibilancia.className = "badge amarelo";
      badgeSibilancia.innerText = "🟡 ATENÇÃO";
      document.getElementById("sibilClassification").innerText = `Classificação: SIBILÂNCIA MODERADA`;
      document.getElementById("sibilAdvice").innerText = `Conduta: • Administrar beta-2 por via inalatória (até três vezes, a cada 20 minutos).
                                  • Administrar corticoide oral. 
                                  Se não melhorar: REFERIR, após dar a primeira dose do antibiótico injetável e O2, se possível.
                                  Se melhorar:
                                  • Tratamento domiciliar com beta-2 por via inalatória (cinco dias).
                                  • Corticoide por via oral (três dias).
                                  • Dar orientações a mãe para o controle da asma e quando retornar imediatamente.
                                  • Marcar o retorno em dois dias.`;
      
    }

    if ( sibilChecked.includes("nenhum sinal acima_sib") || sibilChecked.includes("sat_high")) {
      badgeSibilancia.className = "badge verde";
      badgeSibilancia.innerText = "🟢 ESTÁVEL";
      document.getElementById("sibilClassification").innerText = `Classificação: SIBILÂNCIA LEVE`;
      document.getElementById("sibilAdvice").innerText = `Conduta: • Tratamento domiciliar com beta-2 agonista por viainalatória (cinco dias).
                                  • Se estiver em uso de beta-2 há 24 horas ou mais: prescrever corticoide por via oral (três dias).
                                  • Dar orientações à mãe para o controle da asma e quando retornar imediatamente.
                                  • Seguimento em dois dias, se não melhorar ou se estiver usando corticoide.`;
      
    }
  }
  



  // 4) Diarreia com sinais)
  
  const hasDiarrDanger = diarrChecked.includes("letargica_diarr") || diarrChecked.includes("olhos_fundos") || diarrChecked.includes("nao_bebe") || diarrChecked.includes("prega_muito_lenta");

  if(temDiarreia>0){
    console.log(diarrChecked);
    document.getElementById("diarrResult").style.display = "block";

    if(diarrChecked.includes("com_desidratacao")){
      badgeDiarr.className = "badge vermelho";
      badgeDiarr.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("diarrClassification").innerText = `Classificação: DIARREIA PERSISTENTE GRAVE`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Tratar a desidratação antes de referir a criança, a não ser que esta se enquadre em outra classificação grave.
                                  • Referir URGENTEMENTE ao hospital.`;
       
    }

    if(hasDiarrDanger){
      badgeDiarr.className = "badge vermelho";
      badgeDiarr.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("diarrClassification").innerText = `Classificação: DESIDRATAÇÃO GRAVE`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Se a criança não se enquadrar em outra classificação grave:
                                  -Iniciar terapia endovenosa (Plano C).
                                  • Se a criança também se enquadrar em outra classificação grave:
                                  -Referir URGENTEMENTE ao hospital, com mãe e o profissional de saúde administrando-lhe goles frequentes de SRO durante o trajeto, se possível.
                                  -Recomendar a continuar a amamentação, se possível.
                                  • Se a criança tiver 2 ou mais anos de idade, e se houver cólera na sua região,
                                  administrar antibiótico.`;
      
    }

    if(diarrChecked.includes("inquieta") || diarrChecked.includes("bebe_avido") ){
      badgeDiarr.className = "badge amarelo";
      badgeDiarr.innerText = "🟡 ATENÇÃO";
      document.getElementById("diarrClassification").innerText = `Classificação: DESIDRATAÇÃO`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Administrar SRO na unidade de saúde até hidratar (Plano B).
                                  • Dar zinco oral por dez dias.
                                  • Informar a mãe sobre quando retornar imediatamente.
                                  • Seguimento em cinco dias, se não melhorar.
                                  • Se a criança também se enquadrar em uma classificação grave devido a outro problema:
                                  • Referir URGENTEMENTE ao hospital, com a mãe e profissional de saúde administrando-lhe goles frequentes de SRO durante o trajeto.
                                  • Recomendar à mãe que continue a amamentação, se possível.`;
      
    }

    if(diarrChecked.includes("sem_desidratacao")){
      badgeDiarr.className = "badge amarelo";
      badgeDiarr.innerText = "🟡 ATENÇÃO";
      document.getElementById("diarrClassification").innerText = `Classificação: DIARREIA PERSISTENTE`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Informar sobre como alimentar uma criança com DIARREIA PERSISTENTE.
                                  • Dar zinco oral por dez dias dias.
                                  • Informar sobre quando retornar imediatamente.
                                  • Marcar retorno em cinco dias.`;
      
    }

    if(diarrChecked.includes("sangue_nas_fezes")){
      badgeDiarr.className = "badge amarelo";
      badgeDiarr.innerText = "🟡 ATENÇÃO";
      document.getElementById("diarrClassification").innerText = `Classificação: DESINTERIA`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Dar um antibiótico recomendado em sua região para Shigella, se houver comprometimento do estado geral.
                                  • Dar zinco oral por dez dias.
                                  • Marcar o retorno em dois dias.
                                  • Informar sobre quando retornar imediatamente.`;
      
    }

    if ( diarrChecked.includes("nenhum sinal acima_diarr")) {
      badgeDiarr.className = "badge verde";
      badgeDiarr.innerText = "🟢 ESTÁVEL";
      document.getElementById("diarrClassification").innerText = `Classificação: SEM DESIDRATAÇÃO`;
      document.getElementById("diarrAdvice").innerText = `Conduta: • Dar alimentos e líquidos para tratar a diarreia em casa (Plano A).
                                  • Dar zinco oral por dez dias.
                                  • Informar a mãe sobre quando retornar imediatamente.
                                  • Seguimento em cinco dias se não melhorar.`;
      
    }
  }

  //5) Febre
  const hasFeverDanger = fevChecked.includes("rigidez_nuca") || fevChecked.includes("petequias") || fevChecked.includes("fontanela_abaulada") ;
  const hasFeverDangerMalaria = (fevChecked.includes("rigidez_nuca") || fevChecked.includes("petequias") || fevChecked.includes("fontanela_abaulada") ) && fevChecked.includes("area_risco");
  
  if(temFebre>0){
    console.log(fevChecked);
    document.getElementById("feverResult").style.display = "block";
    if(hasFeverDangerMalaria){
      badgeFebre.className = "badge vermelho";
      badgeFebre.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("feverClassification").innerText = `Classificação: MALÁRiA GRAVE OU DOENÇA FEBRIL MUiTO GRAVE`;
      document.getElementById("feverAdvice").innerText = `Conduta: • Se gota espessa/teste rápido for positivo, dar a primeira
                                    dose de um antimalárico recomendado.
                                  • Dar a primeira dose de um antibiótico recomendado.
                                  • Tratar a criança para evitar hipoglicemia.
                                  • Dar antitérmico se temperatura for ≥ 38,0º C.
                                  • Referir URGENTEMENTE ao hospital.`;
       
    }
    if(hasFeverDanger){
      badgeFebre.className = "badge vermelho";
      badgeFebre.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("feverClassification").innerText = `Classificação: DOENÇA FEBRIL MUITO GRAVE`;
      document.getElementById("feverAdvice").innerText = `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                  • Tratar a criança para evitar hipoglicemia.
                                  • Dar antitérmico se temperatura for ≥ 38,0º C.
                                  • Referir URGENTEMENTE ao hospital.`;
      
    }
    if(fevChecked.includes("nenhum_sinal_grave")){
      badgeFebre.className = "badge amarelo";
      badgeFebre.innerText = "🟡 ATENÇÃO";
      document.getElementById("feverClassification").innerText = `Classificação: MALÁRiA `;
      document.getElementById("feverAdvice").innerText = `Conduta: •  Tratar com antimalárico oral recomendado.
                                  • Dar antitérmico se temperatura for ≥38ºC.
                                  • Informar a mãe sobre quando retornar imediatamente.
                                  • Seguimento em três dias.
                                  • Se tem tido febre todos os dias por mais de cinco dias,
                                    realizar investigação.`;
      
    }
    if(fevChecked.includes("nenhum_sinal_negativo")){
      badgeFebre.className = "badge verde";
      badgeFebre.innerText = "🟢 ESTÁVEL";
      document.getElementById("feverClassification").innerText = `Classificação: DOENÇA FEBRIL`;
      document.getElementById("feverAdvice").innerText = `Conduta: • Dar antitérmico se temperatura for ≥38,0º.
                                  • Informar a mãe/pai/acompanhante sobre quando
                                  retornar imediatamente.
                                  • Seguimento em dois dias se a febre persistir.
                                  • Se tem tido febre todos os dias por mais de cinco dias,
                                  realizar investigação.`;
      
    }

  }  
  //6) Problema de ouvido

  const hasEarDanger = earChecked.includes("tumefacao_vermelhidao") ;

  if(temOuvido>0){
    console.log(earChecked);
    document.getElementById("earResult").style.display = "block";
    if(hasEarDanger){
      badgeOuvido.className = "badge vermelho";
      badgeOuvido.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("earClassification").innerText = `Classificação: MASTOIDITE`;
      document.getElementById("earAdvice").innerText = `Conduta: • Dar a primeira dose de um antibiótico recomendado.
                                  • Dar analgésico em caso de dor.
                                  • Referir URGENTEMENTE ao hospital.`;

      
    }
    if(earChecked.includes("secrecao_menos_14")){
      badgeOuvido.className = "badge amarelo";
      badgeOuvido.innerText = "🟡 ATENÇÃO";
      document.getElementById("earClassification").innerText = `Classificação: INFECÇÃO AGUDA DO OUVIDO`;
      document.getElementById("earAdvice").innerText = `Conduta: • Antibiótico recomendado por oito dias.
                                  • Dar analgésico em caso de dor.
                                  • Secar o ouvido com uma mecha se houver secreção.
                                  • Marcar o retorno com dois dias.
                                  • Orientar sinais de retorno imediato.`;
      
    }
    if(earChecked.includes("secrecao_14_ou_mais")){
      badgeOuvido.className = "badge amarelo";
      badgeOuvido.innerText = "🟡 ATENÇÃO";
      document.getElementById("earClassification").innerText = `Classificação: INFECÇÃO CRÔNICA DO OUVIDO`;
      document.getElementById("earAdvice").innerText = `Conduta: • Dar analgésico em caso de dor.
                                  • Marcar o retorno com dois dias.
                                  • Orientar sinais de retorno imediato.`;
      
    }
    if(earChecked.includes("dor_ouvido")){
      badgeOuvido.className = "badge amarelo";
      badgeOuvido.innerText = "🟡 ATENÇÃO";
      document.getElementById("earClassification").innerText = `Classificação: POSSÍVEL INFECÇÃO AGUDA DO OUVIDO`;
      document.getElementById("earAdvice").innerText = `Conduta: • Secar o ouvido com uma mecha.
                                  • Marcar o retorno com cinco dias.
                                  • Orientar sinais de retorno imediato.`;
      
    }
    if(earChecked.includes("sem_dor_sem_secrecao")){
      badgeOuvido.className = "badge verde";
      badgeOuvido.innerText = "🟢 ESTÁVEL";
      document.getElementById("earClassification").innerText = `Classificação: NÃO HÁ INFECÇÃO DO OUVIDO`;
      document.getElementById("earAdvice").innerText = `Conduta: • Nenhum tratamento adicional.`;
      
    }
  }

    //7) Problema de Garganta
  const hasThroatDanger = throatChecked.includes("sinal_perigo_geral") || throatChecked.includes("amigdalas_membranas") || throatChecked.includes("abaulamento_palato");
  
  if(temGarganta>0){
    console.log(throatChecked);
    document.getElementById("throatResult").style.display = "block";
    if(hasThroatDanger){
      badgeGarganta.className = "badge vermelho";
      badgeGarganta.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("throatClassification").innerText = `Classificação: INFECÇÃO GRAVE DA GARGANTA`;
      document.getElementById("throatAdvice").innerText = `Conduta: • Referir URGENTEMENTE ao hospital.
                                  • Dar a primeira dose de um antibiótico recomendado.`;
      
    }
    if(throatChecked.includes("ganglios_dolorosos") || throatChecked.includes("amigdalas_pontos_purulentos")){
      badgeGarganta.className = "badge amarelo";
      badgeGarganta.innerText = "🟡 ATENÇÃO";
      document.getElementById("throatClassification").innerText = `INFECÇÃO MODERADA DE GARGANTA`;
      document.getElementById("throatAdvice").innerText = `Conduta: • Dar um antibiótico recomendado.
                                  • Dar analgésico em caso de dor.
                                  • Marcar consulta de retorno com dois dias.
                                  • Informar a mãe sobre quando retornar imediatamente.`;
      
    }
    if(throatChecked.includes("vesiculas_hiperemia_resfriado")){
      badgeGarganta.className = "badge verde";
      badgeGarganta.innerText = "🟢 ESTÁVEL";
      document.getElementById("throatClassification").innerText = `Classificação: INFECÇÃO LEVE DE GARGANTA`;
      document.getElementById("throatAdvice").innerText = `Conduta: • Dar analgésico em caso dor.
                                  • Seguimento em dois dias se persistir dor de garganta.
                                  • Informar a mãe/pai/acompanhante sobre quando
                                  retornar imediatamente`;
      
    }
    if(throatChecked.includes("nenhum_sinal")){
      badgeGarganta.className = "badge verde";
      badgeGarganta.innerText = "🟢 ESTÁVEL";
      document.getElementById("throatClassification").innerText = `Classificação: NÃO HÁ INFECÇÃO DE GARGANTA`;
      document.getElementById("throatAdvice").innerText = `Conduta: • Nenhum tratamento adicional.`;
      
    }
  }
  //7) Problema Nutricional

  const hasNutDanger = nutChecked.includes("edema_ambos_pes") || nutChecked.includes("emagrecimento_acentuado") ;
  const hasAnemiaDanger = nutChecked.includes("palidez_palmar_grave");
  
  if(temNutricao>0){
    console.log(nutChecked);
    document.getElementById("nutResult").style.display = "block";
    if(hasNutDanger){
      badgeNutricao.className = "badge vermelho";
      badgeNutricao.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("nutClassification").innerText = `Classificação: DESNUTRIÇÃO GRAVE`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Prevenir, controlar e, se necessário, tratar a hipoglicemia.
                                  • Prevenir a hipotermia (manter a criança agasalhada).
                                  • Dar megadose de vitamina A, se a criança não tiver tomado nos
                                  últimos 30 dias.
                                  • Referir URGENTEMENTE ao hospital.`;
    }
    if(hasAnemiaDanger){
      badgeNutricao.className = "badge vermelho";
      badgeNutricao.innerText = "🔴 EMERGÊNCIA";
      document.getElementById("nutClassification").innerText = `Classificação: ANEMIA GRAVE`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Referir URGENTEMENTE ao hospital.`;
    }
    if(nutChecked.includes("peso_idade_menor_menos3")){
      badgeNutricao.className = "badge amarelo";
      badgeNutricao.innerText = "🟡 ATENÇÃO";
      document.getElementById("nutClassification").innerText = `Classificação: PESO MUITO ABAIXO`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Avaliar a alimentação da criança e as possíveis causas de desnutrição.
                                  • Aconselhar a mãe/pai/acompanhante a tratar a criança de acordo com
                                  as dietas especiais.
                                  • Dar megadose de vitamina A, se a criança não tiver tomado nos
                                  últimos 30 dias.
                                  • Uso profilático de ferro em menores de 24 meses.
                                  • Retorno com cinco dias.
                                  • Orientar sinais de retorno imediato.`;
    }
    if(nutChecked.includes("peso_idade_menor_menos2") || nutChecked.includes("tendencia_curva_descendente")){
      badgeNutricao.className = "badge amarelo";
      badgeNutricao.innerText = "🟡 ATENÇÃO";
      document.getElementById("nutClassification").innerText = `Classificação: PESO ABAIXO OU GANHO DE PESO INSUFICIENTE`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Avaliar a alimentação da criança e as possíveis causas do peso baixo.
                                  • Orientar a alimentação adequada.
                                  • Uso profilático de ferro em menores de 24 meses.
                                  • Marcar retorno com duas semanas.
                                  • Orientar sinais de retorno imediato.`;
    }
    if(nutChecked.includes("peso_idade_maior_mais2")){
      badgeNutricao.className = "badge amarelo";
      badgeNutricao.innerText = "🟡 ATENÇÃO";
      document.getElementById("nutClassification").innerText = `Classificação: PESO ELEVADO`;
      document.getElementById("nutAdvice").innerText = `Conduta: • valiar a alimentação da criança e as possíveis causas do peso elevado.
                                  • Orientar a alimentação adequada.
                                  • Verificar e estimular a prática de atividade física.
                                  • Uso profilático de ferro em menores de 24 meses.
                                  • Marcar o retorno com duas semanas.
                                  • Orientar sinais de retorno realizando o diagnóstico do estado nutricional.`;
    }
    if(nutChecked.includes("peso_idade_entre_menos2_mais2")){
      badgeNutricao.className = "badge verde";
      badgeNutricao.innerText = "🟢 ESTÁVEL";
      document.getElementById("nutClassification").innerText = `Classificação: PESO ADEQUADO`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Elogiar a mãe/pai/acompanhante pelo crescimento de seu filho.
                                  • Reforçar as recomendações para alimentação saudável, de acordo com o
                                  Quadro de Recomendações a respeito da alimentação da criança.
                                  • Uso profilático de ferro em menores de 24 meses.`;
    }
    if(nutChecked.includes("palidez_palmar_leve")){
      badgeNutricao.className = "badge amarelo";
      badgeNutricao.innerText = "🟡 ATENÇÃO";
      document.getElementById("nutClassification").innerText = `Classificação: ANEMIA`;
      document.getElementById("nutAdvice").innerText = `Conduta: • Realizar tratamento com ferro.
                                  • Realizar teste de malária em área de risco.
                                  • Dar anti-helmíntico se a criança tiver um ano ou mais e não tiver
                                  tomado nenhuma dose nos últimos 6 meses.
                                  • Avaliar a alimentação da criança e orientar a mãe/pai/acompanhante
                                  sobre alimentos ricos em ferro.
                                  • Marcar retorno com 14 dias.`;
      
    }

  }

  
  // 6) Caso leve / sem sinais de gravidade -> verde
  // badge.classList.add("verde");
  // badge.innerText = "🟢 ESTÁVEL";
  // classificationText.innerText = `Classificação: Sem sinais de gravidade`;
  // advice.innerText = `Conduta: Tratamento domiciliar, orientar sinais de alarme e retorno imediato se houver piora. Observações: ${obs || '—'}`;
}


//Não uso mais, depois excluir
// /* Salva resumo simples no localStorage (lista de atendimentos) */
// function saveToLocal() {
//   const nome = document.getElementById("nome").value.trim() || "sem-nome";
//   const data = {
//     timestamp: new Date().toISOString(),
//     nome,
//     idade: document.getElementById("idade").value.trim(),
//     rr: document.getElementById("rr").value || null,
//     o2: document.getElementById("o2").value || null,
//     resultAt: document.getElementById("classificationText").innerText,
//     notes: document.getElementById("obs").value || ""
//   };
//   const key = "aidp_atendimentos_v1";
//   const list = JSON.parse(localStorage.getItem(key) || "[]");
//   list.push(data);
//   localStorage.setItem(key, JSON.stringify(list));
//   alert("Atendimento salvo localmente no navegador.");
// }

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