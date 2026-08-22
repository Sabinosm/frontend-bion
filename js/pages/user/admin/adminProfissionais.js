// ============================================
// B-íon — Profissionais
// Busca, filtros, paginação (10 por página) e modal de
// cadastro/edição de profissional.
//
// As regras de validação (CPF, telefone, login, UF, etc.) vivem em
// adminProfissionaisValidações.js, espelhando CadastroUsuarioSchema
// e validador.py do backend -- mantidas ali para não duplicar/
// divergir dentro deste arquivo, que só orquestra a tela.
//
// TODO: os dados abaixo são mock. Trocar carregarProfissionais()
// por um fetch real assim que o endpoint existir (algo como
// GET /api/instituicao/profissionais?pagina=&busca=&...).
// Os filtros de fato (especialidade, status etc.) ainda não foram
// definidos -- o painel já existe na UI, só falta plugar os campos
// certos quando isso for decidido.
//
// Modo edição: os campos começam VAZIOS, mostrando o valor atual
// como placeholder (não como value). Só o que for efetivamente
// digitado entra no payload de update -- campo em branco = "não
// mexe nisso". Modo cadastro: os campos obrigatórios do schema
// completo precisam ser preenchidos (ver validarFormularioProfissional).
//
// Cadastro de profissional NÃO tem campo de senha: o acesso é feito
// por login com Conta Google usando o e-mail cadastrado aqui, e é o
// próprio profissional que passa por esse fluxo depois. Por isso o
// e-mail é pedido duas vezes (confirmação) -- é o admin quem responde
// por um e-mail incorreto, já que o convite de acesso vai para ele.
// ============================================

import { exibirMensagem } from "/js/shared/feedback.js";
import { validarFormularioProfissional } from "./adminProfissionaisValidacoes.js";

const POR_PAGINA = 10;

// ----- Mock temporário -----
const PROFISSIONAIS_MOCK = [
  { id: 1, nome: 'Dra. Renata Carvalho Mendes', cpf: '12345678900', email: 'renata.mendes@bion.com', user_login: 'renata.mendes', telefone: '11988881234', tipo_usuario: 'medico', numero_crm: '123456', uf_crm: 'SP', rqe: '', especialidade: 'Clínica Geral', status: 'ativo' },
  { id: 2, nome: 'Dr. Marcos Antônio Ferreira', cpf: '98765432100', email: 'marcos.ferreira@bion.com', user_login: 'marcos.ferreira', telefone: '11977775678', tipo_usuario: 'medico', numero_crm: '98765', uf_crm: 'SP', rqe: '', especialidade: 'Pediatria', status: 'ativo' },
  { id: 3, nome: 'Dra. Camila Rocha Santos', cpf: '', email: 'camila.rocha@bion.com', user_login: '', telefone: '', tipo_usuario: '', numero_crm: '', uf_crm: '', rqe: '', especialidade: '', status: 'pendente', convite_em: '18/08/2026' },
];

let paginaAtual = 1;
let termoBusca = '';
let profissionalEditando = null; // objeto completo, ou null se for cadastro novo

document.addEventListener('DOMContentLoaded', () => {
  configurarBusca();
  configurarFiltros();
  configurarModalProfissional();
  renderizarLista();
});

// ============================================
// Busca
// ============================================
function configurarBusca() {
  const input = document.getElementById('busca-profissional');
  if (!input) return;

  input.addEventListener('input', () => {
    termoBusca = input.value.trim().toLowerCase();
    paginaAtual = 1;
    renderizarLista();
  });
}

// ============================================
// Filtros (painel expansível)
// ============================================
function configurarFiltros() {
  const btn = document.getElementById('btn-toggle-filtros');
  const painel = document.getElementById('filter-panel');
  if (!btn || !painel) return;

  btn.addEventListener('click', () => {
    const abrir = !painel.classList.contains('filter-panel--visible');
    painel.classList.toggle('filter-panel--visible', abrir);
    btn.classList.toggle('btn-filter--active', abrir);
  });

  const btnLimpar = document.getElementById('btn-limpar-filtros');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      painel.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
      // TODO: resetar campos de filtro reais quando definidos
      paginaAtual = 1;
      renderizarLista();
    });
  }
}

// ============================================
// Dados (mock por enquanto)
// ============================================
function carregarProfissionais() {
  // TODO: substituir por fetch('/api/instituicao/profissionais?...')
  return PROFISSIONAIS_MOCK;
}

function filtrarProfissionais(lista) {
  if (!termoBusca) return lista;
  return lista.filter(p =>
    p.nome.toLowerCase().includes(termoBusca) ||
    (p.numero_crm ?? '').toLowerCase().includes(termoBusca) ||
    (p.especialidade ?? '').toLowerCase().includes(termoBusca)
  );
}

// ============================================
// Renderização da lista + paginação
// ============================================
function renderizarLista() {
  const container = document.getElementById('lista-profissionais');
  if (!container) return;

  const todos = filtrarProfissionais(carregarProfissionais());
  const totalPaginas = Math.max(1, Math.ceil(todos.length / POR_PAGINA));
  paginaAtual = Math.min(paginaAtual, totalPaginas);

  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const pagina = todos.slice(inicio, inicio + POR_PAGINA);

  container.innerHTML = '';

  if (pagina.length === 0) {
    container.appendChild(criarEstadoVazio());
  } else {
    pagina.forEach(p => container.appendChild(criarCardProfissional(p)));
  }

  renderizarPaginacao(todos.length, totalPaginas);
}

function criarEstadoVazio() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="11" cy="11" r="7" stroke-linecap="round"/>
      <path d="M21 21l-4.3-4.3" stroke-linecap="round"/>
    </svg>
    <p class="empty-state-title">Nenhum profissional encontrado</p>
    <p class="empty-state-text">Tente ajustar a busca ou os filtros, ou convide um novo profissional para a equipe.</p>
  `;
  return div;
}

function criarCardProfissional(p) {
  const card = document.createElement('article');
  card.className = 'consult-card';

  const status = document.createElement('div');
  if (p.status === 'ativo') {
    status.className = 'consult-status status--em-atendimento';
    status.innerHTML = `<span class="status-dot"></span> Ativo`;
  } else {
    status.className = 'consult-status status--aguardando-medico';
    status.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" stroke-linecap="round"/>
        <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Convite pendente`;
  }

  const main = document.createElement('div');
  main.className = 'consult-main';
  const nome = document.createElement('h3');
  nome.className = 'consult-patient';
  nome.textContent = p.nome;
  const meta = document.createElement('p');
  meta.className = 'consult-meta';
  meta.textContent = p.status === 'ativo'
    ? `CRM ${p.numero_crm ?? ''}${p.uf_crm ? '-' + p.uf_crm : ''} · ${p.especialidade || '—'}`
    : `Convite enviado em ${p.convite_em}`;
  main.append(nome, meta);

  const btn = document.createElement('button');
  btn.className = 'btn-ghost';
  btn.textContent = p.status === 'ativo' ? 'Gerenciar' : 'Reenviar convite';
  if (p.status === 'ativo') {
    btn.addEventListener('click', () => abrirModalProfissional(p));
  } else {
    btn.addEventListener('click', () => reenviarConvite(p));
  }

  card.append(status, main, btn);
  return card;
}

function reenviarConvite(p) {
  // TODO: chamar endpoint de reenvio de convite
  console.log('Reenviar convite para', p.id);
}

// ============================================
// Paginação (com setas para os lados)
// ============================================
function renderizarPaginacao(totalItens, totalPaginas) {
  const container = document.getElementById('paginacao');
  if (!container) return;

  container.innerHTML = '';

  if (totalItens === 0) return;

  const inicio = (paginaAtual - 1) * POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * POR_PAGINA, totalItens);

  const info = document.createElement('span');
  info.className = 'pagination-info';
  info.textContent = `Mostrando ${inicio}–${fim} de ${totalItens}`;

  const controls = document.createElement('div');
  controls.className = 'pagination-controls';

  controls.appendChild(criarBotaoPagina({
    conteudoSvg: `<path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>`,
    label: 'Página anterior',
    desabilitado: paginaAtual === 1,
    onClick: () => irParaPagina(paginaAtual - 1),
  }));

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === paginaAtual ? ' page-btn--active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => irParaPagina(i));
    controls.appendChild(btn);
  }

  controls.appendChild(criarBotaoPagina({
    conteudoSvg: `<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>`,
    label: 'Próxima página',
    desabilitado: paginaAtual === totalPaginas,
    onClick: () => irParaPagina(paginaAtual + 1),
  }));

  container.append(info, controls);
}

function criarBotaoPagina({ conteudoSvg, label, desabilitado, onClick }) {
  const btn = document.createElement('button');
  btn.className = 'page-btn';
  btn.setAttribute('aria-label', label);
  btn.disabled = desabilitado;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${conteudoSvg}</svg>`;
  btn.addEventListener('click', onClick);
  return btn;
}

function irParaPagina(n) {
  paginaAtual = n;
  renderizarLista();
  document.getElementById('lista-profissionais')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

// ============================================
// Modal de Cadastrar / Editar profissional
// ============================================

function configurarModalProfissional() {
  const overlay = document.getElementById('prof-modal-overlay');
  const btnNovo = document.getElementById('btn-convidar-profissional');
  const btnFechar = document.getElementById('prof-modal-close');
  const btnCancelar = document.getElementById('prof-modal-cancel');
  const form = document.getElementById('form-profissional');
  const selectTipo = document.getElementById('pf-tipo');

  if (!overlay) return;

  btnNovo?.addEventListener('click', () => abrirModalProfissional(null));
  btnFechar?.addEventListener('click', fecharModalProfissional);
  btnCancelar?.addEventListener('click', fecharModalProfissional);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModalProfissional();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('settings-overlay--visible')) {
      fecharModalProfissional();
    }
  });

  selectTipo?.addEventListener('change', () => {
    atualizarBlocoPorTipo(selectTipo.value);
    limparErroCampo('pf-tipo');
  });

  // Limpa o erro do campo assim que o usuário mexe nele de novo
  form?.querySelectorAll('.field-input').forEach(el => {
    el.addEventListener('input', () => limparErroCampo(el.id));
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    salvarProfissional();
  });
}

function atualizarBlocoPorTipo(tipo) {
  const blocoMedico = document.getElementById('bloco-medico');
  const blocoEnfermeiro = document.getElementById('bloco-enfermeiro');
  blocoMedico.hidden = tipo !== 'medico';
  blocoEnfermeiro.hidden = tipo !== 'enfermeiro';
}

function abrirModalProfissional(profissional) {
  const overlay = document.getElementById('prof-modal-overlay');
  const titulo = document.getElementById('prof-modal-title');
  const btnSalvar = document.getElementById('prof-modal-save');
  const editHint = document.getElementById('prof-modal-edit-hint');
  const form = document.getElementById('form-profissional');

  profissionalEditando = profissional;
  const editando = profissional !== null;

  form.reset();
  limparTodosOsErros();
  limparFeedback();

  if (titulo) titulo.textContent = editando ? 'Editar profissional' : 'Convidar profissional';
  if (btnSalvar) btnSalvar.textContent = editando ? 'Salvar alterações' : 'Enviar convite';
  if (editHint) editHint.hidden = !editando;

  // Em edição: campo vazio, valor atual vira placeholder (dica visual).
  // Em cadastro: campo realmente vazio, sem dado antigo pra mostrar.
  definirCampoComPlaceholder('pf-nome', editando ? profissional.nome : '');
  definirCampoComPlaceholder('pf-cpf', editando ? formatarCpfExibicao(profissional.cpf) : '', '000.000.000-00');
  definirCampoComPlaceholder('pf-login', editando ? profissional.user_login : '');
  definirCampoComPlaceholder('pf-telefone', editando ? formatarTelefoneExibicao(profissional.telefone) : '', '(11) 91234-5678');

  // E-mail nunca herda placeholder do valor antigo: pedir confirmação
  // com o valor "escondido" via placeholder tiraria o sentido da
  // dupla digitação (o admin só reveria o e-mail atual, sem precisar
  // redigitar, o que é justamente o que queremos evitar aqui).
  definirCampoComPlaceholder('pf-email', '');
  definirCampoComPlaceholder('pf-email-confirma', '');

  const selectTipo = document.getElementById('pf-tipo');
  selectTipo.value = editando ? (profissional.tipo_usuario || '') : '';
  atualizarBlocoPorTipo(selectTipo.value);

  definirCampoComPlaceholder('pf-crm', editando ? profissional.numero_crm : '');
  definirCampoComPlaceholder('pf-uf-crm', editando ? profissional.uf_crm : '');
  definirCampoComPlaceholder('pf-rqe', editando ? profissional.rqe : '');
  definirCampoComPlaceholder('pf-coren', editando ? profissional.numero_coren : '');
  definirCampoComPlaceholder('pf-uf-coren', editando ? profissional.uf_coren : '');
  definirCampoComPlaceholder('pf-especialidade', editando ? profissional.especialidade : '');

  overlay.classList.add('settings-overlay--visible');
  document.body.classList.add('no-scroll');
  document.getElementById('pf-nome')?.focus();
}

function definirCampoComPlaceholder(id, valorAtual, placeholderFixo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = '';
  el.placeholder = valorAtual ? String(valorAtual) : (placeholderFixo ?? '');
}

function formatarCpfExibicao(cpf) {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefoneExibicao(telefone) {
  if (!telefone) return '';
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone;
}

function fecharModalProfissional() {
  const overlay = document.getElementById('prof-modal-overlay');
  overlay?.classList.remove('settings-overlay--visible');
  document.body.classList.remove('no-scroll');
  profissionalEditando = null;
  limparTodosOsErros();
  limparFeedback();
}

// ============================================
// Erros de campo / feedback geral
// ============================================
function limparErroCampo(id) {
  const grupo = document.getElementById(id)?.closest('.field-group');
  const erroEl = document.getElementById(id + '-error');
  if (erroEl) erroEl.textContent = '';
  grupo?.classList.remove('field-group--has-error');
  document.getElementById(id)?.classList.remove('field-input--invalid');
}

function limparTodosOsErros() {
  document.querySelectorAll('#form-profissional .field-error').forEach(el => { el.textContent = ''; });
  document.querySelectorAll('#form-profissional .field-group--has-error').forEach(el => el.classList.remove('field-group--has-error'));
  document.querySelectorAll('#form-profissional .field-input--invalid').forEach(el => el.classList.remove('field-input--invalid'));
}

function exibirErrosCampos(erros) {
  limparTodosOsErros();
  let primeiroCampo = null;

  Object.entries(erros).forEach(([id, mensagem]) => {
    const input = document.getElementById(id);
    const grupo = input?.closest('.field-group');
    const erroEl = document.getElementById(id + '-error');
    if (erroEl) erroEl.textContent = mensagem;
    grupo?.classList.add('field-group--has-error');
    input?.classList.add('field-input--invalid');
    if (!primeiroCampo) primeiroCampo = input;
  });

  primeiroCampo?.focus();
}

function limparFeedback() {
  const el = document.getElementById('mensagemFeedback');
  if (!el) return;
  el.textContent = '';
  el.className = '';
}

// ============================================
// Ler campos do form e salvar
// ============================================
function lerCamposFormulario() {
  const valor = (id) => document.getElementById(id).value;
  return {
    nome: valor('pf-nome').trim(),
    cpf: valor('pf-cpf').trim(),
    login: valor('pf-login').trim(),
    telefone: valor('pf-telefone').trim(),
    email: valor('pf-email').trim(),
    emailConfirma: valor('pf-email-confirma').trim(),
    tipo: valor('pf-tipo').trim(),
    crm: valor('pf-crm').trim(),
    ufCrm: valor('pf-uf-crm').trim(),
    rqe: valor('pf-rqe').trim(),
    coren: valor('pf-coren').trim(),
    ufCoren: valor('pf-uf-coren').trim(),
    especialidade: valor('pf-especialidade').trim(),
  };
}

function salvarProfissional() {
  const editando = profissionalEditando !== null;
  const campos = lerCamposFormulario();
  const { payload, erros } = validarFormularioProfissional(campos, editando);

  if (Object.keys(erros).length > 0) {
    exibirErrosCampos(erros);
    exibirMensagem('Corrija os campos destacados antes de continuar.', 'erro');
    return;
  }

  if (editando && Object.keys(payload).length === 0) {
    exibirMensagem('Nenhuma alteração para salvar.', 'info');
    return;
  }

  if (editando) payload.id = profissionalEditando.id;

  // TODO: chamar API
  // - !editando -> POST /api/instituicao/profissionais (convite, schema
  //   completo de CadastroUsuarioSchema -- sem 'senha', que não se aplica
  //   a médico/enfermeiro)
  // - editando  -> PUT /api/instituicao/profissionais/:id (update parcial,
  //   só os campos preenchidos vão no payload -- já é o que fizemos acima)
  console.log('Payload profissional:', payload);

  exibirMensagem(
    editando ? 'Profissional atualizado com sucesso!' : 'Convite enviado com sucesso!',
    'sucesso'
  );

  setTimeout(() => {
    fecharModalProfissional();
    renderizarLista();
  }, 900);
}