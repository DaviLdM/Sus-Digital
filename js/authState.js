import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const guestMenu = document.getElementById("guestMenu");
const userMenu = document.getElementById("userMenu");
const userName = document.getElementById("userName");

const homePrimeiroNome =
  document.getElementById("homePrimeiroNome");

const homeNomeCompleto =
  document.getElementById("homeNomeCompleto");

const homeProfissao =
  document.getElementById("homeProfissao");

const homeUbs =
  document.getElementById("homeUbs");


function definirTexto(elemento, texto) {
  if (elemento) {
    elemento.textContent = texto;
  }
}


function formatarProfissao(profissao) {
  if (!profissao) {
    return "Profissional de saúde";
  }

  return profissao;
}


async function carregarPerfilUsuario(usuario) {
  try {
    const referenciaUsuario =
      doc(db, "usuarios", usuario.uid);

    const snapshotUsuario =
      await getDoc(referenciaUsuario);

    if (!snapshotUsuario.exists()) {
      console.warn(
        "O usuário está autenticado, mas não possui perfil na coleção usuarios."
      );

      definirTexto(
        homePrimeiroNome,
        usuario.email?.split("@")[0] || "usuário"
      );

      definirTexto(
        homeNomeCompleto,
        usuario.email || "Usuário"
      );

      definirTexto(
        homeProfissao,
        "Profissional de saúde"
      );

      definirTexto(
        homeUbs,
        "Unidade não cadastrada"
      );

      if (userName) {
        userName.textContent =
          `Olá, ${usuario.email || "usuário"}`;
      }

      return;
    }

    const dadosUsuario =
      snapshotUsuario.data();

    const primeiroNome =
      dadosUsuario.primeiroNome?.trim() ||
      dadosUsuario.nomeCompleto?.trim().split(/\s+/)[0] ||
      "usuário";

    const sobrenome =
      dadosUsuario.sobrenome?.trim() || "";

    const nomeCompleto =
      dadosUsuario.nomeCompleto?.trim() ||
      `${primeiroNome} ${sobrenome}`.trim();

    function gerarIniciais(nome) {

        if (!nome) return "US";

        const ignorar = [
            "da",
            "de",
            "do",
            "das",
            "dos",
            "e"
        ];

        const palavras = nome
            .trim()
            .split(/\s+/)
            .filter(p => !ignorar.includes(p.toLowerCase()));

        if (palavras.length === 1) {
            return palavras[0][0].toUpperCase();
        }

        return (
            palavras[0][0] +
            palavras[palavras.length - 1][0]
        ).toUpperCase();
    }

    const profissao =
      formatarProfissao(dadosUsuario.profissao);

    const homeAvatar = document.getElementById("homeAvatar");

    const ubs =
      dadosUsuario.ubs?.trim() ||
      "Unidade não cadastrada";

    definirTexto(
      homePrimeiroNome,
      primeiroNome
    );

    definirTexto(
      homeNomeCompleto,
      nomeCompleto
    );

    definirTexto(
        homeAvatar,
        gerarIniciais(nomeCompleto)
    );

    definirTexto(
      homeProfissao,
      profissao
    );

    definirTexto(
      homeUbs,
      ubs
    );

    if (userName) {
      userName.textContent =
        `Olá, ${primeiroNome}`;
    }

  } catch (erro) {
    console.error(
      "Erro ao carregar os dados do usuário:",
      erro
    );

    definirTexto(
      homePrimeiroNome,
      usuario.email?.split("@")[0] || "usuário"
    );

    definirTexto(
      homeNomeCompleto,
      usuario.email || "Usuário"
    );

    definirTexto(
      homeProfissao,
      "Profissional de saúde"
    );

    definirTexto(
      homeUbs,
      "Não foi possível carregar a UBS"
    );
  }
}


onAuthStateChanged(auth, async (usuario) => {
  if (usuario) {
    if (guestMenu) {
      guestMenu.style.display = "none";
    }

    if (userMenu) {
      userMenu.style.display = "flex";
    }

    await carregarPerfilUsuario(usuario);

  } else {
    if (guestMenu) {
      guestMenu.style.display = "flex";
    }

    if (userMenu) {
      userMenu.style.display = "none";
    }

    definirTexto(
      homePrimeiroNome,
      "visitante"
    );

    definirTexto(
      homeNomeCompleto,
      "Visitante"
    );

    definirTexto(
      homeProfissao,
      "Acesso não autenticado"
    );

    definirTexto(
      homeUbs,
      "Entre para visualizar sua unidade"
    );
  }
});