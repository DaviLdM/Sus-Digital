import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const email = document.getElementById("email");
const senha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

const cadastroBtn = document.getElementById("cadastroBtn");
const loginBtn = document.getElementById("loginBtn");
const recuperarSenhaBtn = document.getElementById("recuperarSenhaBtn");


/* =========================
   FUNÇÕES AUXILIARES
========================= */

function mostrarMensagem(texto, tipo = "") {
  if (!mensagem) {
    return;
  }

  mensagem.innerText = texto;
  mensagem.classList.remove("erro", "sucesso");

  if (tipo) {
    mensagem.classList.add(tipo);
  }
}


function traduzirErroFirebase(codigo) {
  const mensagens = {
    "auth/email-already-in-use":
      "Este e-mail já está cadastrado.",

    "auth/invalid-email":
      "Digite um endereço de e-mail válido.",

    "auth/weak-password":
      "A senha deve possuir pelo menos 6 caracteres.",

    "auth/missing-password":
      "Digite uma senha.",

    "auth/invalid-credential":
      "E-mail ou senha incorretos.",

    "auth/user-not-found":
      "Não foi possível localizar uma conta com esse e-mail.",

    "auth/wrong-password":
      "E-mail ou senha incorretos.",

    "auth/user-disabled":
      "Esta conta foi desativada.",

    "auth/operation-not-allowed":
      "Esta operação não está habilitada.",

    "auth/too-many-requests":
      "Muitas solicitações foram realizadas. Aguarde e tente novamente.",

    "auth/network-request-failed":
      "Não foi possível conectar ao servidor. Verifique sua internet."
  };

  return mensagens[codigo] ||
    "Não foi possível concluir a operação. Tente novamente.";
}


/* =========================
   CADASTRO
========================= */

if (cadastroBtn) {
  cadastroBtn.addEventListener("click", async (evento) => {
    evento.preventDefault();

    const primeiroNome =
      document.getElementById("primeiroNome")?.value.trim();
    
    const sobrenome =
      document.getElementById("sobrenome")?.value.trim();

    const nomeCompleto = `${primeiroNome} ${sobrenome}`.trim();

    const profissao =
      document.getElementById("profissao")?.value;

    const ubs =
      document.getElementById("ubs")?.value.trim();

    const confirmarSenha =
      document.getElementById("confirmarSenha")?.value;

    const emailInformado = email?.value.trim();
    const senhaInformada = senha?.value;

    mostrarMensagem("");

    if (
      !primeiroNome ||
      !sobrenome ||
      !profissao ||
      !ubs ||
      !emailInformado ||
      !senhaInformada ||
      !confirmarSenha

    ) {
      mostrarMensagem(
        "Preencha todos os campos do cadastro.",
        "erro"
      );
      return;
    }

    if (senhaInformada.length < 6) {
      mostrarMensagem(
        "A senha deve possuir pelo menos 6 caracteres.",
        "erro"
      );
      return;
    }

    if (senhaInformada !== confirmarSenha) {
      mostrarMensagem(
        "As senhas informadas não são iguais.",
        "erro"
      );
      return;
    }

    cadastroBtn.disabled = true;
    cadastroBtn.innerText = "Criando conta...";

    let usuarioCriado = null;

    try {
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          emailInformado,
          senhaInformada
        );

      usuarioCriado = credencial.user;

      await setDoc(
        doc(db, "usuarios", usuarioCriado.uid),
        {
          primeiroNome,
          sobrenome,
          nomeCompleto,
          profissao,
          ubs,
          email: usuarioCriado.email,
          criadoEm: serverTimestamp()
        }
      );

      mostrarMensagem(
        "Conta criada com sucesso! Redirecionando...",
        "sucesso"
      );

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);

    } catch (erro) {
      console.error("Erro durante o cadastro:", erro);

      /*
       * Caso a conta tenha sido criada no Authentication,
       * mas o Firestore falhe, removemos a conta incompleta.
       */
      if (usuarioCriado) {
        try {
          await deleteUser(usuarioCriado);
        } catch (erroRemocao) {
          console.error(
            "Não foi possível remover a conta incompleta:",
            erroRemocao
          );
        }
      }

      mostrarMensagem(
        traduzirErroFirebase(erro.code),
        "erro"
      );

      cadastroBtn.disabled = false;
      cadastroBtn.innerText = "Criar conta";
    }
  });
}


/* =========================
   LOGIN
========================= */

if (loginBtn) {
  loginBtn.addEventListener("click", async (evento) => {
    evento.preventDefault();

    const emailInformado = email?.value.trim();
    const senhaInformada = senha?.value;

    mostrarMensagem("");

    if (!emailInformado || !senhaInformada) {
      mostrarMensagem(
        "Digite seu e-mail e sua senha.",
        "erro"
      );
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Entrando...";

    try {
      await signInWithEmailAndPassword(
        auth,
        emailInformado,
        senhaInformada
      );

      window.location.href = "index.html";

    } catch (erro) {
      console.error("Erro durante o login:", erro);

      mostrarMensagem(
        traduzirErroFirebase(erro.code),
        "erro"
      );

      loginBtn.disabled = false;
      loginBtn.innerText = "Entrar";
    }
  });
}

/* =========================
   RECUPERAÇÃO DE SENHA
========================= */

if (recuperarSenhaBtn) {
  recuperarSenhaBtn.addEventListener("click", async () => {
    const emailInformado = email?.value.trim();

    mostrarMensagem("");

    if (!emailInformado) {
      mostrarMensagem(
        "Digite seu e-mail para recuperar a senha.",
        "erro"
      );

      email?.focus();
      return;
    }

    recuperarSenhaBtn.disabled = true;
    recuperarSenhaBtn.innerText = "Enviando...";

    try {
      auth.useDeviceLanguage();

      await sendPasswordResetEmail(
        auth,
        emailInformado
      );

      mostrarMensagem(
        "Enviamos um link de recuperação para o seu e-mail. Verifique também a caixa de spam.",
        "sucesso"
      );

    } catch (erro) {
      console.error(
        "Erro ao enviar recuperação de senha:",
        erro
      );

      mostrarMensagem(
        traduzirErroFirebase(erro.code),
        "erro"
      );

    } finally {
      recuperarSenhaBtn.disabled = false;
      recuperarSenhaBtn.innerText =
        "Esqueci minha senha";
    }
  });
}