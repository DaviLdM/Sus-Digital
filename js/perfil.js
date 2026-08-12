/* =========================================================
   js/perfil.js
   Carrega e atualiza o perfil do usuário.
========================================================= */

import {
  auth,
  db
} from "./firebase.js";


import {
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";



/* =========================
   ELEMENTOS
========================= */

const form =
  document.getElementById(
    "profileForm"
  );


const primeiroNomeInput =
  document.getElementById(
    "primeiroNome"
  );


const sobrenomeInput =
  document.getElementById(
    "sobrenome"
  );


const profissaoInput =
  document.getElementById(
    "profissao"
  );


const ubsInput =
  document.getElementById(
    "ubs"
  );


const hospitalInput =
  document.getElementById(
    "hospitalReferencia"
  );


const emailInput =
  document.getElementById(
    "email"
  );


const novaSenhaInput =
  document.getElementById(
    "novaSenha"
  );


const confirmarNovaSenhaInput =
  document.getElementById(
    "confirmarNovaSenha"
  );


const senhaAtualInput =
  document.getElementById(
    "senhaAtual"
  );


const reauthBox =
  document.getElementById(
    "reauthBox"
  );


const saveButton =
  document.getElementById(
    "saveProfileBtn"
  );


const discardButton =
  document.getElementById(
    "discardBtn"
  );


const message =
  document.getElementById(
    "profileMessage"
  );


const saveState =
  document.getElementById(
    "saveState"
  );


const summaryName =
  document.getElementById(
    "profileSummaryName"
  );


const summaryProfession =
  document.getElementById(
    "profileSummaryProfession"
  );


const summaryUbs =
  document.getElementById(
    "profileSummaryUbs"
  );


const summaryHospital =
  document.getElementById(
    "profileSummaryHospital"
  );


const summaryEmail =
  document.getElementById(
    "profileSummaryEmail"
  );


const profileAvatar =
  document.getElementById(
    "profileAvatar"
  );



/* =========================
   ESTADO LOCAL
========================= */

let usuarioAtual = null;

let dadosOriginais = null;



/* =========================
   AUXILIARES
========================= */

function texto(
  elemento,
  valor
) {

  if (elemento) {
    elemento.textContent =
      valor;
  }

}


function mostrarMensagem(
  valor,
  tipo = ""
) {

  if (!message) {
    return;
  }


  message.textContent =
    valor || "";


  message.className =
    "profile-message";


  if (
    valor &&
    tipo
  ) {
    message.classList.add(
      tipo
    );
  }

}


function normalizarEmail(
  valor
) {

  return String(
    valor || ""
  )
    .trim()
    .toLowerCase();

}


function gerarIniciais(
  nome
) {

  if (!nome) {
    return "US";
  }


  const ignorar = [
    "da",
    "de",
    "do",
    "das",
    "dos",
    "e"
  ];


  const palavras =
    String(nome)
      .trim()
      .split(/\s+/)
      .filter(
        palavra =>
          palavra &&
          !ignorar.includes(
            palavra.toLowerCase()
          )
      );


  if (
    palavras.length === 0
  ) {
    return "US";
  }


  if (
    palavras.length === 1
  ) {
    return palavras[0][0]
      .toUpperCase();
  }


  return (
    palavras[0][0] +
    palavras[
      palavras.length - 1
    ][0]
  ).toUpperCase();

}


function traduzirErro(
  erro
) {

  const mensagens = {

    "auth/wrong-password":
      "A senha atual está incorreta.",

    "auth/invalid-credential":
      "A senha atual está incorreta.",

    "auth/requires-recent-login":
      "Por segurança, confirme sua senha atual para realizar esta alteração.",

    "auth/email-already-in-use":
      "Este e-mail já está sendo utilizado por outra conta.",

    "auth/invalid-email":
      "Digite um endereço de e-mail válido.",

    "auth/weak-password":
      "A nova senha deve possuir pelo menos 6 caracteres.",

    "auth/too-many-requests":
      "Muitas tentativas foram realizadas. Aguarde um pouco e tente novamente.",

    "auth/network-request-failed":
      "Não foi possível conectar ao servidor. Verifique sua conexão.",

    "auth/operation-not-allowed":
      "Esta alteração não está habilitada no Firebase Authentication."

  };


  return (
    mensagens[
      erro?.code
    ] ||
    "Não foi possível salvar as alterações. Tente novamente."
  );

}


function obterDadosFormulario() {

  const primeiroNome =
    primeiroNomeInput
      ?.value
      .trim() ||
    "";


  const sobrenome =
    sobrenomeInput
      ?.value
      .trim() ||
    "";


  const nomeCompleto =
    `${primeiroNome} ${sobrenome}`
      .trim();


  return {

    primeiroNome,

    sobrenome,

    nomeCompleto,

    profissao:
      profissaoInput
        ?.value ||
      "",

    ubs:
      ubsInput
        ?.value
        .trim() ||
      "",

    hospitalReferencia:
      hospitalInput
        ?.value
        .trim() ||
      "",

    email:
      emailInput
        ?.value
        .trim() ||
      ""

  };

}


function atualizarResumo(
  dados
) {

  texto(
    summaryName,
    dados.nomeCompleto ||
    "Usuário"
  );


  texto(
    summaryProfession,
    dados.profissao ||
    "Profissional de saúde"
  );


  texto(
    summaryUbs,
    dados.ubs ||
    "Unidade não cadastrada"
  );


  texto(
    summaryHospital,
    dados.hospitalReferencia ||
    "Hospital não cadastrado"
  );


  texto(
    summaryEmail,
    dados.email ||
    "E-mail não informado"
  );


  texto(
    profileAvatar,
    gerarIniciais(
      dados.nomeCompleto
    )
  );

}


function precisaReautenticar() {

  if (
    !usuarioAtual ||
    !dadosOriginais
  ) {
    return false;
  }


  const emailMudou =
    normalizarEmail(
      emailInput?.value
    ) !==
    normalizarEmail(
      usuarioAtual.email
    );


  const senhaFoiPreenchida =
    Boolean(
      novaSenhaInput
        ?.value
    ) ||
    Boolean(
      confirmarNovaSenhaInput
        ?.value
    );


  return (
    emailMudou ||
    senhaFoiPreenchida
  );

}


function atualizarVisibilidadeReautenticacao() {

  if (!reauthBox) {
    return;
  }


  reauthBox.hidden =
    !precisaReautenticar();

}


async function reautenticar() {

  if (
    !usuarioAtual?.email
  ) {
    throw new Error(
      "Usuário sem e-mail autenticado."
    );
  }


  const senhaAtual =
    senhaAtualInput
      ?.value;


  if (!senhaAtual) {

    const erro =
      new Error(
        "Senha atual necessária."
      );

    erro.code =
      "auth/requires-recent-login";

    throw erro;
  }


  const credencial =
    EmailAuthProvider
      .credential(
        usuarioAtual.email,
        senhaAtual
      );


  await reauthenticateWithCredential(
    usuarioAtual,
    credencial
  );

}



/* =========================
   CARREGAR PERFIL
========================= */

async function carregarPerfil(
  usuario
) {

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


  if (
    !snapshot.exists()
  ) {
    throw new Error(
      "Perfil não encontrado no Firestore."
    );
  }


  const dados =
    snapshot.data();


  /*
   * O Authentication é a fonte de verdade do e-mail.
   *
   * Se o usuário confirmou uma troca de e-mail pelo link
   * enviado pelo Firebase, sincronizamos automaticamente
   * o novo e-mail com o documento no Firestore.
   */
  const emailAuth =
    usuario.email ||
    dados.email ||
    "";


  if (
    emailAuth &&
    normalizarEmail(
      dados.email
    ) !==
    normalizarEmail(
      emailAuth
    )
  ) {

    try {

      await updateDoc(
        referencia,
        {
          email:
            emailAuth,

          atualizadoEm:
            serverTimestamp()
        }
      );

    } catch (erro) {

      console.warn(
        "Não foi possível sincronizar o e-mail com o Firestore:",
        erro
      );

    }

  }


  const primeiroNome =
    dados.primeiroNome
      ?.trim() ||
    dados.nomeCompleto
      ?.trim()
      .split(/\s+/)[0] ||
    "";


  const sobrenome =
    dados.sobrenome
      ?.trim() ||
    "";


  const nomeCompleto =
    dados.nomeCompleto
      ?.trim() ||
    `${primeiroNome} ${sobrenome}`
      .trim();


  dadosOriginais = {

    primeiroNome,

    sobrenome,

    nomeCompleto,

    profissao:
      dados.profissao ||
      "",

    ubs:
      dados.ubs ||
      "",

    hospitalReferencia:
      dados.hospitalReferencia ||
      "",

    email:
      emailAuth

  };


  primeiroNomeInput.value =
    dadosOriginais.primeiroNome;


  sobrenomeInput.value =
    dadosOriginais.sobrenome;


  profissaoInput.value =
    dadosOriginais.profissao;


  ubsInput.value =
    dadosOriginais.ubs;


  hospitalInput.value =
    dadosOriginais.hospitalReferencia;


  emailInput.value =
    dadosOriginais.email;


  novaSenhaInput.value =
    "";


  confirmarNovaSenhaInput.value =
    "";


  senhaAtualInput.value =
    "";


  atualizarResumo(
    dadosOriginais
  );


  atualizarVisibilidadeReautenticacao();


  texto(
    saveState,
    "Perfil carregado"
  );


  setTimeout(
    () => {

      if (
        saveState
          ?.textContent ===
        "Perfil carregado"
      ) {

        saveState.textContent =
          "";

      }

    },
    1800
  );

}



/* =========================
   AUTH
========================= */

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

      await carregarPerfil(
        usuario
      );

    } catch (erro) {

      console.error(
        "Erro ao carregar perfil:",
        erro
      );


      mostrarMensagem(
        "Não foi possível carregar os dados do seu perfil.",
        "error"
      );

    }

  }
);



/* =========================
   DETECTAR CAMPOS SENSÍVEIS
========================= */

emailInput
  ?.addEventListener(
    "input",
    atualizarVisibilidadeReautenticacao
  );


novaSenhaInput
  ?.addEventListener(
    "input",
    atualizarVisibilidadeReautenticacao
  );


confirmarNovaSenhaInput
  ?.addEventListener(
    "input",
    atualizarVisibilidadeReautenticacao
  );



/* =========================
   MOSTRAR / ESCONDER SENHA
========================= */

document
  .querySelectorAll(
    "[data-toggle-password]"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          const id =
            botao.dataset
              .togglePassword;


          const input =
            document.getElementById(
              id
            );


          if (!input) {
            return;
          }


          const mostrar =
            input.type ===
            "password";


          input.type =
            mostrar
              ? "text"
              : "password";


          botao.innerHTML =
            mostrar
              ? '<i data-lucide="eye-off"></i>'
              : '<i data-lucide="eye"></i>';


          if (
            window.lucide
          ) {

            window.lucide
              .createIcons();

          }

        }
      );

    }
  );



/* =========================
   DESCARTAR ALTERAÇÕES
========================= */

discardButton
  ?.addEventListener(
    "click",
    () => {

      if (!dadosOriginais) {
        return;
      }


      primeiroNomeInput.value =
        dadosOriginais.primeiroNome;


      sobrenomeInput.value =
        dadosOriginais.sobrenome;


      profissaoInput.value =
        dadosOriginais.profissao;


      ubsInput.value =
        dadosOriginais.ubs;


      hospitalInput.value =
        dadosOriginais
          .hospitalReferencia;


      emailInput.value =
        usuarioAtual?.email ||
        dadosOriginais.email;


      novaSenhaInput.value =
        "";


      confirmarNovaSenhaInput.value =
        "";


      senhaAtualInput.value =
        "";


      atualizarResumo(
        dadosOriginais
      );


      atualizarVisibilidadeReautenticacao();


      mostrarMensagem(
        "",
        ""
      );


      texto(
        saveState,
        "Alterações descartadas"
      );


      setTimeout(
        () => {

          if (
            saveState
              ?.textContent ===
            "Alterações descartadas"
          ) {

            saveState.textContent =
              "";

          }

        },
        1800
      );

    }
  );



/* =========================
   SALVAR PERFIL
========================= */

form
  ?.addEventListener(
    "submit",
    async (evento) => {

      evento.preventDefault();


      if (
        !usuarioAtual ||
        !dadosOriginais
      ) {
        return;
      }


      mostrarMensagem(
        "",
        ""
      );


      const dados =
        obterDadosFormulario();


      if (
        !dados.primeiroNome ||
        !dados.sobrenome ||
        !dados.profissao ||
        !dados.ubs ||
        !dados.hospitalReferencia ||
        !dados.email
      ) {

        mostrarMensagem(
          "Preencha todos os campos obrigatórios do perfil.",
          "error"
        );

        return;
      }


      const novaSenha =
        novaSenhaInput
          ?.value ||
        "";


      const confirmarNovaSenha =
        confirmarNovaSenhaInput
          ?.value ||
        "";


      if (
        novaSenha ||
        confirmarNovaSenha
      ) {

        if (
          novaSenha.length < 6
        ) {

          mostrarMensagem(
            "A nova senha deve possuir pelo menos 6 caracteres.",
            "error"
          );

          return;
        }


        if (
          novaSenha !==
          confirmarNovaSenha
        ) {

          mostrarMensagem(
            "A nova senha e a confirmação não são iguais.",
            "error"
          );

          return;
        }

      }


      const emailAtual =
        normalizarEmail(
          usuarioAtual.email
        );


      const novoEmail =
        normalizarEmail(
          dados.email
        );


      const emailMudou =
        novoEmail !==
        emailAtual;


      const senhaMudou =
        Boolean(
          novaSenha
        );


      saveButton.disabled =
        true;


      discardButton.disabled =
        true;


      saveButton.innerHTML =
        `
          <span class="button-spinner"></span>
          Salvando...
        `;


      try {

        /*
         * Alterações sensíveis precisam de
         * autenticação recente.
         */
        if (
          emailMudou ||
          senhaMudou
        ) {

          await reautenticar();

        }


        /*
         * Dados comuns do perfil.
         */
        await updateDoc(
          doc(
            db,
            "usuarios",
            usuarioAtual.uid
          ),
          {

            primeiroNome:
              dados.primeiroNome,

            sobrenome:
              dados.sobrenome,

            nomeCompleto:
              dados.nomeCompleto,

            profissao:
              dados.profissao,

            ubs:
              dados.ubs,

            hospitalReferencia:
              dados.hospitalReferencia,

            /*
             * Se o e-mail estiver sendo alterado,
             * mantemos no Firestore o e-mail autenticado atual
             * até o usuário confirmar o novo endereço.
             */
            email:
              emailMudou
                ? usuarioAtual.email
                : dados.email,

            atualizadoEm:
              serverTimestamp()

          }
        );


        /*
         * Mantém o displayName do Firebase Auth
         * coerente com o perfil do Firestore.
         */
        await updateProfile(
          usuarioAtual,
          {
            displayName:
              dados.nomeCompleto
          }
        );


        /*
         * Troca de senha.
         */
        if (
          senhaMudou
        ) {

          await updatePassword(
            usuarioAtual,
            novaSenha
          );

        }


        /*
         * Troca de e-mail:
         * o Firebase envia uma mensagem para o novo e-mail.
         * O endereço só muda após a confirmação.
         */
        if (
          emailMudou
        ) {

          await verifyBeforeUpdateEmail(
            usuarioAtual,
            dados.email
          );

        }


        dadosOriginais = {
          ...dados,

          email:
            emailMudou
              ? usuarioAtual.email
              : dados.email
        };


        atualizarResumo(
          {
            ...dados,

            email:
              emailMudou
                ? usuarioAtual.email
                : dados.email
          }
        );


        novaSenhaInput.value =
          "";


        confirmarNovaSenhaInput.value =
          "";


        senhaAtualInput.value =
          "";


        atualizarVisibilidadeReautenticacao();


        /*
         * O authState.js também usa o Firestore.
         * Recarregamos após salvar para atualizar
         * imediatamente a topbar e o avatar.
         */
        if (
          emailMudou
        ) {

          mostrarMensagem(
            "Perfil salvo. Enviamos uma confirmação para o novo e-mail. O endereço da conta será alterado depois que você confirmar o link recebido.",
            "info"
          );

        } else {

          mostrarMensagem(
            "Perfil atualizado com sucesso.",
            "success"
          );

        }


        texto(
          saveState,
          "Alterações salvas"
        );


        setTimeout(
          () => {

            /*
             * Recarrega para o authState.js refletir
             * nome, UBS e profissão atualizados.
             */
            window.location.reload();

          },
          emailMudou
            ? 2800
            : 1200
        );


      } catch (erro) {

        console.error(
          "Erro ao atualizar perfil:",
          erro
        );


        mostrarMensagem(
          traduzirErro(
            erro
          ),
          "error"
        );


        texto(
          saveState,
          ""
        );


      } finally {

        saveButton.disabled =
          false;


        discardButton.disabled =
          false;


        saveButton.innerHTML =
          `
            <i data-lucide="save"></i>
            Salvar alterações
          `;


        if (
          window.lucide
        ) {

          window.lucide
            .createIcons();

        }

      }

    }
);
