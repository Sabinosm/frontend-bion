// preencherEmpresa.js
//
// Preenche a UI da página Empresa (adminEmpresa.html) com os dados
// retornados por GET /empresas/ -> to_dict():
//   { uuid, nome_fantasia, razao_social, cnpj, cnes, status_plano, plano, criado_em }
//
// Segue o mesmo padrão de preencherPerfil.js: não busca dado nenhum
// sozinho -- recebe o payload já pronto e só decide "onde exibir o quê".

/**
 * Preenche os campos institucionais e de plano a partir do payload de /empresas/.
 * @param {{
 *   uuid?: string,
 *   nome_fantasia?: string,
 *   razao_social?: string,
 *   cnpj?: string,
 *   cnes?: string,
 *   status_plano?: string,
 *   plano?: string,
 *   criado_em?: string
 * }} empresa
 */
export function preencherPainelEmpresa(empresa) {
  preencherDadosInstitucionais(empresa);
  preencherEndereco(empresa.endereco);
  preencherPlano(empresa);
}

function preencherDadosInstitucionais(empresa) {
  const nomeFantasia = document.getElementById('empresa-nome-fantasia');
  const razaoSocial = document.getElementById('empresa-razao-social');
  const cnpj = document.getElementById('empresa-cnpj');
  const cnes = document.getElementById('empresa-cnes');

  if (nomeFantasia) nomeFantasia.textContent = empresa.nome_fantasia ?? '—';
  if (razaoSocial) razaoSocial.textContent = empresa.razao_social ?? '—';
  if (cnpj) cnpj.textContent = formatarCnpj(empresa.cnpj);
  // CNES é opcional (nem toda empresa tem) -- mantém o traço em vez de "undefined".
  if (cnes) cnes.textContent = empresa.cnes ?? '—';
}

function preencherEndereco(endereco) {
  const alvo = document.getElementById('empresa-endereco');
  if (!alvo) return;

  if (!endereco) {
    alvo.textContent = '—';
    return;
  }

  alvo.textContent = formatarEndereco(endereco);
}

function formatarEndereco({ cep, bairro, numero, complemento } = {}) {
  // to_dict() ainda não retorna logradouro/cidade/UF -- monta só com o
  // que existe hoje (bairro, número, complemento, CEP). Ajustar aqui
  // quando esses campos forem adicionados ao backend.
  const linha1 = [numero, bairro].filter(Boolean).join(', ');
  const partes = [linha1, complemento, formatarCep(cep)].filter(Boolean);

  return partes.length > 0 ? partes.join(' — ') : '—';
}

function formatarCep(cep) {
  if (!cep) return '';
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) return cep;
  return digitos.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function preencherPlano(empresa) {
  const planoNome = document.getElementById('empresa-plano-nome');
  const planoStatus = document.getElementById('empresa-plano-status');

  if (planoNome) planoNome.textContent = empresa.plano ?? '—';
  // status_plano vem cru da API (ex.: "ativo", "inadimplente", "cancelado") --
  // por ora só formata capitalização; trocar por um mapa de labels/badges
  // quando os status finais forem definidos no backend.
  if (planoStatus) planoStatus.textContent = formatarStatusPlano(empresa.status_plano);
}

function formatarCnpj(cnpj) {
  if (!cnpj) return '—';
  const digitos = cnpj.replace(/\D/g, '');
  if (digitos.length !== 14) return cnpj; // já formatado ou formato inesperado -- exibe como veio
  return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatarStatusPlano(status) {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}