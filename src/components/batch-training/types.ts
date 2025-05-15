
export interface DataRow {
  id: number;
  question: string;
  expectedAnswer: string;
  generatedAnswer?: string;
  generatedSQL?: string;
  isCorrect?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export interface ResultsByTable {
  tableName: string;
  accuracy: number;
  questions: number;
  correct: number;
}

export interface ResultsBySchema {
  schemaName: string;
  accuracy: number;
  questions: number;
  correct: number;
}

export interface TrainingSuggestion {
  area: string;
  description: string;
  severity: "low" | "medium" | "high";
  examples: string[];
}

export interface ResultStats {
  total: number;
  correct: number;
  incorrect: number;
  errors: number;
}
