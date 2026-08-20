// A ORDEM DE VIAGEM — uma segunda lente sobre os mesmos 36 slots.
//
// O contrato pedagógico (a01-a08, b01-b18, i01-i10; moldes, casas, gates)
// NÃO muda. Isto só reagrupa a APRESENTAÇÃO: em vez de "Básico/Intermediário/
// Avançado" (que descreve dificuldade, um conceito de sala de aula que o
// comprador nunca pediu), o app mostra "Chegada/Dia a dia/Se integrando" —
// a ordem em que a viagem de fato acontece.
//
// Por que isto é seguro fazer sem tocar o backend: cada casa de molde tem a
// MESMA função comunicativa em todo destino do catálogo — b06 é sempre a
// primeira hora nos balcões, b03 é sempre o abridor social, i06 é sempre o
// passado que conta a viagem. Verificado contra Portugal, Alemanha e Japão:
// os temas batem. Por isso este arquivo é IDÊNTICO em todo SKU, sem
// tradução nenhuma — só ids e números.

export type FaseId = 'chegada' | 'diaadia' | 'integrando';

export const ORDEM_JORNADA: Record<string, { fase: FaseId; ordem: number }> = {
  // 🛬 CHEGADA — as primeiras 24 horas, do avião ao check-in
  b01: { fase: 'chegada', ordem: 1 },
  b02: { fase: 'chegada', ordem: 2 },
  b03: { fase: 'chegada', ordem: 3 },
  b06: { fase: 'chegada', ordem: 4 },
  b07: { fase: 'chegada', ordem: 5 },
  b08: { fase: 'chegada', ordem: 6 },
  b09: { fase: 'chegada', ordem: 7 },
  b05: { fase: 'chegada', ordem: 8 },
  // ☀️ DIA A DIA — comer, comprar, se mover, resolver
  b04: { fase: 'diaadia', ordem: 9 },
  i05: { fase: 'diaadia', ordem: 10 },
  i02: { fase: 'diaadia', ordem: 11 },
  b11: { fase: 'diaadia', ordem: 12 },
  i03: { fase: 'diaadia', ordem: 13 },
  b12: { fase: 'diaadia', ordem: 14 },
  b13: { fase: 'diaadia', ordem: 15 },
  b14: { fase: 'diaadia', ordem: 16 },
  i07: { fase: 'diaadia', ordem: 17 },
  b15: { fase: 'diaadia', ordem: 18 },
  i10: { fase: 'diaadia', ordem: 19 },
  b10: { fase: 'diaadia', ordem: 20 },
  b16: { fase: 'diaadia', ordem: 21 },
  i01: { fase: 'diaadia', ordem: 22 },
  i09: { fase: 'diaadia', ordem: 23 },
  i04: { fase: 'diaadia', ordem: 24 },
  b17: { fase: 'diaadia', ordem: 25 },
  b18: { fase: 'diaadia', ordem: 26 },
  // 🌙 SE INTEGRANDO — soar como quem veio ficar
  i06: { fase: 'integrando', ordem: 27 },
  i08: { fase: 'integrando', ordem: 28 },
  a07: { fase: 'integrando', ordem: 29 },
  a05: { fase: 'integrando', ordem: 30 },
  a01: { fase: 'integrando', ordem: 31 },
  a02: { fase: 'integrando', ordem: 32 },
  a03: { fase: 'integrando', ordem: 33 },
  a04: { fase: 'integrando', ordem: 34 },
  a06: { fase: 'integrando', ordem: 35 },
  a08: { fase: 'integrando', ordem: 36 }
};

export const FASES: FaseId[] = ['chegada', 'diaadia', 'integrando'];
