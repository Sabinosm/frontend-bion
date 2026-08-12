// afterLogin.js
//
// Ponto de chegada depois do callback do Google OAuth
// (oauth.py -> google_callback redireciona para cá).
//
// oauth.py não manda o estado da sessão na URL -- ele fica no cookie
// httpOnly. Por isso, o primeiro passo aqui é sempre consultar
// /auth/status para saber o que fazer em seguida:
//   - "mfa_pendente"       -> pedir confirmação WebAuthn
//   - "onboarding_pendente" -> mandar para a página de onboarding
//   - "completa"           -> sessão já pronta, ir para o dashboard
//   - qualquer outra coisa / erro -> volta para o login

import { confirmarSegundoFator } from "./webauthn.js";
import { exibirMensagem } from "../../../shared/feedback.js";
import { URL_BASE_API } from "../../../config.js";

const botaoTentarNovamente = document.getElementById("btn-tentar-novamente");

// pageshow dispara tanto no carregamento normal quanto quando a
// página é restaurada do bfcache do navegador (ex.: botão "voltar"
// depois de já ter saído desta página). DOMContentLoaded sozinho não
// dispara nesse segundo caso, o que deixava o spinner girando pra
// sempre -- a checagem de status nunca era refeita.
window.addEventListener("pageshow", async () => {
  await tratarPosLogin();
});

botaoTentarNovamente.addEventListener("click", async () => {
  botaoTentarNovamente.hidden = true;
  await tratarMfaPendente();
});

async function tratarPosLogin() {
  let statusData;

  try {
    const resp = await fetch(`${URL_BASE_API}/auth/status`, {
      method: "GET",
      credentials: "include", // envia o cookie httpOnly de sessão
    });

    if (!resp.ok) {
      // Sessão inválida/expirada -- volta para o login.  
      window.location.href = "/html/pages/auth/login.html";
      return;
    }

    statusData = await resp.json();
  } catch (erro) {
    console.error("Erro ao verificar status da sessão:", erro);
    exibirMensagem("Não foi possível verificar sua sessão. Tente entrar novamente.", "erro");
    setTimeout(() => { window.location.href = "/html/pages/auth/login.html"; }, 2000);
    return;
  }

  switch (statusData?.status) {
    case "mfa_pendente":
      await tratarMfaPendente();
      break;

    case "onboarding_pendente": {
      const senhaJaDefinida = statusData?.senha_definida ? "1" : "0";
      window.location.href = `/html/pages/auth/onboarding.html?senha_definida=${senhaJaDefinida}`;
      break;
    }

    case "completa":
      window.location.href = "/html/pages/auth/inicio.html";
      break;

    default:
      // Estado inesperado -- não assumimos sucesso silenciosamente.
      console.error("Status de sessão desconhecido:", statusData?.status);
      window.location.href = "/html/pages/auth/login.html";
  }
}

async function tratarMfaPendente() {
  exibirMensagem("Confirme sua identidade para continuar...", "info");

  try {
    await confirmarSegundoFator();
    exibirMensagem("Login realizado com sucesso!", "sucesso");
    window.location.href = "/html/pages/auth/inicio.html";
  } catch (erro) {
    console.error("Falha na confirmação de identidade:", erro);
    exibirMensagem(
      erro.message || "Não foi possível confirmar sua identidade. Tente novamente.",
      "erro"
    );
    botaoTentarNovamente.hidden = false;
  }
}