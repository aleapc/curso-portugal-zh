// A CONFIG DE CURSO — o que muda entre EN/DE/FR/IT→Espanha (e o futuro →França)
// mora AQUI e só aqui. Componentes agnósticos de língua (busca, tradutor,
// bolso do viajante) leem daqui; nenhum deles tem par de idioma ou moeda
// hard-coded. Derivar um SKU novo = copiar este arquivo e trocar os valores.

export const curso = {
  /**
   * Identidade do SKU, e ela NÃO é cosmética: é o namespace de
   * localStorage. Todos os cursos servem de aleapc.github.io/<curso>/, e
   * localStorage é por ORIGEM, não por caminho — sem isto, os cursos leem e
   * sobrescrevem o progresso uns dos outros.
   */
  sku: 'curso-portugal-zh',
  /** Idioma do comprador (a voz-guia). */
  buyerLang: 'zh',
  /** Idioma do destino (a fala nativa ensinada). */
  targetLang: 'pt',
  /** Par para o link do Google Tradutor: sl = comprador, tl = destino. */
  translatorPair: { sl: 'zh-CN', tl: 'pt' },
  /** Moeda do destino. */
  destCurrency: 'EUR',
  /**
   * Moedas de "casa" do comprador que vale converter no bolso do viajante.
   * Vazio quando o comprador já usa a moeda do destino (ex.: DE/FR/IT→Espanha,
   * todos em EUR) — nesse caso o /bolso mostra a nota "mesma moeda", sem conversor.
   */
  homeCurrencies: ['CNY'] as string[],
  timeZone: 'Europe/Lisbon',
  /** Nome de exibição do destino pra faixa "NOW". */
  cidadeExibicao: 'Lisboa',
  /**
   * Faixas do dia pra tela "NOW" (src/lib/consulta/ambiente.ts), do começo de
   * cada uma — a última cobre a virada da meia-noite. Horários de refeição
   * amplamente documentados pra Portugal urbano (pequeno-almoço leve de manhã,
   * almoço como refeição principal ~13h, lanche a meio da tarde, jantar tardio
   * com petiscos), não uma cultural fact com fonte específica. Revisar antes de
   * tratar como padrão definitivo do curso.
   */
  faixasNow: [
    { de: 0, linha: '厨房都歇了,不过还开着的酒吧或者继续在倒酒的 tasca(小酒馆)意味着你还没错过夜里的什么。' },
    { de: 5 * 60, linha: '天还早。头一批 pastelaria(葡式小点心店)才刚拉起卷帘门。' },
    { de: 7 * 60, linha: 'Pequeno-almoço(早餐):站在柜台边,一杯 bica(浓缩咖啡)加一个还温热的蛋挞。这里的一天就是这样开始的。' },
    { de: 9 * 60 + 30, linha: '上午过半,是咖啡时间——再来一杯 bica,一片 torrada(黄油烤面包),谁也不急。' },
    { de: 11 * 60, linha: '厨房在备菜。距离 almoço(午餐)还有一会儿,上午的场子是咖啡馆撑着的。' },
    { de: 13 * 60, linha: 'Almoço(午餐)正在进行——prato do dia(今日套餐),正正经经坐下来吃一顿。时间刚好。' },
    { de: 15 * 60, linha: '午餐进入尾声。顺理成章的下一步是安静地喝杯咖啡。' },
    { de: 17 * 60, linha: 'Lanche(下午茶):下午的咖啡加点心。你正踩在当地的节奏上。' },
    { de: 19 * 60, linha: '离 jantar(晚餐)还早。一杯酒配几样 petiscos(小碟菜)刚好过渡。' },
    { de: 20 * 60 + 30, linha: 'Jantar(晚餐)开始了——这里的晚饭吃得晚,也吃得慢。' },
    { de: 22 * 60 + 30, linha: '有点晚了,不过 petiscos(小碟菜)和 tascas(小酒馆)会把夜晚拖得更长。' }
  ] as { de: number; linha: string }[]
} as const;

export type CursoConfig = typeof curso;
