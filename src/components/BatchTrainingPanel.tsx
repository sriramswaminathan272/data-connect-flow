
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

interface DataRow {
  id: number;
  question: string;
  expectedAnswer: string;
  generatedAnswer?: string;
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

  // Mock data for the demo
  const mockData: DataRow[] = [
    { id: 1, question: "How many customers made more than 5 orders last month?", expectedAnswer: "42", hasError: false },
    { id: 2, question: "What's the average order value for the electronics category?", expectedAnswer: "$156.78", hasError: false },
    { id: 3, question: "Who are the top 3 customers by lifetime value?", expectedAnswer: "John Smith, Jane Doe, Robert Johnson", hasError: false },
    { id: 4, question: "What's the revenue trend for Q1 2023?", expectedAnswer: "Increasing at 5.2% month-over-month", hasError: false },
    { id: 5, question: "How many products in the clothing category have less than 10 units in stock?", expectedAnswer: "17", hasError: true, errorMessage: "Missing data field" },
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

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Left Panel - 30% */}
      <div className="w-full md:w-[30%] flex flex-col space-y-4">
        <Card className="p-4 flex-1 flex flex-col">
          {!isUploaded ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex-1 flex flex-col items-center justify-center text-center">
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
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">QnA Dataset</h3>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {uploadedData.length} questions
                  </Badge>
                  <Button variant="outline" size="sm">
                    <FileText size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              {invalidRows.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-center">
                  <AlertTriangle size={18} className="text-amber-500 mr-2" />
                  <span className="text-sm text-amber-800">
                    {invalidRows.length} row(s) with validation issues
                  </span>
                </div>
              )}
              
              <div className="border rounded-md flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Expected Answer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedData.map((row) => (
                        <TableRow key={row.id} className={row.hasError ? "bg-red-50" : ""}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{row.question}</TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {row.expectedAnswer}
                            {row.hasError && (
                              <Badge variant="outline" className="ml-2 text-red-500 border-red-200 bg-red-50">
                                Error
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Right Panel - 70% */}
      <div className="w-full md:w-[70%] flex flex-col space-y-4">
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
        
        {/* Results Dashboard */}
        <Card className="p-4 flex-1 flex flex-col">
          {!hasResults ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
              <BarChart4 size={48} className="mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
              <p>Upload a dataset and run the evaluation to see results</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Evaluation Results</h3>
              
              {/* Outcome Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Outcomes</span>
                  <span>{resultStats.total} questions</span>
                </div>
                <div className="h-6 flex rounded-md overflow-hidden">
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
              
              {/* Accuracy Gauge */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative flex items-center justify-center mb-2">
                  <svg className="w-36 h-36">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke={accuracyScore >= 80 ? "#10b981" : accuracyScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="12"
                      strokeDasharray={`${accuracyScore * 3.77} 377`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 72 72)"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-bold">{accuracyScore}%</div>
                    <div className="text-slate-500 text-sm">Accuracy</div>
                  </div>
                </div>
              </div>
              
              {/* Results Accordions */}
              <div className="space-y-3 overflow-auto">
                {/* Questions Results */}
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="questions">
                    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="font-medium">Questions with Issues</span>
                        <Badge className="ml-3 bg-amber-100 text-amber-800 hover:bg-amber-100">
                          {resultStats.incorrect + resultStats.errors}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Expected</TableHead>
                            <TableHead>Generated</TableHead>
                            <TableHead className="w-20">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>2</TableCell>
                            <TableCell className="max-w-[200px] truncate">What's the average order value for the electronics category?</TableCell>
                            <TableCell>$156.78</TableCell>
                            <TableCell>$148.32</TableCell>
                            <TableCell>
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                Incorrect
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>5</TableCell>
                            <TableCell className="max-w-[200px] truncate">How many products in the clothing category have less than 10 units in stock?</TableCell>
                            <TableCell>17</TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                Error
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Tables Results */}
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="tables">
                    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="font-medium">Results by Table</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Table</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Correct</TableHead>
                            <TableHead>Accuracy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resultsByTable.map((result) => (
                            <TableRow key={result.tableName}>
                              <TableCell className="font-medium">{result.tableName}</TableCell>
                              <TableCell>{result.questions}</TableCell>
                              <TableCell>{result.correct}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-24 bg-slate-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        result.accuracy >= 80 ? "bg-emerald-500" : 
                                        result.accuracy >= 60 ? "bg-amber-500" : "bg-red-500"
                                      }`}
                                      style={{ width: `${result.accuracy}%` }}
                                    ></div>
                                  </div>
                                  <span>{result.accuracy}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Schema Results */}
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="schemas">
                    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="font-medium">Results by Schema</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Schema</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Correct</TableHead>
                            <TableHead>Accuracy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resultsBySchema.map((result) => (
                            <TableRow key={result.schemaName}>
                              <TableCell className="font-medium">{result.schemaName}</TableCell>
                              <TableCell>{result.questions}</TableCell>
                              <TableCell>{result.correct}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-24 bg-slate-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        result.accuracy >= 80 ? "bg-emerald-500" : 
                                        result.accuracy >= 60 ? "bg-amber-500" : "bg-red-500"
                                      }`}
                                      style={{ width: `${result.accuracy}%` }}
                                    ></div>
                                  </div>
                                  <span>{result.accuracy}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              {/* View Suggestions Button */}
              <div className="mt-6 text-center">
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
            </div>
          )}
        </Card>
      </div>
      
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
