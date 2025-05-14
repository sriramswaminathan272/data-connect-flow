
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronDown, Flag, Check, FileText, Upload, Search, LayoutDashboard, Settings, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [accuracy, setAccuracy] = useState(78);
  const [activeTab, setActiveTab] = useState("docs");
  const [nlQuery, setNlQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data
  const metricData = [
    { name: "Coverage", value: "87%", change: "+2.3%" },
    { name: "Precision", value: "92%", change: "+1.5%" },
    { name: "Recall", value: "81%", change: "-0.8%" },
  ];

  const mockDocuments = [
    { name: "Sales Analysis.pdf", status: "processed", date: "2023-05-12" },
    { name: "Customer Journey.docx", status: "processing", date: "2023-05-14" },
    { name: "Technical Schema.pdf", status: "processed", date: "2023-05-10" },
  ];

  const mockQueries = [
    { name: "Monthly Revenue Query", status: "validated", date: "2023-05-08" },
    { name: "Customer Segments", status: "pending", date: "2023-05-13" },
    { name: "Product Performance", status: "validated", date: "2023-05-11" },
  ];

  const mockSql = `SELECT 
  customer_segment,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT customer_id) as customer_count
FROM sales
JOIN customers ON sales.customer_id = customers.id
WHERE transaction_date BETWEEN '2023-01-01' AND '2023-04-30'
GROUP BY customer_segment
ORDER BY total_revenue DESC;`;

  const mockResults = [
    { customer_segment: "Enterprise", total_revenue: "$1,245,890", customer_count: 128 },
    { customer_segment: "Mid-Market", total_revenue: "$892,450", customer_count: 347 },
    { customer_segment: "SMB", total_revenue: "$458,720", customer_count: 1204 },
  ];

  const handleFileUpload = () => {
    toast({
      title: "File uploaded",
      description: "Your document has been queued for processing.",
    });
  };

  const handleRunQuery = () => {
    if (!nlQuery.trim()) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Query generated",
        description: "SQL query has been generated based on your natural language input.",
      });
    }, 1500);
  };

  const handleRescoreModel = () => {
    toast({
      title: "Rescoring initiated",
      description: "The model is being rescored with the latest inputs.",
    });
    
    // Animate accuracy gauge
    const currentAccuracy = accuracy;
    const targetAccuracy = Math.min(Math.max(currentAccuracy + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5, 65), 95);
    
    // Simple animation for the gauge
    let step = 0;
    const totalSteps = 20;
    const interval = setInterval(() => {
      step++;
      setAccuracy(currentAccuracy + (targetAccuracy - currentAccuracy) * (step / totalSteps));
      if (step >= totalSteps) clearInterval(interval);
    }, 50);
  };

  const handleAcceptQuery = () => {
    toast({
      title: "Query accepted",
      description: "This query has been added to the training examples.",
    });
  };

  const handleFlagQuery = () => {
    toast({
      title: "Query flagged",
      description: "This query has been flagged for review.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-900">SQL Knowledge Trainer</h1>
          </div>
          
          <div className="flex-1 max-w-xs mx-4">
            <div className="relative inline-block w-56">
              <select 
                className="block w-full bg-white border border-slate-200 text-slate-700 py-2 px-3 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Sales Database</option>
                <option>Marketing Database</option>
                <option>Product Database</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRescoreModel} className="bg-blue-600 hover:bg-blue-700">
              Re-Score
            </Button>
            <div className="flex items-center justify-center rounded-full bg-slate-100 w-8 h-8">
              <User className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Section - Accuracy Scorecard */}
        <div className="mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Circular Gauge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-2">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="#e2e8f0" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="12" 
                        strokeLinecap="round" 
                        strokeDasharray={`${(accuracy / 100) * 339.292} 339.292`}
                        transform="rotate(-90 60 60)" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold text-slate-800">{Math.round(accuracy)}%</span>
                      <span className="text-sm text-slate-500">Accuracy</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 text-center">Overall model accuracy based on validation tests</p>
                </div>

                {/* Metrics */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    {metricData.map((metric) => (
                      <div key={metric.name} className="bg-white rounded-lg border border-slate-200 p-3 flex justify-between items-center">
                        <span className="font-medium text-slate-700">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{metric.value}</span>
                          <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Graph Thumbnail */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Performance Trend</h3>
                  <div className="bg-white rounded-lg border border-slate-200 p-4 h-40 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      {/* Simple mock chart */}
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path 
                          d="M0,40 Q10,35 20,38 T40,32 T60,35 T80,25 T100,20" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                        />
                        <path 
                          d="M0,40 Q10,35 20,38 T40,32 T60,35 T80,25 T100,20 V50 H0 Z" 
                          fill="rgba(59, 130, 246, 0.1)" 
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                    <span>Last Month</span>
                    <span>This Week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Two-pane split */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Pane - Training Inputs */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Training Inputs</h2>
                <Button onClick={handleFileUpload} size="sm" className="flex items-center gap-1">
                  <Upload className="h-4 w-4" /> Upload
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="docs" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Documentation
                  </TabsTrigger>
                  <TabsTrigger value="sql" className="flex items-center gap-1">
                    <Search className="h-4 w-4" /> SQL Examples
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="docs" className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'processed' ? 'bg-green-100 text-green-800' : 
                          doc.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="sql" className="space-y-4">
                  {mockQueries.map((query) => (
                    <div key={query.name} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-800">{query.name}</p>
                          <p className="text-xs text-slate-500">{query.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          query.status === 'validated' ? 'bg-green-100 text-green-800' : 
                          query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {query.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Pane - Ask the DB */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Ask the DB</h2>
              
              <div className="space-y-4">
                {/* NL Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about your data..."
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleRunQuery} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate SQL"}
                  </Button>
                </div>
                
                {/* Generated SQL Accordion */}
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="sql">
                    <AccordionTrigger className="px-4 py-3 bg-slate-50">Generated SQL</AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <pre className="bg-slate-100 p-3 rounded-md overflow-auto text-sm">
                        <code className="text-slate-800">{mockSql}</code>
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Results Table */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border-b">
                    Results
                  </div>
                  <div className="max-h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(mockResults[0]).map((key) => (
                            <TableHead key={key}>{key.replace(/_/g, ' ')}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockResults.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value, i) => (
                              <TableCell key={i}>{value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleFlagQuery} className="flex items-center gap-1">
                    <Flag className="h-4 w-4" /> Flag
                  </Button>
                  <Button onClick={handleAcceptQuery} className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
