import type { ModuloOutline } from '../types';

// ┌──────────────────────────────────────────────────────────────────────────┐
// │  ARQUIVO GERADO — não edite à mão.                                       │
// │  Fonte: os ep-*.json (título) + slots.json (ordem e módulo).             │
// │  Regenerar: npm run outline   ·   Conferir: npm run outline:conferir     │
// │                                                                          │
// │  O título vivia aqui E no episódio. Duas canônicas para a mesma string   │
// │  é o defeito que fez duas partes reescritas aparecerem na tela com o     │
// │  título antigo e duas partes novas não aparecerem. Agora deriva.         │
// └──────────────────────────────────────────────────────────────────────────┘

export const outline: ModuloOutline[] = [
  {
    nivel: 'basico',
    nome: 'Basic · Get by',
    descricao: 'The Portuguese that gets the day done: arriving, ordering, paying, moving, and getting help.',
    cor: 'terracota',
    licoes: [
      { id: 'b01', titulo: '这个词比看起来要短', pronta: true },
      { id: 'b02', titulo: '进门时说 bom dia,出门时说 obrigado', pronta: true },
      { id: 'b03', titulo: 'Desculpe,然后是你错过的那一半', pronta: true },
      { id: 'b04', titulo: '在自己的桌上解决的四件事', pronta: true },
      { id: 'b05', titulo: '三个回答,预订说其余的', pronta: true },
      { id: 'b06', titulo: 'Tem,然后是那个东西', pronta: true },
      { id: 'b07', titulo: 'Pode——让你进城的三个词', pronta: true },
      { id: 'b08', titulo: 'Onde é——答案能装进你脑子里的问题', pronta: true },
      { id: 'b09', titulo: '票、触碰,以及它买到的时间', pronta: true },
      { id: 'b10', titulo: '你已经能读的那些词——以及它们在这里说的意思', pronta: true },
      { id: 'b11', titulo: 'Queria——这一轮由你来点', pronta: true },
      { id: 'b12', titulo: 'Sem——那一个改变整盘菜的小词', pronta: true },
      { id: 'b13', titulo: 'Tenho alergia——点单之前说，绝不要等盘子上来之后', pronta: true },
      { id: 'b14', titulo: 'Queria a conta——以及那只自己送上来的小碟子', pronta: true },
      { id: 'b15', titulo: 'Quanto custa——你在承诺之前先问的那个问题', pronta: true },
      { id: 'b16', titulo: 'Tem、sem、procuro——柜台边这一分钟让房间变好', pronta: true },
      { id: 'b17', titulo: 'A cruz verde——大部分事都在这个柜台处理，只有一个号码要先打', pronta: true },
      { id: 'b18', titulo: '最后一个早上——一只 mala、一张 fatura，还有让人请你再来的那句道别', pronta: true },
    ]
  },
  {
    nivel: 'intermediario',
    nome: 'Intermediate · Get the good stuff',
    descricao: 'Eat where they eat, when they eat, at the price they pay.',
    cor: 'oliva',
    licoes: [
      { id: 'i01', titulo: '几点开始——那个没写在门上的时刻', pronta: true },
      { id: 'i02', titulo: 'Ao balcão——最短的句子就是最有礼貌的', pronta: true },
      { id: 'i03', titulo: 'O prato do dia——读门口的那张单', pronta: true },
      { id: 'i04', titulo: '晚上十点，一轮酒守住这桌', pronta: true },
      { id: 'i05', titulo: '咖啡还没上，先向你抛来的五个问题', pronta: true },
      { id: 'i06', titulo: 'Ontem——把一天变成一个故事的四个词', pronta: true },
      { id: 'i07', titulo: '«Estava excelente»——那句能传到厨房的话，以及那句能拍板couvert的话', pronta: true },
      { id: 'i08', titulo: '被请进屋：手里一盆罗勒、桌上一句「vocês」、还有一次干杯', pronta: true },
      { id: 'i09', titulo: '属于你的一个下午：市场、日票，还有沙滩上的那面旗', pronta: true },
      { id: 'i10', titulo: 'Quanto custa——在东西端到桌上之前问', pronta: true },
    ]
  },
  {
    nivel: 'avancado',
    nome: 'Advanced · Read the room',
    descricao: 'The humour, the pride, the old argument, and what their silence means.',
    cor: 'indigo',
    licoes: [
      { id: 'a01', titulo: '那些不在场的音节', pronta: true },
      { id: 'a02', titulo: '那个笑话,是留给你自己讲的', pronta: true },
      { id: 'a03', titulo: '一台机器、一个日期、一种声音', pronta: true },
      { id: 'a04', titulo: '别人递给你的那场争论', pronta: true },
      { id: 'a05', titulo: '六个词,以及你原本指望的那门语言', pronta: true },
      { id: 'a06', titulo: '十三个日期、两个六月的夜晚、以及沙滩上那面旗', pronta: true },
      { id: 'a07', titulo: '温度计,就在对方怎么称呼你上', pronta: true },
      { id: 'a08', titulo: '最后一杯咖啡,以及你带回家的那张卡片', pronta: true },
    ]
  },
];

// Gerado de static/img/ — a home só pede imagem que existe.
export const COM_IMAGEM = new Set(["a01","a02","a03","a04","a05","a06","a07","a08","b01","b02","b03","b04","b05","b06","b07","b08","b09","b10","b11","b12","b13","b14","b15","b16","b17","b18","i01","i02","i03","i04","i05","i06","i07","i08","i09","i10"]);
