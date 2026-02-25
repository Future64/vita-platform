export const codexArticles = [
  { id: "a1", number: 1, name: "Principe d'existence", category: "fondements", immutable: true, version: 1 },
  { id: "a2", number: 2, name: "Definition du Ѵ (VITA)", category: "fondements", immutable: true, version: 1 },
  { id: "a3", number: 3, name: "Unicite de l'identite", category: "fondements", immutable: true, version: 1 },
  { id: "a4", number: 4, name: "Confidentialite", category: "fondements", immutable: true, version: 1 },
  { id: "a5", number: 5, name: "Unite de compte", category: "economie", immutable: false, version: 2 },
  { id: "a6", number: 6, name: "Interdiction de la speculation", category: "economie", immutable: false, version: 1 },
  { id: "a7", number: 7, name: "Valorisation des services", category: "economie", immutable: false, version: 1 },
  { id: "a8", number: 11, name: "L'Agora", category: "gouvernance", immutable: false, version: 1 },
  { id: "a9", number: 12, name: "Le Codex", category: "gouvernance", immutable: false, version: 1 },
  { id: "a10", number: 13, name: "La Forge", category: "gouvernance", immutable: false, version: 1 },
];

export const codexTitles = [
  {
    id: "t1",
    number: 1,
    name: "Fondements constitutionnels",
    articles: codexArticles.filter((a) => a.category === "fondements"),
  },
  {
    id: "t2",
    number: 2,
    name: "Systeme economique",
    articles: codexArticles.filter((a) => a.category === "economie"),
  },
  {
    id: "t3",
    number: 3,
    name: "Gouvernance",
    articles: codexArticles.filter((a) => a.category === "gouvernance"),
  },
];
