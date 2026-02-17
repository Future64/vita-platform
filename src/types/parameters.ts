// Types pour le systeme de parametres VITA

export type ParameterCategory = 'immuable' | 'gouvernance' | 'technique';

export interface SystemParameter {
  id: string;
  name: string;
  description: string;
  category: ParameterCategory;
  currentValue: number | string | boolean;
  unit?: string;
  allowedRange?: { min: number; max: number };
  requiredQuorum?: number;
  requiredThreshold?: number;
  lastModified?: string;
  lastModifiedByVote?: string;
  history: ParameterChange[];
  technicalDocSection?: string;
}

export interface ParameterChange {
  id: string;
  date: string;
  oldValue: number | string | boolean;
  newValue: number | string | boolean;
  proposalId?: string;
  voteResult?: {
    pour: number;
    contre: number;
    abstention: number;
    participation: number;
  };
  proposedBy: string;
  justification: string;
  status: 'initial' | 'adopted' | 'rejected' | 'applied';
}

export interface ParameterChangeProposal {
  type: 'modification_parametre';
  parameterId: string;
  parameterName: string;
  currentValue: number | string | boolean;
  proposedValue: number | string | boolean;
  allowedRange?: { min: number; max: number };
  justification: string;
  impactAnalysis?: string;
  requiredQuorum: number;
  requiredThreshold: number;
  technicalDocLink: string;
}
