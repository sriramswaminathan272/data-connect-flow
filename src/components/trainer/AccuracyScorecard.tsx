
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart4 } from "lucide-react";

interface AccuracyScorecardProps {
  accuracy: number;
}

const AccuracyScorecard = ({ accuracy }: AccuracyScorecardProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="col-span-2 shadow-sm flex flex-col">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={accuracy >= 80 ? "#10b981" : accuracy >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="16"
                  strokeDasharray={`${accuracy * 5.02} 502`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 96 96)"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-5xl font-bold">{accuracy}%</div>
                <div className="text-slate-500 text-sm">Accuracy</div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Knowledge Graph Performance</h2>
            <p className="text-slate-600 text-center">
              Your knowledge graph is performing well, but there&apos;s room for improvement.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Total Documents</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">48</span>
              <span className="text-green-600 text-sm">+12 this week</span>
            </div>
            <Progress value={48} className="h-1.5 mt-2" />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">SQL Accuracy</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">83%</span>
              <span className="text-green-600 text-sm">+5% this week</span>
            </div>
            <Progress value={83} className="h-1.5 mt-2" />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">NL Understanding</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">72%</span>
              <span className="text-amber-600 text-sm">-2% this week</span>
            </div>
            <Progress value={72} className="h-1.5 mt-2" />
          </div>
          
          <div className="h-24 bg-slate-50 rounded-md flex items-center justify-center">
            <BarChart4 className="text-slate-300" size={48} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccuracyScorecard;
