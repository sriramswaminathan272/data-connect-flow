
import React from "react";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";

const HypothesisTesting = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <FlaskConical size={28} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Hypothesis Testing</h1>
        </div>
        <p className="mt-2 text-slate-600">Validate your data-driven hypotheses with statistical tests</p>
      </header>

      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Start Testing Hypotheses</h2>
          <p className="text-slate-600 mb-8">
            Design experiments, run statistical tests, and interpret results to validate or reject your hypotheses.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create New Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HypothesisTesting;
