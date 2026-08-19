# Identidade Visual — B-íon

## 1. Posicionamento central

O B-íon ocupa um espaço deliberadamente híbrido: **tecnologia de ponta** (IA, decisão clínica assistida) aplicada a um domínio que tradicionalmente valoriza **conservadorismo visual e confiança institucional** (saúde). A decisão de design não escolhe um lado — ela separa o problema por contexto de uso:

- **Marketing e autenticação** (landing page, login, onboarding, cadastro) → linguagem "tech moderna", assumindo a identidade de plataforma de IA.
- **Produto em uso clínico** (dashboards, prontuário, decisão assistida) → linguagem de alto contraste e sobriedade funcional, priorizando legibilidade e confiança sob pressão de turno.

Essa separação existe porque as duas linguagens servem propósitos diferentes: a primeira precisa **diferenciar e converter**; a segunda precisa **não falhar** quando alguém está cansado, sob pressão, tomando uma decisão que afeta um paciente.

---

## 2. A linguagem "tech moderna" (marketing/auth)

### O que a compõe
- Fundo preto levemente acizentado, cartões translúcidos com `backdrop-filter: blur()` — glassmorphism escuro
- Rede de partículas conectadas por linhas finas, reagindo ao cursor — metáfora visual direta de "rede neural" / "dados conectados" / "IA pensando" / " átomos e íons "
- Paleta monocromática: preto, branco, cinzas — nenhuma cor de destaque, nem no CTA principal
- Tipografia dupla: `Inter` (corpo, neutra, altamente legível) + `Share Tech Mono` (marca, letter-spacing largo, remete a interface de sistema/terminal)
- Microinterações: fade-ins escalonados, hover states sutis, cursor de "digitação" em textos de destaque

### Referências artísticas que embasam essa escolha

**Minimalismo suíço / International Typographic Style** — a base tipográfica (grid, hierarquia clara, ausência de ornamento) vem diretamente dessa tradição, que despojou o design gráfico do excesso decorativo em favor de clareza funcional. O uso de `Inter` como fonte de corpo é um herdeiro direto dessa lógica: uma tipografia desenhada para nunca chamar atenção para si mesma, só para o conteúdo.

**Estética "cyberspace" dos anos 80–90 (Neuromancer, Tron, a raiz visual do cyberpunk)** — o fundo escuro com elementos luminosos finos, linhas de conexão, e a ideia de "rede visível" remontam a essa tradição: tornar visível algo que naturalmente não se vê (dados, conexões, processamento). É a mesma pulsão estética que produziu interfaces de ficção científica — não por acaso, é também a linguagem visual que a indústria de IA adotou de forma quase universal na década de 2020 (OpenAI, Anthropic, a maioria das landing pages de produtos de IA usam variações do mesmo vocabulário).

**Glassmorphism** — o estilo de cartões translúcidos com blur, popularizado a partir de ~2020 (Apple's Big Sur, Windows Fluent Design), comunica **profundidade sem peso**: o conteúdo parece flutuar sobre uma superfície, sugerindo camadas de informação sem o peso visual de bordas sólidas ou sombras duras. Funciona bem aqui porque reforça a ideia de "múltiplas camadas de dados" sem ficar literal.

**Bauhaus (indiretamente, via minimalismo funcionalista)** — o princípio "a forma segue a função" está presente na ausência de decoração gratuita: cada elemento visual (a rede de partículas, o blur, a tipografia) carrega significado semântico, não é escolha puramente estética.

### Por que isso funciona para o B-íon especificamente
Diferencia o produto de softwares hospitalares tradicionais (visualmente datados, densos, cor institucional) sem depender de clichês do setor. Comunica "produto de IA sério" para o público que já reconhece essa linguagem (investidores, diretores de inovação, desenvolvedores) — mas isso é uma aposta consciente: para o usuário clínico do dia a dia, essa mesma estética pode comunicar "startup chamativa" em vez de "ferramenta confiável", o que é exatamente por que ela **não** se estende ao produto em uso clínico.

---

## 3. A cor (ou a ausência dela) como decisão funcional

A paleta monocromática não é neutra por padrão — é uma escolha ativa com duas consequências:

1. **Abre espaço para o sistema de temas.** Ao não fixar nenhuma cor de marca nos componentes centrais, qualquer paleta pode ser aplicada via tokens (`--bg`, `--text`, `--border`, etc.) sem reescrever a estrutura visual. Isso é o que permite os 3–5 temas planejados (claro/escuro, alto contraste) existirem sem conflito de identidade.

2. **Preserva capacidade cognitiva para quando a cor importa de verdade.** Em contexto clínico, cor costuma carregar significado crítico (vermelho = alerta, verde = normal, amarelo = atenção). Um sistema que já usa cor decorativamente em todo lugar diluiu esse sinal — quando a cor aparece, ela compete com o resto. Manter marketing/auth acromático preserva a cor como um recurso reservado exclusivamente para comunicação de estado no produto real.

Isso ecoa um princípio de **design de informação** (Edward Tufte, *The Visual Display of Quantitative Information*): usar variação visual (cor, peso, tamanho) com parcimônia, reservando-a para carregar informação real, não decoração. Um dashboard clínico que grita com cor o tempo todo perde a capacidade de gritar quando precisa.

---

## 4. UX/UI como ferramenta de cuidado, não só de estética

As decisões de acessibilidade discutidas — escala de fonte, alternativa de fonte de alta legibilidade, temas claro/escuro como *perfis de uso* (não só gosto) — partem de uma premissa central: **em software de saúde, UX ruim tem custo mais alto que em outros domínios.** Um erro de leitura, uma decisão tomada com fadiga visual, ou uma interface que não se adapta ao contexto de turno (dia vs. madrugada) não é só desconforto — é risco.

Isso se conecta à tradição de **design centrado no usuário** (Don Norman, *The Design of Everyday Things*), mas com uma inflexão: no B-íon, "o usuário" está frequentemente sob estresse cognitivo (plantão longo, decisão de alto risco), então a barra de "affordance clara" e "erro impossível ou recuperável" precisa ser mais alta do que em software comum. A régua de comparação não é "outro app de produtividade" — é "um profissional exausto às 3h da manhã precisa entender isso em menos de 2 segundos".

A escolha de manter o **produto interno** em alto contraste, sóbrio e previsível — mesmo enquanto marketing/auth exploram uma linguagem mais expressiva — é a aplicação prática desse princípio: a inovação visual fica onde o custo do erro é baixo (conversão, primeira impressão); a estabilidade visual fica onde o custo do erro é alto (uso clínico real).

---

## 5. Padrões estruturais herdados dessas decisões

Alguns princípios de engenharia de front-end que emergiram diretamente da filosofia de design, não apenas da implementação:

- **Tokens semânticos separados de tokens de paleta** (`--text` aponta para `--palette-white`, não usa a cor diretamente) — permite trocar tema sem reescrever componente, e é uma prática comum em design systems maduros (Material Design, Radix, etc.), não invenção própria.
- **Fluxos de estado sensíveis (sessão, onboarding) sempre confiam no servidor, nunca em parâmetros de URL manipuláveis pelo cliente** — não é regra de design visual, mas é consequência direta de tratar o produto como algo que lida com dados de saúde: a interface pode ser bonita, mas nunca pode ser o único guarda de uma decisão de segurança.
- **Componentização por escopo de uso** (`shared/` vs. `pages/<área>/`) — reflete a mesma lógica de "cada contexto tem sua própria necessidade" que informa a separação marketing vs. produto: nem tudo que é reutilizável deveria ser genérico.

---

## 6. Resumo em uma frase

> O B-íon usa a linguagem visual da vanguarda tech (minimalismo suíço + estética de rede/cyberspace + glassmorphism) para se apresentar e converter, mas recua para os princípios de design de informação e usabilidade sob estresse quando o contexto é uso clínico real — tratando estética e função como ferramentas aplicadas ao contexto certo, não como uma escolha única para o produto inteiro.