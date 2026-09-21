export type TileType = "start" | "exercise" | "task" | "special";

export type RuleAction = "back" | "forward" | "goto" | "skip" | "reroll" | "win";

export type TileRule = {
  action: RuleAction;
  value: number;
  msg: string;
};

export type Tile = {
  num: number;
  type: TileType;
  text: string;
  short: string;
  rule: TileRule | null;
  fill: string;
};

const SPECIAL_PALETTE = [
  "#8fd4d8",
  "#f0c07a",
  "#d2b0ea",
  "#d7c09a",
  "#a8d0f0",
  "#bad48c",
];

const YELLOW = "#f3ef6a";
const WHITE = "#fffdf6";
const START = "#2fbe80";
const FINISH = "#f2d15c";

function specialFill(indexInSpecials: number) {
  return SPECIAL_PALETTE[indexInSpecials % SPECIAL_PALETTE.length];
}

let specialsSeen = 0;

function special(
  num: number,
  short: string,
  rule: TileRule,
  extraText = "",
): Tile {
  const fill = num === 62 ? FINISH : specialFill(specialsSeen++);
  return {
    num,
    type: "special",
    text: extraText,
    short,
    rule,
    fill,
  };
}

function exercise(num: number, text: string, short = text): Tile {
  return { num, type: "exercise", text, short, rule: null, fill: YELLOW };
}

function task(num: number, text: string, short = text): Tile {
  return { num, type: "task", text, short, rule: null, fill: WHITE };
}

export const TILES: Tile[] = [
  {
    num: 0,
    type: "start",
    text: "START",
    short: "START",
    rule: null,
    fill: START,
  },
  task(1, "", ""),
  exercise(2, "10x opdrukken", "10x opdrukken"),
  exercise(3, "50x knieheffen staand", "Knieheffen"),
  exercise(4, "20 rechte sit-ups", "20 sit-ups"),
  exercise(5, "20x springen op 2 voeten", "20x springen"),
  special(6, "2 terug", {
    action: "back",
    value: 2,
    msg: "2 plaatsen terug!",
  }),
  exercise(7, "1 min. appels plukken", "Appels plukken"),
  task(8, "Verzin een opdracht voor een ander", "Verzin opdracht"),
  special(9, "1 vooruit", {
    action: "forward",
    value: 1,
    msg: "1 plaats vooruit!",
  }),
  exercise(10, "30 sec. muurzit", "30s muurzit"),
  exercise(11, "1 min. rennen op de plaats", "Rennen"),
  task(12, "20x zo lang mogelijk muurzit", "20x muurzit"),
  exercise(13, "30 sec. balanceren op 1 been", "Balanceren"),
  special(14, "2 vooruit", {
    action: "forward",
    value: 2,
    msg: "2 plaatsen vooruit!",
  }),
  exercise(15, "1 min. lucht-zwemmen met de armen", "Zwemmen"),
  task(16, "1 min. rennen op de plaats", "Rennen"),
  exercise(17, "15x springen + grond aanraken", "Springen + tik"),
  special(18, "Naar 22", {
    action: "goto",
    value: 22,
    msg: "Ga direct naar vakje 22!",
  }),
  task(19, "45 sec. muurzit", "45s muurzit"),
  exercise(20, "10x squatten", "10x squatten"),
  exercise(21, "20x opdrukken tegen de muur", "Muur-push"),
  special(22, "Beurt over", {
    action: "skip",
    value: 1,
    msg: "1 beurt overslaan!",
  }),
  exercise(23, "15x springen + grond aanraken", "Springen + tik"),
  exercise(24, "30 sec. planken, daarna 10x squats", "Planken + squats"),
  task(25, "Loop naar de brievenbus en terug", "Brievenbus"),
  task(26, "20x opdrukken tegen de muur", "Muur-push"),
  special(27, "2 terug", {
    action: "back",
    value: 2,
    msg: "2 plaatsen terug!",
  }),
  exercise(28, "1 min. rennen op de plaats", "Rennen"),
  exercise(29, "1 min. rondjes draaien met de armen", "Armen rond"),
  exercise(30, "30 sec. planken", "30s planken"),
  task(31, "1x rondje om het huis heen lopen", "Rondje huis"),
  special(32, "1 vooruit", {
    action: "forward",
    value: 1,
    msg: "1 plaats vooruit!",
  }),
  task(33, "3x de trap op en neer", "3x de trap"),
  exercise(34, "Boksen in de lucht", "Boksen"),
  exercise(35, "Stap opzij en terug", "Stap opzij"),
  special(36, "Opnieuw", {
    action: "reroll",
    value: 0,
    msg: "Nogmaals gooien!",
  }),
  exercise(37, "10x squatten", "10x squatten"),
  exercise(38, "20x opdrukken tegen de muur", "Muur-push"),
  task(39, "50x boksen", "50x boksen"),
  special(40, "Naar 30", {
    action: "goto",
    value: 30,
    msg: "Ga terug naar vakje 30!",
  }),
  task(41, "20x sit-ups", "20x sit-ups"),
  task(42, "20x opstaan en zitten", "Opstaan-zitten"),
  task(43, "10x grond aantikken", "Grond aantikken"),
  exercise(44, "30 sec. muurzit", "30s muurzit"),
  special(45, "Naar start", {
    action: "goto",
    value: 0,
    msg: "Helaas! Terug naar START!",
  }),
  task(46, "20x klappen boven het hoofd", "Klappen"),
  task(47, "Loop snel naar de voordeur en terug", "Voordeur"),
  exercise(48, "1 min. touwtje springen", "Touwtje"),
  task(49, "30 sec. op 1 been staan", "Op 1 been"),
  special(50, "1 vooruit", {
    action: "forward",
    value: 1,
    msg: "1 plaats vooruit!",
  }),
  exercise(51, "10x hinkelen", "10x hinkelen"),
  special(52, "Opnieuw", {
    action: "reroll",
    value: 0,
    msg: "Nogmaals gooien!",
  }),
  exercise(53, "1 min. rugliggend fietsen in de lucht", "Fietsen"),
  task(54, "Verzin een opdracht voor een ander", "Verzin opdracht"),
  exercise(55, "10 meter op tenen lopen", "Op tenen lopen"),
  task(56, "3x de trap op en neer", "3x de trap"),
  exercise(57, "Boksen in de lucht", "Boksen"),
  special(58, "Beurt over", {
    action: "skip",
    value: 1,
    msg: "1 beurt overslaan!",
  }),
  special(59, "4 terug", {
    action: "back",
    value: 4,
    msg: "4 plaatsen terug!",
  }),
  task(60, "Naar voren uitvalspas en terug", "Uitvalspas"),
  task(61, "Een ander verzin een opdracht voor jou", "Opdracht voor jou"),
  special(62, "EIND", {
    action: "win",
    value: 0,
    msg: "Gefeliciteerd! Je hebt gewonnen!",
  }, "Lopen op de plaats tot de volgende beurt"),
];

export const LAST_TILE = 62;

export function wrapLabel(text: string, maxChars = 11): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}
