export const panoramaSummary = {
  balance: 47.5,
  recent_transactions: [
    { id: "t1", amount: 1, direction: "in", memo: "Distribution quotidienne", created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "t2", amount: 5, direction: "out", memo: "Consultation medicale", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "t3", amount: 1, direction: "in", memo: "Distribution quotidienne", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
  active_votes_count: 2,
  notifications: [
    {
      id: "n1",
      type: "daily_vita",
      title: "Votre Ѵ quotidien est arrive",
      body: "+1 Ѵ credite",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  daily_vita_received: true,
  next_vita_in_seconds: 54000,
};

export const statisticsSummary = {
  verified_accounts: 1247,
  total_accounts: 2891,
  monetary_mass: "148293.00000000",
  total_emissions: 148293,
  transactions_24h: 342,
  volume_24h: "1847.50000000",
  active_proposals: 2,
  total_proposals: 15,
  common_fund_balance: "2965.86000000",
  audit_chain_intact: true,
  timestamp: new Date().toISOString(),
};
