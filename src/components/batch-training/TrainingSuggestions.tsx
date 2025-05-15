
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Database, FileText } from "lucide-react";

interface TrainingSuggestion {
  area: string;
  description: string;
  severity: "low" | "medium" | "high";
  examples: string[];
}

interface TrainingSuggestionsProps {
  trainingSuggestions: TrainingSuggestion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrainingSuggestions = ({
  trainingSuggestions,
  open,
  onOpenChange,
}: TrainingSuggestionsProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Training Suggestions</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Training Recommendations
            </h4>
            <p className="text-sm text-blue-700">
              Based on evaluation results, we've identified areas where your knowledge graph could use additional training data.
            </p>
          </div>
          
          <div className="space-y-3">
            {trainingSuggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Badge className={getSeverityColor(suggestion.severity)}>
                      {suggestion.severity.toUpperCase()}
                    </Badge>
                    <h4 className="ml-3 font-medium">{suggestion.area}</h4>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {suggestion.description}
                </p>
                <div className="bg-slate-50 rounded-md p-3">
                  <h5 className="text-xs font-medium text-slate-500 mb-2">EXAMPLE QUESTIONS</h5>
                  <ul className="space-y-2 text-sm">
                    {suggestion.examples.map((example, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center mr-2 text-xs">
                          {i+1}
                        </span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="p-4 border-2 border-dashed">
            <div className="text-center space-y-3">
              <h4 className="font-medium">Improve Your Knowledge Graph</h4>
              <p className="text-sm text-slate-600">
                Upload more documentation or SQL examples for the areas highlighted in the suggestions
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="sm" variant="outline">
                  <FileText size={16} className="mr-2" />
                  Add Documentation
                </Button>
                <Button size="sm" variant="outline">
                  <Database size={16} className="mr-2" />
                  Add SQL Examples
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TrainingSuggestions;
