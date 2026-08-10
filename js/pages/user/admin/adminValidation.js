// adminValidation.js
//
// Módulo dedicado de validação para o formulário de criação do
// administrador (form-admin). Responsável por:
//   - validar formato, tamanho e caracteres permitidos de cada campo
//   - exibir/ocultar as mensagens de erro em vermelho (.error-msg / .has-error)
//   - expor uma função única (validarFormularioAdmin) que retorna
//     true/false, para ser usada como "portão" antes de qualquer
//     chamada à API
//
// Este arquivo não faz máscaras de input nem chamadas de API — apenas
// validação. Import e uso típico em adminRegistration.js:
//
//   import { validarFormularioAdmin, ligarValidacaoEmTempoReal } from './adminValidation.js';
//
//   ligarValidacaoEmTempoReal(); // opcional: valida enquanto o usuário digita
//
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     if (!validarFormularioAdmin()) return; // bloqueia envio
//     // ... segue para o fetch normalmente
//   });

// ── UI: exibir / limpar erro ─────────────────────────────────
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const field = input.closest('.field');
  const errEl = document.getElementById('err-' + fieldId);
  if (field) field.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const field = input.closest('.field');
  const errEl = document.getElementById('err-' + fieldId);
  if (field) field.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

// ── validações de formato por campo ──────────────────────────
function isValidCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos os dígitos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  if (check2 !== parseInt(digits[10], 10)) return false;

  return true;
}

function isValidEmail(email) {
  // local-part e domínio com limites de tamanho + apenas caracteres
  // seguros (letras, números, . _ % + - @); bloqueia < > " ' ; ` etc.
  return /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,}$/.test(email);
}

function isValidNome(nome) {
  // só letras (com acentos) e espaços, sem números ou símbolos
  return /^[A-Za-zÀ-ÖØ-öø-ÿ]+(\s[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/.test(nome.trim());
}

function isValidTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '');
  // fixo (10) ou celular (11) com DDD, sem contar máscara
  return digits.length === 10 || digits.length === 11;
}

function isValidLogin(login) {
  // letras, números, ponto, underline e hífen -- sem espaço e sem
  // caracteres de risco (< > " ' ; ` etc.)
  return /^[A-Za-z0-9._-]+$/.test(login);
}

// ── validação por campo (usadas no submit e em tempo real) ──
function validateNomeField() {
  const nome = document.getElementById('nome_completo').value.trim();

  if (nome.length === 0) {
    setError('nome_completo', 'Informe o nome completo');
    return false;
  }
  if (nome.length > 60) {
    setError('nome_completo', 'Máximo de 60 caracteres');
    return false;
  }
  if (!isValidNome(nome)) {
    setError('nome_completo', 'Use apenas letras e espaços, sem números ou símbolos');
    return false;
  }
  clearError('nome_completo');
  return true;
}

function validateCpfField() {
  const cpf = document.getElementById('cpf').value;

  if (!isValidCPF(cpf)) {
    setError('cpf', 'CPF inválido');
    return false;
  }
  clearError('cpf');
  return true;
}

function validateTelefoneField() {
  const telefone = document.getElementById('telefone').value.trim();

  // campo opcional -- vazio é válido
  if (telefone.length === 0) {
    clearError('telefone');
    return true;
  }
  if (!isValidTelefone(telefone)) {
    setError('telefone', 'Telefone inválido');
    return false;
  }
  clearError('telefone');
  return true;
}

function validateEmailField() {
  const email = document.getElementById('email').value.trim();

  if (email.length === 0) {
    setError('email', 'Informe o e-mail');
    return false;
  }
  if (email.length > 50) {
    setError('email', 'Máximo de 50 caracteres');
    return false;
  }
  if (!isValidEmail(email)) {
    setError('email', 'E-mail inválido');
    return false;
  }
  clearError('email');
  return true;
}

function validateLoginField() {
  const login = document.getElementById('user_login').value.trim();

  if (login.length < 3 || login.length > 20) {
    setError('user_login', 'Deve ter entre 3 e 20 caracteres');
    return false;
  }
  if (/\s/.test(login)) {
    setError('user_login', 'Não pode conter espaços');
    return false;
  }
  if (!isValidLogin(login)) {
    setError('user_login', 'Use apenas letras, números, ponto, hífen ou underline');
    return false;
  }
  clearError('user_login');
  return true;
}

function validateSenhaField() {
  const senha = document.getElementById('senha').value;

  if (senha.length < 8 || senha.length > 50) {
    setError('senha', 'Deve ter entre 8 e 50 caracteres');
    return false;
  }
  // 1. Valida se tem ao menos 1 letra (maiúscula ou minúscula, incluindo acentuadas)
  if (!/[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(senha)) {
    setError('senha', 'Deve conter ao menos 1 letra');
    return false;
  }

  // 2. Valida se tem ao menos 1 letra MAIÚSCULA (incluindo acentuadas maiúsculas)
  if (!/[A-ZÀ-Ö]/.test(senha)) {
    setError('senha', 'Deve conter ao menos 1 letra maiúscula');
    return false;
  }
  
  if (!/\d/.test(senha)) {
    setError('senha', 'Deve conter ao menos 1 número');
    return false;
  }
  const especiais = (senha.match(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/g) || []).length;
  if (especiais < 1) {
    setError('senha', 'Deve conter ao menos 1 caractere especial');
    return false;
  }
  clearError('senha');
  return true;
}

// ── conferência de senha em tempo real ──────
function checkPasswordsMatch() {
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar_senha').value;

  if (confirmar.length === 0) {
    clearError('confirmar_senha');
    return;
  }

  if (confirmar !== senha) {
    setError('confirmar_senha', 'As senhas não coincidem');
  } else {
    clearError('confirmar_senha');
  }
}

// ── validação em tempo real (opcional) ───────────────────────
// Liga listeners de 'input' para validar enquanto o usuário digita,
// sem esperar o submit. Chamar uma vez, ao carregar a página.
export function ligarValidacaoEmTempoReal() {
  document.getElementById('nome_completo').addEventListener('input', function () {
    if (this.closest('.field').classList.contains('has-error') || this.value.trim().length > 0) {
      validateNomeField();
    }
  });

  document.getElementById('cpf').addEventListener('input', validateCpfField);

  document.getElementById('telefone').addEventListener('input', function () {
    if (this.value.trim().length > 0) validateTelefoneField();
    else clearError('telefone');
  });

  document.getElementById('email').addEventListener('input', function () {
    if (this.value.trim().length > 0) validateEmailField();
    else clearError('email');
  });

  document.getElementById('user_login').addEventListener('input', function () {
    if (this.value.trim().length > 0) validateLoginField();
    else clearError('user_login');
  });

  document.getElementById('senha').addEventListener('input', function () {
    if (this.value.length > 0) validateSenhaField();
    else clearError('senha');
    checkPasswordsMatch();
  });

  document.getElementById('confirmar_senha').addEventListener('input', checkPasswordsMatch);
}

// ── validação completa do formulário (portão antes da API) ───
// Retorna true somente se TODOS os campos passarem. Sempre exibe/
// atualiza as mensagens de erro em vermelho correspondentes.
export function validarFormularioAdmin() {
  const nomeOk = validateNomeField();
  const cpfOk = validateCpfField();
  const telefoneOk = validateTelefoneField();
  const emailOk = validateEmailField();
  const loginOk = validateLoginField();
  const senhaOk = validateSenhaField();

  const confirmar = document.getElementById('confirmar_senha').value;
  if (confirmar.length === 0) {
    setError('confirmar_senha', 'Confirme a senha');
  } else {
    checkPasswordsMatch();
  }
  const confirmarOk = !document.getElementById('confirmar_senha')
    .closest('.field').classList.contains('has-error');

  return nomeOk && cpfOk && telefoneOk && emailOk && loginOk && senhaOk && confirmarOk;
}

// Exporta também as validações individuais, caso seja necessário
// reusar em outro contexto.
export {
  isValidCPF,
  isValidEmail,
  isValidNome,
  isValidTelefone,
  isValidLogin,
  validateNomeField,
  validateCpfField,
  validateTelefoneField,
  validateEmailField,
  validateLoginField,
  validateSenhaField,
  checkPasswordsMatch,
  setError,
  clearError,
};