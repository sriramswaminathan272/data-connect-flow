
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, Check } from "lucide-react";

interface AskTheDbPanelProps {
  nlQuestion: string;
  setNlQuestion: (value: string) => void;
  generatedSQL: string;
  setGeneratedSQL: (value: string) => void;
}

const AskTheDbPanel = ({
  nlQuestion,
  setNlQuestion,
  generatedSQL,
  setGeneratedSQL,
}: AskTheDbPanelProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Ask the DB</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="mb-2 flex justify-between items-center">
              <label className="text-sm font-medium">Natural Language Query</label>
            </div>
            <textarea 
              className="w-full border rounded-md p-2 text-sm"
              rows={2}
              value={nlQuestion}
              onChange={(e) => setNlQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
            />
          </div>
          
          <div>
            <div className="mb-2 flex justify-between items-center">
              <label className="text-sm font-medium">Generated SQL</label>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                  Run
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                  Edit
                </Button>
              </div>
            </div>
            <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-x-auto">
              {generatedSQL}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Results</h3>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-2 font-medium">customer_id</th>
                    <th className="text-left p-2 font-medium">name</th>
                    <th className="text-left p-2 font-medium">email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">1042</td>
                    <td className="p-2">Jane Cooper</td>
                    <td className="p-2">jane.cooper@example.com</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">1057</td>
                    <td className="p-2">Wade Warren</td>
                    <td className="p-2">wade.warren@example.com</td>
                  </tr>
                  <tr>
                    <td className="p-2">1063</td>
                    <td className="p-2">Esther Howard</td>
                    <td className="p-2">esther.howard@example.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex gap-1 items-center">
              <Flag size={14} />
              Flag Issue
            </Button>
            <Button variant="default" size="sm" className="flex gap-1 items-center bg-green-600 hover:bg-green-700">
              <Check size={14} />
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AskTheDbPanel;
