
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";

const ScenarioAnalysis = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BarChart2 size={28} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Scenario Analysis</h1>
        </div>
        <p className="mt-2 text-slate-600">Model different scenarios and predict outcomes</p>
      </header>

      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Simulate Scenarios</h2>
          <p className="text-slate-600 mb-8">
            Create and compare different scenarios to understand potential outcomes and optimize your decision-making.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create New Scenario
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysis;
