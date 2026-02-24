// Client API centralise pour VITA — communique avec le backend Rust
// Gere les tokens JWT, le refresh automatique, et les erreurs

const API_BASE = "/api/v1";

// --- Error class ---

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// --- Query param builder ---

function buildQuery(filters?: Record<string, unknown>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

// --- API Client class ---

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("vita_access_token", token);
    } else {
      localStorage.removeItem("vita_access_token");
    }
  }

  getToken(): string | null {
    if (!this.accessToken && typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("vita_access_token");
    }
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    if (typeof window === "undefined") return;
    localStorage.removeItem("vita_access_token");
    localStorage.removeItem("vita_refresh_token");
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      // Token expire — essayer de refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retryRes.ok) {
          throw new ApiError(retryRes.status, await retryRes.text());
        }
        if (retryRes.status === 204) return undefined as T;
        return retryRes.json();
      }
      // Refresh echoue — deconnecter
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("vita:unauthorized"));
      }
      throw new ApiError(401, "Session expiree");
    }

    if (!res.ok) {
      const errorBody = await res.text();
      throw new ApiError(res.status, errorBody);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const refreshToken = localStorage.getItem("vita_refresh_token");
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("vita_refresh_token", data.refresh_token);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ── AUTH ──────────────────────────────────────────────────────

  async register(data: {
    username: string;
    email: string;
    password: string;
    prenom: string;
    nom: string;
    date_naissance: string;
    pays: string;
    mode_visibilite?: string;
    pseudonyme?: string;
    nullifier_hash?: string;
  }) {
    // Map frontend field names to backend RegisterRequest fields
    // Backend now returns { message, email, user_id } instead of AuthResponse
    return this.request<{
      message: string;
      email: string;
      user_id: string;
    }>("POST", "/auth/register", {
      username: data.username,
      email: data.email,
      password: data.password,
      prenom_legal: data.prenom,
      nom_legal: data.nom,
      date_naissance: data.date_naissance,
      pays_residence: data.pays,
      mode_visibilite: data.mode_visibilite,
      pseudonyme: data.pseudonyme,
      nullifier_hash: data.nullifier_hash,
    });
  }

  async verifyEmail(token: string) {
    return this.request<{
      user: { id: string; username: string };
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("POST", "/auth/verify-email", { token });
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>(
      "POST",
      "/auth/resend-verification",
      { email }
    );
  }

  async login(data: { username_or_email: string; password: string }) {
    return this.request<{
      user: { id: string; username: string };
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("POST", "/auth/login", data);
  }

  async logout() {
    return this.request<void>("POST", "/auth/logout");
  }

  async getMe() {
    return this.request<{
      id: string;
      username: string;
      email: string;
      role: string;
      identite_publique: {
        mode_visibilite: string;
        prenom_affiche?: string;
        nom_affiche?: string;
        pseudonyme?: string;
        bio?: string;
        photo_profil?: string;
        pays_affiche?: string;
      };
      verification: {
        statut: string;
        date?: string;
        expiration?: string;
        niveau_confiance: number;
      };
      wallet?: {
        id: string;
        balance: string;
        total_received: string;
      };
      date_inscription: string;
      derniere_connexion?: string;
    }>("GET", "/auth/me");
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("PUT", "/auth/me", data);
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
  }) {
    return this.request<void>("PUT", "/auth/me/password", data);
  }

  // ── GOVERNANCE ───────────────────────────────────────────────

  async getDoleances(filters?: Record<string, unknown>) {
    return this.request<unknown[]>(
      "GET",
      `/governance/doleances${buildQuery(filters)}`
    );
  }

  async getDoleance(id: string) {
    return this.request<unknown>("GET", `/governance/doleances/${id}`);
  }

  async createDoleance(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/governance/doleances", data);
  }

  async soutenirDoleance(id: string) {
    return this.request<void>("POST", `/governance/doleances/${id}/soutenir`);
  }

  async convertirDoleance(id: string) {
    return this.request<unknown>(
      "POST",
      `/governance/doleances/${id}/convertir`
    );
  }

  async getPropositions(filters?: Record<string, unknown>) {
    return this.request<unknown[]>(
      "GET",
      `/governance/propositions${buildQuery(filters)}`
    );
  }

  async getProposition(id: string) {
    return this.request<unknown>("GET", `/governance/propositions/${id}`);
  }

  async createProposition(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/governance/propositions", data);
  }

  async voter(
    propositionId: string,
    choix: "pour" | "contre" | "abstention"
  ) {
    return this.request<void>(
      "POST",
      `/governance/propositions/${propositionId}/vote`,
      { choix }
    );
  }

  async passageVote(propositionId: string) {
    return this.request<unknown>(
      "POST",
      `/governance/propositions/${propositionId}/passage-vote`
    );
  }

  async cloturerVote(propositionId: string) {
    return this.request<unknown>(
      "POST",
      `/governance/propositions/${propositionId}/cloturer`
    );
  }

  async getResultats(propositionId: string) {
    return this.request<unknown>(
      "GET",
      `/governance/propositions/${propositionId}/resultats`
    );
  }

  async getFils(propositionId: string) {
    return this.request<unknown[]>(
      "GET",
      `/governance/propositions/${propositionId}/fils`
    );
  }

  async createFil(propositionId: string, data: Record<string, unknown>) {
    return this.request<unknown>(
      "POST",
      `/governance/propositions/${propositionId}/fils`,
      data
    );
  }

  async getMessages(filId: string) {
    return this.request<unknown[]>(
      "GET",
      `/governance/fils/${filId}/messages`
    );
  }

  async createMessage(filId: string, data: Record<string, unknown>) {
    return this.request<unknown>(
      "POST",
      `/governance/fils/${filId}/messages`,
      data
    );
  }

  async reagirMessage(msgId: string, data: Record<string, unknown>) {
    return this.request<unknown>(
      "POST",
      `/governance/messages/${msgId}/reaction`,
      data
    );
  }

  async getParametres() {
    return this.request<unknown[]>("GET", "/governance/parametres");
  }

  async getParametre(nom: string) {
    return this.request<unknown>("GET", `/governance/parametres/${nom}`);
  }

  async getHistoriqueParametre(nom: string) {
    return this.request<unknown[]>(
      "GET",
      `/governance/parametres/${nom}/historique`
    );
  }

  // ── TRANSACTIONS ─────────────────────────────────────────────

  async transfer(data: {
    from_id: string;
    to_id: string;
    amount: string;
    note?: string;
  }) {
    return this.request<{
      transaction_id: string;
      amount: string;
      common_fund_contribution: string;
      net_amount: string;
      new_sender_balance: string;
      timestamp: string;
    }>("POST", "/transactions/transfer", data);
  }

  async getTransactions(accountId: string, limit = 20, offset = 0) {
    return this.request<unknown[]>(
      "GET",
      `/transactions/${accountId}?limit=${limit}&offset=${offset}`
    );
  }

  // ── EMISSIONS ────────────────────────────────────────────────

  async claimEmission() {
    return this.request<{
      emission_date: string;
      amount: string;
      new_balance: string;
    }>("POST", "/emissions/claim");
  }

  async getEmissionHistory(accountId: string) {
    return this.request<unknown[]>("GET", `/emissions/${accountId}`);
  }

  // ── ACCOUNTS ─────────────────────────────────────────────────

  async createAccount(displayName?: string) {
    return this.request<unknown>("POST", "/accounts", {
      display_name: displayName ?? null,
    });
  }

  async getAccount(id: string) {
    return this.request<unknown>("GET", `/accounts/${id}`);
  }

  // ── VALUATION ────────────────────────────────────────────────

  async calculateValuation(data: {
    time_hours: number;
    formation: number;
    penibility: number;
    responsibility: number;
    rarity: number;
    materials_cost: number;
  }) {
    return this.request<{
      value_vita: string;
      breakdown: {
        base_time: string;
        multiplier: string;
        materials: string;
        total: string;
      };
    }>("POST", "/valuation/calculate", data);
  }

  // ── IDENTITY ─────────────────────────────────────────────────

  async createDemandeVerification(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/identity/demande", data);
  }

  async getDemandeActive() {
    return this.request<unknown | null>("GET", "/identity/demande");
  }

  async annulerDemande() {
    return this.request<void>("DELETE", "/identity/demande");
  }

  async inviterParrain(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/identity/demande/inviter", data);
  }

  async relancerParrain(parrainageId: string) {
    return this.request<void>(
      "POST",
      `/identity/demande/${parrainageId}/relancer`
    );
  }

  async getParrainagesRecus() {
    return this.request<unknown[]>("GET", "/identity/parrainages");
  }

  async attester(parrainageId: string, data: Record<string, unknown>) {
    return this.request<unknown>(
      "POST",
      `/identity/parrainages/${parrainageId}/attester`,
      data
    );
  }

  async refuserParrainage(parrainageId: string, data?: Record<string, unknown>) {
    return this.request<void>(
      "POST",
      `/identity/parrainages/${parrainageId}/refuser`,
      data
    );
  }

  async getCompteurParrainages() {
    return this.request<{ en_attente: number; total: number }>(
      "GET",
      "/identity/parrainages/compteur"
    );
  }

  async searchParrains(query: string) {
    return this.request<unknown[]>(
      "GET",
      `/identity/parrains-potentiels?q=${encodeURIComponent(query)}`
    );
  }

  async getHistoriqueVerifications() {
    return this.request<unknown[]>("GET", "/identity/verifications");
  }

  // ── NOTIFICATIONS ───────────────────────────────────────────

  async getNotifications() {
    return this.request<{
      notifications: Array<{
        id: string;
        type: string;
        titre: string;
        contenu: string;
        lien: string | null;
        lue: boolean;
        created_at: string;
      }>;
      unread_count: number;
    }>("GET", "/notifications");
  }

  async markAllNotificationsRead() {
    return this.request<{ ok: boolean }>(
      "POST",
      "/notifications/mark-read"
    );
  }

  async markNotificationRead(id: string) {
    return this.request<{ ok: boolean }>(
      "POST",
      `/notifications/${id}/read`
    );
  }

  // ── AUDIT ────────────────────────────────────────────────────

  async getAuditLogs(filters?: Record<string, unknown>) {
    return this.request<unknown[]>(
      "GET",
      `/audit/logs${buildQuery(filters)}`
    );
  }

  async getAuditLogDetail(id: string) {
    return this.request<unknown>("GET", `/audit/logs/${id}`);
  }

  async verifyAuditIntegrity() {
    return this.request<unknown>("POST", "/audit/verify");
  }

  async getAuditStatus() {
    return this.request<unknown>("GET", "/audit/status");
  }

  async exportAuditLogs(filters?: Record<string, unknown>) {
    return this.request<unknown>(
      "GET",
      `/audit/export${buildQuery(filters)}`
    );
  }

  // ── CRYPTO ───────────────────────────────────────────────────

  async getMerkleRoots() {
    return this.request<unknown[]>("GET", "/crypto/merkle/roots");
  }

  async getMerkleProof(txId: string) {
    return this.request<unknown>("GET", `/crypto/merkle/proof/${txId}`);
  }

  async verifyMerkleTree(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/crypto/merkle/verify", data);
  }

  async getPublicKey(userId: string) {
    return this.request<unknown>("GET", `/crypto/pubkey/${userId}`);
  }

  async verifyTransactionSignature(txId: string) {
    return this.request<unknown>("GET", `/crypto/verify-tx/${txId}`);
  }

  // ── CODEX ────────────────────────────────────────────────────

  async getCodexTitles() {
    return this.request<unknown[]>("GET", "/codex/titles");
  }

  async getCodexArticles(titleId?: string) {
    const params = titleId ? `?title_id=${titleId}` : "";
    return this.request<unknown[]>("GET", `/codex/articles${params}`);
  }

  async getCodexArticle(number: number) {
    return this.request<unknown>("GET", `/codex/articles/${number}`);
  }

  async getCodexArticleVersions(number: number) {
    return this.request<unknown[]>(
      "GET",
      `/codex/articles/${number}/versions`
    );
  }

  async getCodexExportJson() {
    return this.request<unknown>("GET", "/codex/export/json");
  }

  async createAmendment(data: Record<string, unknown>) {
    return this.request<unknown>("POST", "/codex/amendments", data);
  }

  async getAmendments(status?: string) {
    const params = status ? `?status=${status}` : "";
    return this.request<unknown[]>("GET", `/codex/amendments${params}`);
  }

  // ── CREDIT ───────────────────────────────────────────────────

  async getCreditEligibility(accountId: string) {
    return this.request<{
      eligible: boolean;
      max_amount: string;
      reason: string | null;
    }>("GET", `/credit/eligibility/${accountId}`);
  }

  async requestCredit(data: { account_id: string; amount: string }) {
    return this.request<unknown>("POST", "/credit/request", data);
  }

  async getCreditLoans(accountId: string) {
    return this.request<unknown[]>("GET", `/credit/loans/${accountId}`);
  }

  // ── STATISTICS ──────────────────────────────────────────────

  async getStatisticsSummary() {
    return this.request<{
      verified_accounts: number;
      total_accounts: number;
      monetary_mass: string;
      total_emissions: number;
      transactions_24h: number;
      volume_24h: string;
      active_proposals: number;
      total_proposals: number;
      common_fund_balance: string;
      audit_chain_intact: boolean;
      timestamp: string;
    }>("GET", "/statistics/summary");
  }

  // ── HEALTH ───────────────────────────────────────────────────

  async health() {
    return this.request<{ status: string; version: string }>(
      "GET",
      "/health"
    );
  }
}

export const api = new ApiClient();
