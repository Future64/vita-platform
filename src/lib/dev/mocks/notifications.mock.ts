export const notificationsList = {
  notifications: [
    {
      id: "n1",
      type: "daily_vita",
      titre: "Votre Ѵ quotidien est arrive",
      contenu: "Vous avez recu 1 Ѵ aujourd'hui.",
      lien: "/bourse",
      lue: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "n2",
      type: "vote_closed",
      titre: "Vote cloture",
      contenu: "La proposition sur le quorum a ete adoptee.",
      lien: "/agora",
      lue: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "n3",
      type: "transfer_received",
      titre: "Vous avez recu 3 Ѵ",
      contenu: "Cours de musique — de priya",
      lien: "/bourse",
      lue: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  unread_count: 2,
};
