
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  uploadedData: any[];
  invalidRows: number[];
  isProcessing: boolean;
  isUploaded: boolean;
  onRunEvaluation: () => void;
}

const ActionBar = ({
  uploadedData,
  invalidRows,
  isProcessing,
  isUploaded,
  onRunEvaluation,
}: ActionBarProps) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md flex items-center">
            <span className="font-medium mr-1">{uploadedData.length}</span> Questions
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md flex items-center">
            <span className="font-medium mr-1">{invalidRows.length > 0 ? uploadedData.length - invalidRows.length : uploadedData.length}</span> Valid
          </div>
          {invalidRows.length > 0 && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md flex items-center">
              <span className="font-medium mr-1">{invalidRows.length}</span> Invalid
            </div>
          )}
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!isUploaded || isProcessing || uploadedData.length === 0} 
          onClick={onRunEvaluation}
        >
          {isProcessing ? "Processing..." : "Run Evaluation"}
        </Button>
      </div>
    </Card>
  );
};

export default ActionBar;
