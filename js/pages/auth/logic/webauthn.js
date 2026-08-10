// webauthn.js
//
// Encapsula o fluxo de segundo fator via WebAuthn (rotas
// /webauthn/2fa/iniciar e /webauthn/2fa/confirmar). Quem chama este
// módulo não precisa conhecer navigator.credentials nem o formato das
// opções — só chama confirmarSegundoFator() e trata o resultado.

import { get } from "https://cdn.jsdelivr.net/npm/@github/webauthn-json@2.1.1/dist/esm/webauthn-json.browser-ponyfill.js";

const URL_BASE_API = "http://localhost:5000/v1/api";

/**
 * Executa o desafio WebAuthn de segundo fator: pede as opções ao
 * servidor, solicita a assinatura ao autenticador do usuário e envia
 * a resposta para confirmação.
 *
 * Pressupõe que a sessão já está em estado `mfa_pendente` (ou seja,
 * chamado depois de login por senha ou callback do Google).
 *
 * @returns {Promise<{id_usuario: number, email: string, id_empresa: number}>}
 *   Dados da sessão confirmada.
 * @throws {Error} Se o usuário não tiver credencial cadastrada, a
 *   assinatura for inválida, ou o usuário cancelar o prompt do
 *   autenticador (ex.: fechar a caixa de diálogo do navegador).
 */
export async function confirmarSegundoFator() {
  const resp = await fetch(`${URL_BASE_API}/webauthn/2fa/iniciar`, {
    method: "POST",
    credentials: "include",
  });

  if (!resp.ok) {
    const erroDados = await resp.json().catch(() => ({}));
    throw new Error(erroDados.erro || "Não foi possível iniciar a confirmação de identidade.");
  }

  const options = await resp.json();

  // navigator.credentials.get() lança automaticamente se o usuário
  // cancelar o prompt (NotAllowedError) ou não houver autenticador
  // disponível -- deixamos propagar para quem chamou tratar.
  const credencial = await get({ publicKey: options });

  const confirmResp = await fetch(`${URL_BASE_API}/webauthn/2fa/confirmar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credencial),
  });

  if (!confirmResp.ok) {
    const erroDados = await confirmResp.json().catch(() => ({}));
    throw new Error(erroDados.erro || "Falha na confirmação de identidade.");
  }

  return confirmResp.json();
}