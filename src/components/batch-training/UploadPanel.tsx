
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadPanelProps {
  onUpload: () => void;
}

const UploadPanel = ({ onUpload }: UploadPanelProps) => {
  return (
    <Card className="p-4 flex-1">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 h-full flex flex-col items-center justify-center text-center">
        <Upload className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload QnA Dataset</h3>
        <p className="text-sm text-slate-500 mb-6">
          Drop a CSV or Excel file with your questions and expected answers
        </p>
        <Button onClick={onUpload}>Select File</Button>
        <p className="text-xs text-slate-400 mt-4">
          File must contain columns for "Question" and "ExpectedAnswer"
        </p>
      </div>
    </Card>
  );
};

export default UploadPanel;
