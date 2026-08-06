// feedback.js
//
// Helper compartilhado para exibir mensagens de feedback ao usuário
// (erro, sucesso, info) de forma segura contra XSS. Usado em login,
// onboarding e pós-login.
//
// Uso:
//   import { exibirMensagem } from "/js/shared/feedback.js";
//   exibirMensagem("Login realizado com sucesso!", "sucesso");
//
// Requer um elemento no HTML com id="mensagemFeedback".

export function exibirMensagem(texto, tipo) {
  const feedback = document.getElementById("mensagemFeedback");
  if (!feedback) {
    console.warn('exibirMensagem: elemento #mensagemFeedback não encontrado na página.');
    return;
  }
  feedback.textContent = texto; // textContent impede injeção de HTML malicioso (XSS)
  feedback.className = tipo;
}