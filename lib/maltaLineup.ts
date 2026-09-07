export type PitchPlayer = {
  id: string;
  name: string;
  short: string;
  number: number;
  role: string;
  x: number;
  y: number;
  captain?: boolean;
};

export const MALTA_XI = {
  formation: "4-2-3-1",
  title: "Malta-selectie",
  note: "Recente basis · vs Luxemburg, maart 2026. Officiële elf volgt vlak voor de wedstrijd.",
  players: [
    { id: "bonello", name: "Henry Bonello", short: "Bonello", number: 1, role: "Keeper", x: 50, y: 10 },
    { id: "camenzuli", name: "Ryan Camenzuli", short: "Camenzuli", number: 3, role: "Linksback", x: 14, y: 30 },
    { id: "pepe", name: "Enrico Pepe", short: "Pepe", number: 13, role: "Centrale verdediger", x: 36, y: 26 },
    { id: "shaw", name: "Kurt Shaw", short: "Shaw", number: 5, role: "Centrale verdediger", x: 64, y: 26 },
    { id: "muscat", name: "Zach Muscat", short: "Muscat", number: 22, role: "Rechtsback", x: 86, y: 30 },
    { id: "teuma", name: "Teddy Teuma", short: "Teuma", number: 10, role: "Middenveld", x: 34, y: 50 },
    {
      id: "guillaumier",
      name: "Matthew Guillaumier",
      short: "Guillaumier",
      number: 6,
      role: "Aanvoerder",
      x: 66,
      y: 50,
      captain: true,
    },
    { id: "chouaref", name: "Ilyas Chouaref", short: "Chouaref", number: 20, role: "Linksbuiten", x: 18, y: 70 },
    { id: "cardona", name: "Irvin Cardona", short: "Cardona", number: 11, role: "Tien", x: 50, y: 68 },
    { id: "mbong", name: "Paul Mbong", short: "Mbong", number: 8, role: "Rechtsbuiten", x: 82, y: 70 },
    { id: "satariano", name: "Alexander Satariano", short: "Satariano", number: 23, role: "Spits", x: 50, y: 88 },
  ] satisfies PitchPlayer[],
};
