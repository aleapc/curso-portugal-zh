// Texto de exibição das fases — na língua do COMPRADOR (zh).
// Dado, não lógica: gerado a partir da tabela i18n do reposicionamento.
// Ver jornada.ts para a estrutura universal (slot → fase).
import type { FaseId } from './jornada';

export const FASE_LABEL: Record<FaseId, { emoji: string; nome: string; descricao: string }> = {
  chegada: { emoji: '🛬', nome: "抵达", descricao: "落地后的头24小时——从飞机到安顿下来。" },
  diaadia: { emoji: '☀️', nome: "日常生活", descricao: "吃饭、购物、出行、解决问题——像一个早就熟悉这里的人。" },
  integrando: { emoji: '🌙', nome: "融入当地", descricao: "不是迷路的游客，而是打算留下来体验的人。" }
};

export const FASE_COR: Record<FaseId, string> = {
  chegada: 'terracota',
  diaadia: 'salvia',
  integrando: 'oceano'
};

export const PROMESSA = {
  headline: "你旅行需要的语言，按你真正会用到的顺序排列。",
  subhead: "从机场柜台到当晚最后一次干杯。",
  provaLabel: "这门课真正会教你的一个事实："
};
