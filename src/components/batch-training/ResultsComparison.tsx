
import React from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Check, X } from "lucide-react";

interface DataRow {
  id: number;
  question: string;
  expectedAnswer: string;
  generatedAnswer?: string;
  generatedSQL?: string;
  isCorrect?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

interface ResultsComparisonProps {
  selectedQuestion: DataRow | null;
  hasResults: boolean;
}

const ResultsComparison = ({
  selectedQuestion,
  hasResults,
}: ResultsComparisonProps) => {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Results Comparison</h3>
      </div>
      
      {!selectedQuestion ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
          {hasResults ? "Select a question to view result details" : "Run evaluation to see results comparison"}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Original Question</h4>
              <div className="p-3 rounded-md bg-slate-50 border">
                {selectedQuestion.question}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Generated SQL</h4>
              <pre className="p-3 rounded-md bg-slate-50 border text-xs font-mono overflow-x-auto">
                {selectedQuestion.generatedSQL}
              </pre>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Expected Answer</h4>
                <div className="p-3 rounded-md bg-slate-50 border h-24 overflow-auto">
                  {selectedQuestion.expectedAnswer}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Actual Answer</h4>
                <div className="p-3 rounded-md bg-slate-50 border h-24 overflow-auto">
                  {selectedQuestion.hasError ? (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle size={16} className="mr-2" />
                      Error: {selectedQuestion.errorMessage}
                    </div>
                  ) : selectedQuestion.generatedAnswer}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Result</h4>
              <div className={`p-3 rounded-md ${
                selectedQuestion.hasError 
                  ? "bg-red-50 border-red-200 text-red-700" 
                  : selectedQuestion.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
              } border flex items-center`}>
                {selectedQuestion.hasError ? (
                  <>
                    <X size={18} className="mr-2" />
                    Error: Unable to generate valid SQL
                  </>
                ) : selectedQuestion.isCorrect ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Correct: Answer matches expected output
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="mr-2" />
                    Incorrect: Answer doesn't match expected output
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ResultsComparison;
