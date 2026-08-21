// empresaEditValidation.js
//
// Validação do formulário de edição de empresa (form-empresa-editar,
// em adminEmpresa.html). Mesmo padrão de enterpriseValidation.js
// (cadastro no fluxo "Junte-se a nós"): REGRAS por campo + validação
// genérica + validação específica onde necessário, e uma função única
// (validarFormularioEdicaoEmpresa) usada como portão antes do PUT.
//
// Só cobre os campos editáveis aqui (nome_fantasia, cnes, cep, bairro,
// numero, complemento) -- CNPJ e razão social são fixos nesta tela e
// não entram na validação de edição.

const REGRAS = {
  'empresa-nome-fantasia': {
    label: 'o nome fantasia',
    required: true,
    minLength: 2,
    maxLength: 255,
    regex: /^[\p{L}\p{N}\s.,&\-'()]+$/u,
  },
  'empresa-cnes': {
    label: 'o CNES',
    required: false,
    // CNES: 7 dígitos numéricos
    regex: /^\d{7}$/,
    maxLength: 7,
  },
  'empresa-cep': {
    label: 'o CEP',
    required: true,
    regex: /^\d{5}-?\d{3}$/,
    maxLength: 9,
  },
  'empresa-bairro': {
    label: 'o bairro',
    required: true,
    minLength: 2,
    maxLength: 100,
    regex: /^[\p{L}\p{N}\s.,\-'()]+$/u,
  },
  'empresa-numero': {
    label: 'o número',
    required: true,
    maxLength: 10,
    regex: /^(\d{1,8}[A-Za-z]?|[sS]\/[nN])$/,
  },
  'empresa-complemento': {
    label: 'o complemento',
    required: false,
    maxLength: 150,
    regex: /^[\p{L}\p{N}\s.,\-'°ºª/]*$/u,
  },
};

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

function validarCampoPorRegra(fieldId) {
  const regra = REGRAS[fieldId];
  const input = document.getElementById(fieldId);
  if (!regra || !input) return true;

  const valor = input.value.trim();

  if (valor.length === 0) {
    if (regra.required) {
      setError(fieldId, `Informe ${regra.label}`);
      return false;
    }
    clearError(fieldId);
    return true;
  }

  if (regra.minLength && valor.length < regra.minLength) {
    setError(fieldId, `Mínimo de ${regra.minLength} caracteres`);
    return false;
  }

  if (regra.maxLength && valor.length > regra.maxLength) {
    setError(fieldId, `Máximo de ${regra.maxLength} caracteres`);
    return false;
  }

  if (regra.regex && !regra.regex.test(valor)) {
    setError(fieldId, `Formato inválido em ${regra.label}`);
    return false;
  }

  clearError(fieldId);
  return true;
}

function validarCepField() {
  const okFormato = validarCampoPorRegra('empresa-cep');
  if (!okFormato) return false;

  const cep = document.getElementById('empresa-cep').value.replace(/\D/g, '');
  if (cep.length !== 8) {
    setError('empresa-cep', 'CEP inválido');
    return false;
  }
  clearError('empresa-cep');
  return true;
}

// Liga blur + input condicional (só revalida enquanto digita se já
// havia erro visível), igual ao padrão do cadastro.
export function ligarValidacaoEmTempoReal() {
  const camposComRegraGenerica = [
    'empresa-nome-fantasia',
    'empresa-cnes',
    'empresa-bairro',
    'empresa-numero',
    'empresa-complemento',
  ];

  camposComRegraGenerica.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => validarCampoPorRegra(id));
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && field.classList.contains('has-error')) {
        validarCampoPorRegra(id);
      }
    });
  });

  const cepInput = document.getElementById('empresa-cep');
  if (cepInput) {
    cepInput.addEventListener('blur', validarCepField);
  }
}

export function validarFormularioEdicaoEmpresa() {
  const nomeFantasiaOk = validarCampoPorRegra('empresa-nome-fantasia');
  const cnesOk = validarCampoPorRegra('empresa-cnes');
  const cepOk = validarCepField();
  const bairroOk = validarCampoPorRegra('empresa-bairro');
  const numeroOk = validarCampoPorRegra('empresa-numero');
  const complementoOk = validarCampoPorRegra('empresa-complemento');

  return nomeFantasiaOk && cnesOk && cepOk && bairroOk && numeroOk && complementoOk;
}

export function limparErros() {
  Object.keys(REGRAS).forEach(clearError);
}