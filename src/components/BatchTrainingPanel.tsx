
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Database } from "lucide-react";
import { DataRow, ResultStats, ResultsByTable, ResultsBySchema, TrainingSuggestion } from "./batch-training/types";
import UploadPanel from "./batch-training/UploadPanel";
import ActionBar from "./batch-training/ActionBar";
import ResultsDashboard from "./batch-training/ResultsDashboard";
import DatasetPreview from "./batch-training/DatasetPreview";
import ResultsComparison from "./batch-training/ResultsComparison";
import TrainingSuggestions from "./batch-training/TrainingSuggestions";

const BatchTrainingPanel = () => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [uploadedData, setUploadedData] = useState<DataRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<number[]>([]);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [resultStats, setResultStats] = useState<ResultStats>({
    total: 0,
    correct: 0,
    incorrect: 0,
    errors: 0,
  });
  const [resultsByTable, setResultsByTable] = useState<ResultsByTable[]>([]);
  const [resultsBySchema, setResultsBySchema] = useState<ResultsBySchema[]>([]);
  const [trainingSuggestions, setTrainingSuggestions] = useState<TrainingSuggestion[]>([]);
  const [suggestionsPanelOpen, setSuggestionsPanelOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Mock data for the demo
  const mockData: DataRow[] = [
    { 
      id: 1, 
      question: "How many customers made more than 5 orders last month?", 
      expectedAnswer: "42", 
      generatedAnswer: "42",
      generatedSQL: "SELECT COUNT(*) FROM customers WHERE order_count > 5 AND order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      isCorrect: true,
      hasError: false 
    },
    { 
      id: 2, 
      question: "What's the average order value for the electronics category?", 
      expectedAnswer: "$156.78", 
      generatedAnswer: "$148.32",
      generatedSQL: "SELECT AVG(order_total) FROM orders WHERE category = 'electronics'",
      isCorrect: false,
      hasError: false 
    },
    { 
      id: 3, 
      question: "Who are the top 3 customers by lifetime value?", 
      expectedAnswer: "John Smith, Jane Doe, Robert Johnson", 
      generatedAnswer: "John Smith, Jane Doe, Robert Johnson",
      generatedSQL: "SELECT name FROM customers ORDER BY lifetime_value DESC LIMIT 3",
      isCorrect: true,
      hasError: false 
    },
    { 
      id: 4, 
      question: "What's the revenue trend for Q1 2023?", 
      expectedAnswer: "Increasing at 5.2% month-over-month", 
      generatedAnswer: "Increasing at 5.2% month-over-month",
      generatedSQL: "SELECT month, revenue, (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100 as growth_rate FROM monthly_revenue WHERE quarter = 'Q1' AND year = 2023",
      isCorrect: true,
      hasError: false 
    },
    { 
      id: 5, 
      question: "How many products in the clothing category have less than 10 units in stock?", 
      expectedAnswer: "17", 
      generatedSQL: "SELECT COUNT(*) FROM products WHERE category = 'clothing' AND stock < 10",
      hasError: true, 
      errorMessage: "Missing data field" 
    },
  ];

  const handleUpload = () => {
    // Simulating file upload
    setIsUploaded(true);
    setUploadedData(mockData);
    setInvalidRows([5]); // Mock invalid row for the demo
  };

  const handleRunEvaluation = () => {
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock results
      setResultStats({
        total: mockData.length,
        correct: 3,
        incorrect: 1,
        errors: 1,
      });
      
      setAccuracyScore(75);
      
      setResultsByTable([
        { tableName: "customers", accuracy: 92, questions: 2, correct: 2 },
        { tableName: "orders", accuracy: 80, questions: 1, correct: 1 },
        { tableName: "products", accuracy: 50, questions: 2, correct: 1 },
      ]);
      
      setResultsBySchema([
        { schemaName: "public", accuracy: 83, questions: 3, correct: 2 },
        { schemaName: "analytics", accuracy: 67, questions: 3, correct: 2 },
      ]);
      
      setTrainingSuggestions([
        { 
          area: "Products Schema", 
          description: "Needs more examples related to inventory queries", 
          severity: "high",
          examples: ["How many products are low in stock?", "What's the inventory value by category?"]
        },
        { 
          area: "Customer Orders", 
          description: "Improve documentation around order analytics", 
          severity: "medium",
          examples: ["What's the average time between orders for repeat customers?"]
        },
        { 
          area: "Revenue Reporting", 
          description: "Add more SQL examples for financial queries", 
          severity: "low",
          examples: ["Show monthly revenue breakdowns by product category"]
        },
      ]);
      
      setIsProcessing(false);
      setHasResults(true);
    }, 2000);
  };

  // Get a selected question or default to the first one with results
  const selectedQuestion = selectedQuestionId 
    ? uploadedData.find(row => row.id === selectedQuestionId)
    : hasResults ? uploadedData.find(row => !row.hasError) || null : null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Action Bar */}
      <ActionBar 
        uploadedData={uploadedData}
        invalidRows={invalidRows}
        isProcessing={isProcessing}
        isUploaded={isUploaded}
        onRunEvaluation={handleRunEvaluation}
      />

      {/* Main Content */}
      {!isUploaded ? (
        <UploadPanel onUpload={handleUpload} />
      ) : (
        <div className="flex flex-col flex-1 gap-4">
          {/* Results Dashboard - only shown when results available */}
          {hasResults && (
            <ResultsDashboard 
              accuracyScore={accuracyScore}
              resultStats={resultStats}
              resultsByTable={resultsByTable}
            />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
            {/* Dataset Preview */}
            <DatasetPreview 
              uploadedData={uploadedData}
              hasResults={hasResults}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
            />

            {/* Results Comparison */}
            <ResultsComparison 
              selectedQuestion={selectedQuestion}
              hasResults={hasResults}
            />
          </div>
          
          {/* Bottom section - View Training Suggestions */}
          {hasResults && (
            <div className="text-center mt-2">
              <Button 
                variant="outline" 
                onClick={() => setSuggestionsPanelOpen(true)}
                className="gap-2"
              >
                <Database size={16} />
                View Training Suggestions
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Training Suggestions Slide-over */}
      <TrainingSuggestions 
        trainingSuggestions={trainingSuggestions}
        open={suggestionsPanelOpen}
        onOpenChange={setSuggestionsPanelOpen}
      />
    </div>
  );
};

export default BatchTrainingPanel;
