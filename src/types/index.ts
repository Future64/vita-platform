// Types pour le système VITA

// Utilisateur/Citoyen
export interface User {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  verified: boolean;
  isDelegate: boolean;
  activeDays: number;
  participationRate: number;
  delegatesCount: number;
  reliabilityScore: number;
  createdAt: Date;
}

// Portefeuille
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  ppaCoefficient: number;
  accounts: Account[];
}

export interface Account {
  id: string;
  name: string;
  type: 'main' | 'savings' | 'shared';
  balance: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'allocation' | 'payment' | 'bonus' | 'transfer';
  amount: number;
  direction: 'in' | 'out';
  description: string;
  counterparty?: string;
  createdAt: Date;
}

// Propositions et Votes
export interface Proposal {
  id: string;
  title: string;
  description: string;
  content: string;
  domain: ProposalDomain;
  status: ProposalStatus;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  commentsCount: number;
  contributorsCount: number;
  deadline?: Date;
  relatedArticle?: Article;
  projectId?: string;
}

export type ProposalDomain = 
  | 'economy' 
  | 'environment' 
  | 'social' 
  | 'governance' 
  | 'health' 
  | 'education'
  | 'culture';

export type ProposalStatus = 
  | 'draft' 
  | 'grievance' 
  | 'proposal' 
  | 'collaborative' 
  | 'voting' 
  | 'adopted' 
  | 'rejected' 
  | 'archived';

// Constitution et Lois (Codex)
export interface Article {
  id: string;
  number: string;
  title: string;
  sections: Section[];
  documentType: 'constitution' | 'law' | 'decree';
  documentId: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  number: string;
  content: string;
}

export interface Document {
  id: string;
  type: 'constitution' | 'law' | 'decree';
  code?: string; // ex: LOI-2025-042
  title: string;
  version: string;
  status: 'active' | 'modified' | 'archived';
  articles: Article[];
  amendmentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Système Git-like (Forge)
export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'constitution' | 'law' | 'decree';
  status: ProjectStatus;
  mainBranch: Branch;
  branches: Branch[];
  author: User;
  createdAt: Date;
  updatedAt: Date;
  targetDocument?: Document;
  targetArticle?: Article;
}

export type ProjectStatus = 
  | 'draft' 
  | 'review' 
  | 'collaborative' 
  | 'voting' 
  | 'adopted' 
  | 'rejected';

export interface Branch {
  id: string;
  name: string;
  projectId: string;
  isMain: boolean;
  isProtected: boolean;
  author: User;
  commits: Commit[];
  aheadCount: number;
  behindCount: number;
  approvalRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commit {
  id: string;
  hash: string;
  message: string;
  description?: string;
  author: User;
  branchId: string;
  changes: Change[];
  votesFor: number;
  votesAgainst: number;
  createdAt: Date;
}

export interface Change {
  id: string;
  filePath: string;
  type: 'add' | 'modify' | 'delete';
  additions: number;
  deletions: number;
  diff: DiffLine[];
}

export interface DiffLine {
  lineNumber: number;
  type: 'context' | 'add' | 'remove';
  content: string;
}

export interface MergeRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  sourceBranch: Branch;
  targetBranch: Branch;
  projectId: string;
  status: MergeRequestStatus;
  author: User;
  hasConflicts: boolean;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorum: number;
  requiredMajority: number;
  minDuration: number; // jours
  documents: MRDocument[];
  comments: Comment[];
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MergeRequestStatus = 
  | 'draft' 
  | 'open' 
  | 'voting' 
  | 'approved' 
  | 'merged' 
  | 'rejected' 
  | 'closed';

export interface MRDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  replyTo?: string;
  lineRef?: number; // pour les commentaires sur le code
  createdAt: Date;
}

// Vote
export interface Vote {
  id: string;
  userId: string;
  targetType: 'proposal' | 'commit' | 'mergeRequest';
  targetId: string;
  value: 'for' | 'against' | 'abstain';
  delegated: boolean;
  delegateId?: string;
  createdAt: Date;
}

// Statistiques globales (Panorama)
export interface GlobalStats {
  activeCitizens: number;
  activeCitizensGrowth: number;
  monetaryMass: number;
  monetaryMassGrowth: number;
  dailyTransactions: number;
  dailyTransactionsGrowth: number;
  participationRate: number;
  participationRateGrowth: number;
  activeProjects: number;
  activeProjectsGrowth: number;
  activeCountries: number;
}

// Navigation
export interface Module {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface SidebarItem {
  icon: string;
  label: string;
  badge?: string;
  badgeType?: 'violet' | 'pink' | 'cyan' | 'green' | 'orange' | 'red' | 'yellow';
  active?: boolean;
  href?: string;
  onClick?: () => void;
}
