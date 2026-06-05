import { auth }
from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const email =
  document.getElementById("email");

const senha =
  document.getElementById("senha");

const mensagem =
  document.getElementById("mensagem");

document
.getElementById("cadastroBtn")
.addEventListener("click", async () => {

  try {

    await createUserWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );

    mensagem.innerText =
      "Conta criada com sucesso!";

  }

  catch (erro) {

    mensagem.innerText =
      erro.message;

  }

});

document
.getElementById("loginBtn")
.addEventListener("click", async () => {

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );

    window.location.href =
      "index.html";

  }

  catch (erro) {

    mensagem.innerText =
      erro.message;

  }

});