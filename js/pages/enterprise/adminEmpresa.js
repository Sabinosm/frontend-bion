// adminEmpresa.js
//
// Orquestra a página Empresa: busca os dados via GET /empresas/,
// popula a UI através de preencherEmpresa.js, e controla o modo de
// edição (botão "Alterar" -> campos habilitados -> "Salvar"/"Cancelar").
//
// Campos editáveis: nome_fantasia, cnes, endereco (cep/bairro/numero/
// complemento). CNPJ e razão social ficam fixos -- exigem alteração de
// registro, não fazem parte deste formulário.
//
// Reaproveita os padrões já usados no cadastro de empresa
// (enterpriseRegistration.js / enterpriseValidation.js): mesmas
// máscaras de CEP, mesmo modelo de validação por campo com
// REGRAS + mensagens de erro em #err-<id>.

import { preencherPainelEmpresa, lerFormularioEmpresa } from './preencherEmpresa.js';
import { ligarValidacaoEmTempoReal, validarFormularioEdicaoEmpresa, limparErros } from './empresaEditValidation.js';
import { URL_BASE_API } from '../../config.js';

const URL_BASE = URL_BASE_API + '/empresas/'; 

const CAMPOS_EDITAVEIS = [
  'empresa-nome-fantasia',
  'empresa-cnes',
  'empresa-cep',
  'empresa-bairro',
  'empresa-numero',
  'empresa-complemento',
];

let empresaAtual = null;

async function buscarEmpresa() {
  const resp = await fetch(URL_BASE, {
    method: 'GET',
    credentials: 'include', // sessão via cookie httpOnly, conforme a arquitetura de auth
  });

  const corpo = await resp.json().catch(() => null);

  if (!resp.ok) {
    const mensagem = corpo?.message ?? 'Não foi possível carregar os dados da empresa.';
    throw new Error(mensagem);
  }

  // Padrão json_success(data=...) do backend
  return corpo?.data ?? corpo;
}

async function atualizarEmpresa(dados) {
  const resp = await fetch(URL_BASE, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const corpo = await resp.json().catch(() => null);

  if (!resp.ok) {
    const mensagem = corpo?.message ?? 'Não foi possível atualizar os dados da empresa.';
    throw new Error(mensagem);
  }

  return corpo?.data ?? corpo;
}

// ── máscaras (mesmas do cadastro, ver enterpriseRegistration.js) ──
function ligarMascaras() {
  const cepInput = document.getElementById('empresa-cep');
  if (!cepInput) return;

  cepInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    v = v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    e.target.value = v;
  });
}

// ── alternância modo exibição / edição ─────────────────────────
function entrarModoEdicao() {
  CAMPOS_EDITAVEIS.forEach((id) => {
    const display = document.getElementById(id + '-display');
    const input = document.getElementById(id);
    if (display) display.hidden = true;
    if (input) {
      input.hidden = false;
      input.disabled = false;
    }
  });

  document.getElementById('empresa-save-bar').hidden = false;
  document.getElementById('empresa-btn-alterar').hidden = true;
}

function sairModoEdicao() {
  CAMPOS_EDITAVEIS.forEach((id) => {
    const display = document.getElementById(id + '-display');
    const input = document.getElementById(id);
    if (display) display.hidden = false;
    if (input) {
      input.hidden = true;
      input.disabled = true;
    }
  });

  document.getElementById('empresa-save-bar').hidden = true;
  document.getElementById('empresa-btn-alterar').hidden = false;
  limparErros();
}

function cancelarEdicao() {
  // Descarta o que foi digitado -- repopula os inputs com os dados
  // atuais (a última resposta válida da API), não com o estado do form.
  if (empresaAtual) preencherPainelEmpresa(empresaAtual);
  sairModoEdicao();
}

async function salvarEdicao(evento) {
  evento.preventDefault();

  if (!validarFormularioEdicaoEmpresa()) {
    return;
  }

  const botaoSalvar = document.getElementById('empresa-btn-salvar');
  botaoSalvar.disabled = true;

  try {
    const dados = lerFormularioEmpresa();
    empresaAtual = await atualizarEmpresa(dados);
    preencherPainelEmpresa(empresaAtual);
    sairModoEdicao();
  } catch (erro) {
    // TODO: usar o componente de feedback (exibirMensagem) quando ele
    // for promovido para um local compartilhado entre auth/ e admin/,
    // como já apontado em enterpriseRegistration.js.
    console.error('Erro ao atualizar empresa:', erro);
  } finally {
    botaoSalvar.disabled = false;
  }
}

function ligarControlesDeEdicao() {
  document.getElementById('empresa-btn-alterar')?.addEventListener('click', entrarModoEdicao);
  document.getElementById('empresa-btn-cancelar')?.addEventListener('click', cancelarEdicao);
  document.getElementById('form-empresa-editar')?.addEventListener('submit', salvarEdicao);
}

async function iniciar() {
  ligarMascaras();
  ligarValidacaoEmTempoReal();
  ligarControlesDeEdicao();

  try {
    empresaAtual = await buscarEmpresa();
    preencherPainelEmpresa(empresaAtual);
  } catch (erro) {
    console.error('Erro ao carregar dados da empresa:', erro);
  }
}

document.addEventListener('DOMContentLoaded', iniciar);