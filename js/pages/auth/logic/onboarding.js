// onboarding.js
//
// Fluxo de primeiro acesso, chamado quando a sessão está em estado
// `onboarding_pendente` (login via Google, usuário ainda sem senha
// nem credencial WebAuthn cadastradas).
//
// Ordem forçada pelo backend: 1) definir senha, 2) cadastrar WebAuthn.
// A UI segue a mesma ordem, mostrando um passo de cada vez.

import { create } from "https://cdn.jsdelivr.net/npm/@github/webauthn-json@2.1.1/dist/esm/webauthn-json.browser-ponyfill.js";
import { exibirMensagem } from "../../../shared/feedback.js";

const URL_BASE_API = "http://127.0.0.1:5000/v1/api";

const passoSenha = document.getElementById("passo-senha");
const passoWebauthn = document.getElementById("passo-webauthn");
const formSenha = document.getElementById("form-senha");
const botaoCadastrarWebauthn = document.getElementById("btn-cadastrar-webauthn");
const dot1 = document.getElementById("dot-1");
const dot2 = document.getElementById("dot-2");

function mostrarPassoWebauthn() {
  passoSenha.hidden = true;
  passoWebauthn.hidden = false;
  dot1.classList.remove("active");
  dot1.classList.add("done");
  dot2.classList.add("active");
}

function mostrarPassoSenha() {
  passoWebauthn.hidden = true;
  passoSenha.hidden = false;
  dot2.classList.remove("active");
  dot1.classList.add("active");
  dot1.classList.remove("done");
}

// A URL (?senha_definida=) é só um hint de UX vindo do afterLogin.js,
// não a fonte de verdade -- o usuário pode editá-la livremente. Quem
// decide de fato qual passo mostrar é o servidor, consultado aqui via
// /auth/status -- a mesma rota que afterLogin.js já usa para decidir o
// estado da sessão. Evita, por exemplo, alguém com senha já definida
// forçar de volta o passo 1 mexendo na URL, e evita duplicar essa
// lógica em uma rota só para onboarding.
await sincronizarPasso();

async function sincronizarPasso() {
  try {
    const resp = await fetch(`${URL_BASE_API}/auth/status`, {
      method: "GET",
      credentials: "include",
    });

    if (!resp.ok) {
      // Sessão inválida/expirada -- volta para o login.
      window.location.href = "/html/pages/auth/login.html";
      return;
    }

    const dados = await resp.json();

    if (dados.status !== "onboarding_pendente") {
      // Sessão não está mais em onboarding (ex.: concluído em outra
      // aba, ou ainda precisa de MFA) -- deixa o afterLogin decidir o
      // destino certo em vez de assumir aqui.
      window.location.href = "/html/pages/auth/afterLogin.html";
      return;
    }

    if (dados.senha_definida) {
      mostrarPassoWebauthn();
    } else {
      mostrarPassoSenha();
    }
  } catch (erro) {
    console.error("Erro ao verificar etapa do onboarding:", erro);
    exibirMensagem("Não foi possível carregar seu progresso. Recarregue a página.", "erro");
  }
}

formSenha.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(formSenha);
  const senha = formData.get("senha");

  try {
    await definirSenha(senha);
    exibirMensagem("Senha definida com sucesso. Agora cadastre seu dispositivo.", "sucesso");
    mostrarPassoWebauthn();
  } catch (erro) {
    console.error("Falha ao definir senha:", erro);
    exibirMensagem(erro.message || "Não foi possível definir a senha.", "erro");
  }
});

botaoCadastrarWebauthn.addEventListener("click", async () => {
  try {
    await cadastrarWebauthn();
    exibirMensagem("Cadastro concluído! Redirecionando...", "sucesso");
    window.location.href = "/html/pages/inicio.html";
  } catch (erro) {
    console.error("Falha ao cadastrar WebAuthn:", erro);
    exibirMensagem(erro.message || "Não foi possível cadastrar seu dispositivo. Tente novamente.", "erro");
  }
});

/**
 * Envia a nova senha para /onboarding/definir-senha.
 * Lança erro com a mensagem do backend em caso de senha inválida.
 */
async function definirSenha(senha) {
  const resp = await fetch(`${URL_BASE_API}/onboarding/definir-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ senha }),
  });

  const dados = await resp.json();

  if (!resp.ok) {
    // validar_senha() devolve o motivo específico da invalidação
    throw new Error(dados.erro || dados.message || "Senha inválida.");
  }

  return dados;
}

/**
 * Executa o fluxo completo de registro WebAuthn:
 * pede as opções de criação -> navigator.credentials.create() ->
 * envia a credencial nova para confirmação.
 */
async function cadastrarWebauthn() {
  const respIniciar = await fetch(`${URL_BASE_API}/onboarding/webauthn/iniciar`, {
    method: "POST",
    credentials: "include",
  });

  if (!respIniciar.ok) {
    const erroDados = await respIniciar.json().catch(() => ({}));
    if (erroDados.erro === "defina_senha_primeiro") {
      // Não deveria acontecer nesta UI (passo 1 já concluído), mas se
      // acontecer, volta o usuário para o passo de senha em vez de
      // travar silenciosamente.
      mostrarPassoSenha();
      throw new Error("Defina sua senha antes de cadastrar o dispositivo.");
    }
    throw new Error(erroDados.erro || "Não foi possível iniciar o cadastro do dispositivo.");
  }

  const options = await respIniciar.json();

  // create() (não get()): aqui é registro de credencial nova, não
  // autenticação com uma já existente.
  const credencial = await create({ publicKey: options });

  const respConcluir = await fetch(`${URL_BASE_API}/onboarding/webauthn/concluir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credencial),
  });

  if (!respConcluir.ok) {
    const erroDados = await respConcluir.json().catch(() => ({}));
    throw new Error(erroDados.erro || "Falha ao concluir o cadastro do dispositivo.");
  }

  return respConcluir.json();
}