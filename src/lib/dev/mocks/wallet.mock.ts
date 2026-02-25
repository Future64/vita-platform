export const walletBalance = {
  balance: 47.5,
  pending_balance: 0,
  address: "VITAABCDEF1234567890ABCDEF1234",
  last_updated: new Date().toISOString(),
};

export const walletTransactions = [
  {
    id: "t1",
    amount: 1,
    direction: "in",
    memo: "Distribution quotidienne VITA",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    counterpart_address: "SYSTEM",
  },
  {
    id: "t2",
    amount: 5,
    direction: "out",
    memo: "Consultation medicale",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    counterpart_address: "VITAXXX...YYY",
  },
  {
    id: "t3",
    amount: 1,
    direction: "in",
    memo: "Distribution quotidienne VITA",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    counterpart_address: "SYSTEM",
  },
  {
    id: "t4",
    amount: 3,
    direction: "in",
    memo: "Cours de musique",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    counterpart_address: "VITAAAA...ZZZ",
  },
];
