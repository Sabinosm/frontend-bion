import { preencherPainelPerfil } from "./preencherPerfil.js";
import { iniciarMonitoramentoSessao } from "../../auth/logic/watchSession.js";

document.addEventListener("DOMContentLoaded", () => {
  const bruto = sessionStorage.getItem("bion-dados-usuario");
  if (!bruto) {
    // sessionStorage vazio = chegou aqui sem passar pelo afterLogin
    // (ex: digitou a URL direto). Mais seguro mandar pro login.
    window.location.href = "../../../auth/login.html";
    return;
  }

  const dados = JSON.parse(bruto);
  preencherPainelPerfil(dados);
  iniciarMonitoramentoSessao();
});