
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, AlertTriangle, FileText, Check, X, BarChart4, Database, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

interface ResultsByTable {
  tableName: string;
  accuracy: number;
  questions: number;
  correct: number;
}

interface ResultsBySchema {
  schemaName: string;
  accuracy: number;
  questions: number;
  correct: number;
}

interface TrainingSuggestion {
  area: string;
  description: string;
  severity: "low" | "medium" | "high";
  examples: string[];
}

const BatchTrainingPanel = () => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [uploadedData, setUploadedData] = useState<DataRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<number[]>([]);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [resultStats, setResultStats] = useState({
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Get a selected question or default to the first one with results
  const selectedQuestion = selectedQuestionId 
    ? uploadedData.find(row => row.id === selectedQuestionId)
    : hasResults ? uploadedData.find(row => !row.hasError) || null : null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Action Bar */}
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
            onClick={handleRunEvaluation}
          >
            {isProcessing ? "Processing..." : "Run Evaluation"}
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      {!isUploaded ? (
        <Card className="p-4 flex-1">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 h-full flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload QnA Dataset</h3>
            <p className="text-sm text-slate-500 mb-6">
              Drop a CSV or Excel file with your questions and expected answers
            </p>
            <Button onClick={handleUpload}>Select File</Button>
            <p className="text-xs text-slate-400 mt-4">
              File must contain columns for "Question" and "ExpectedAnswer"
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col flex-1 gap-4">
          {/* Results Dashboard - only shown when results available */}
          {hasResults && (
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
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
            {/* Dataset Preview */}
            <Card className="flex flex-col overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Dataset Preview</h3>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Expected Answer</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableBody>
                      {uploadedData.map((row) => (
                        <TableRow 
                          key={row.id} 
                          className={`${row.hasError ? "bg-red-50" : ""} ${selectedQuestionId === row.id ? "bg-blue-50" : ""}`}
                          onClick={() => row.generatedSQL && setSelectedQuestionId(row.id)}
                          style={{ cursor: row.generatedSQL ? "pointer" : "default" }}
                        >
                          <TableCell>{row.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{row.question}</TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {row.expectedAnswer}
                          </TableCell>
                          <TableCell>
                            {hasResults ? (
                              row.hasError ? (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
                              ) : row.isCorrect ? (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Correct</Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Incorrect</Badge>
                              )
                            ) : (
                              row.hasError ? (
                                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Error</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500">Pending</Badge>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </Card>

            {/* Results Comparison */}
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
      <Sheet open={suggestionsPanelOpen} onOpenChange={setSuggestionsPanelOpen}>
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
    </div>
  );
};

export default BatchTrainingPanel;
