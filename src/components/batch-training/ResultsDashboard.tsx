
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultStats {
  total: number;
  correct: number;
  incorrect: number;
  errors: number;
}

interface ResultsByTable {
  tableName: string;
  accuracy: number;
  questions: number;
  correct: number;
}

interface ResultsDashboardProps {
  accuracyScore: number;
  resultStats: ResultStats;
  resultsByTable: ResultsByTable[];
}

const ResultsDashboard = ({
  accuracyScore,
  resultStats,
  resultsByTable,
}: ResultsDashboardProps) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Evaluation Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Accuracy Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-2">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke={accuracyScore >= 80 ? "#10b981" : accuracyScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="6"
                  strokeDasharray={`${accuracyScore * 3.77} 377`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-bold">{accuracyScore}%</div>
                <div className="text-slate-500 text-xs">Accuracy</div>
              </div>
            </div>
          </div>
          
          {/* Tables with poor performance */}
          <div className="col-span-2">
            <h4 className="text-sm font-medium text-slate-500 mb-2">Tables with Low Accuracy</h4>
            <div className="grid grid-cols-2 gap-2">
              {resultsByTable
                .filter(table => table.accuracy < 70)
                .map((table) => (
                  <div 
                    key={table.tableName} 
                    className="p-3 border rounded-md bg-red-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{table.tableName}</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {table.accuracy}%
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {table.correct} / {table.questions} questions correct
                    </div>
                  </div>
                ))}
              {resultsByTable.filter(table => table.accuracy < 70).length === 0 && (
                <div className="col-span-2 p-3 border rounded-md bg-emerald-50 text-emerald-700">
                  All tables have acceptable accuracy levels
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Outcome Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Outcomes</span>
            <span>{resultStats.total} questions</span>
          </div>
          <div className="h-5 flex rounded-md overflow-hidden">
            <div 
              className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(resultStats.correct / resultStats.total) * 100}%` }}
            >
              {resultStats.correct} correct
            </div>
            <div 
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(resultStats.incorrect / resultStats.total) * 100}%` }}
            >
              {resultStats.incorrect} incorrect
            </div>
            <div 
              className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(resultStats.errors / resultStats.total) * 100}%` }}
            >
              {resultStats.errors} errors
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsDashboard;
