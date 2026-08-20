// A FAIXA "NOW" — a cultura virando ambiente, com zero toque.
//
// Saber que a cozinha só acorda às oito e meia NÃO é fala: não vira card e não
// compete por tile (PRODUTO.md §6). Vira isto — uma linha no topo da tela que a
// pessoa lê sem pedir, na hora exata em que a informação morde.
//
// O REGISTRO É UPBEAT, e é a regra que importa aqui: *"you're early, not late"*,
// nunca *"you missed it"*.
//
// Nada aqui é datado nem regional: é o relógio do país, que é o mesmo em julho e
// em janeiro. Nada de "hoje é domingo, tudo fechado" — isso varia por cidade e
// entraria como inferência vestida de fato.
//
// ATÉ 2026-08-04 este arquivo hardcodava Europe/Madrid e o relógio espanhol —
// funcionava por acidente nos cursos DE/FR/IT→Espanha (mesmo destino, só o
// idioma do comprador muda) e quebrava silenciosamente no México (primeiro
// curso que também muda o DESTINO): a tela mostrava "Madrid" e cultura
// peninsular pra quem está no México. Generalizado para ler fuso e faixas de
// `curso.config.ts` — nenhum destino novo deve reintroduzir esse hardcode.

import { curso } from '../curso.config';

export interface Ambiente {
  /** HH:MM no fuso do destino (curso.timeZone). */
  hora: string;
  /** Minutos desde a meia-noite, para decidir a faixa. */
  minutos: number;
  /** A linha de contexto. Uma frase, dita a quem está de pé no meio da rua. */
  linha: string;
  /** Nome de exibição do destino (curso.cidadeExibicao) — nunca hardcode isso na UI. */
  cidade: string;
}

/** Hora no fuso do destino. Se o aparelho não tiver as zonas do ICU, cai na hora local. */
function horaNoDestino(d: Date): { hora: string; minutos: number } {
  try {
    const partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: curso.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(d);
    const h = Number(partes.find((p) => p.type === 'hour')?.value);
    const m = Number(partes.find((p) => p.type === 'minute')?.value);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return {
        hora: `${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        minutos: (h % 24) * 60 + m
      };
    }
  } catch {
    /* sem base de fusos → hora do aparelho */
  }
  const h = d.getHours();
  const m = d.getMinutes();
  return {
    hora: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    minutos: h * 60 + m
  };
}

export function ambienteAgora(d: Date = new Date()): Ambiente {
  const { hora, minutos } = horaNoDestino(d);
  const faixas = curso.faixasNow;
  let linha = faixas[0].linha;
  for (const f of faixas) if (minutos >= f.de) linha = f.linha;
  return { hora, minutos, linha, cidade: curso.cidadeExibicao };
}
