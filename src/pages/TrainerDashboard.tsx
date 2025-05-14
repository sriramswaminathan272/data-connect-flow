
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Database, ChevronDown, BarChart4, Check, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import BatchQnATrainer from "@/components/BatchQnATrainer";

const TrainerDashboard = () => {
  const [accuracy, setAccuracy] = useState(78);
  const [activeTab, setActiveTab] = useState("docs");
  const [generatedSQL, setGeneratedSQL] = useState("SELECT customer_id, name, email\nFROM customers\nWHERE order_count > 5\nORDER BY lifetime_value DESC");
  const [nlQuestion, setNlQuestion] = useState("Show me customers with more than 5 orders sorted by lifetime value");
  const [trainerTab, setTrainerTab] = useState("single");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">SQL Knowledge Graph Trainer</h1>
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Main Workspace <ChevronDown size={16} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            Re-score
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Accuracy Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2 shadow-sm flex flex-col">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <svg className="w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke={accuracy >= 80 ? "#10b981" : accuracy >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="16"
                      strokeDasharray={`${accuracy * 5.02} 502`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 96 96)"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-5xl font-bold">{accuracy}%</div>
                    <div className="text-slate-500 text-sm">Accuracy</div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Knowledge Graph Performance</h2>
                <p className="text-slate-600 text-center">
                  Your knowledge graph is performing well, but there&apos;s room for improvement.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Total Documents</h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">48</span>
                  <span className="text-green-600 text-sm">+12 this week</span>
                </div>
                <Progress value={48} className="h-1.5 mt-2" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500">SQL Accuracy</h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">83%</span>
                  <span className="text-green-600 text-sm">+5% this week</span>
                </div>
                <Progress value={83} className="h-1.5 mt-2" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500">NL Understanding</h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">72%</span>
                  <span className="text-amber-600 text-sm">-2% this week</span>
                </div>
                <Progress value={72} className="h-1.5 mt-2" />
              </div>
              
              <div className="h-24 bg-slate-50 rounded-md flex items-center justify-center">
                <BarChart4 className="text-slate-300" size={48} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for Single QnA vs Batch QnA */}
        <Tabs value={trainerTab} onValueChange={setTrainerTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="single">Single QnA</TabsTrigger>
            <TabsTrigger value="batch">Batch QnA Trainer</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Single QnA Content */}
        <TabsContent value="single" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Inputs */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Training Inputs</h2>
                </div>
                <div>
                  <Tabs 
                    defaultValue="docs"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="w-full bg-slate-100 rounded-none border-b p-0">
                      <TabsTrigger 
                        value="docs" 
                        className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none border-r"
                      >
                        <FileText size={16} className="mr-2" /> Documentation
                      </TabsTrigger>
                      <TabsTrigger 
                        value="sql" 
                        className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none"
                      >
                        <Database size={16} className="mr-2" /> SQL Examples
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="docs" className="p-4 space-y-4 mt-0">
                      <div className="border border-dashed border-slate-300 rounded-md p-6 bg-slate-50 text-center">
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Upload Documentation</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Drop PDF, Markdown, or text files here
                        </p>
                        <Button variant="outline" size="sm">
                          Select Files
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2 text-blue-600" />
                            <span>database_schema.md</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Processed</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2 text-blue-600" />
                            <span>queries_guide.pdf</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Processed</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2 text-amber-600" />
                            <span>api_reference.pdf</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Processing</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sql" className="p-4 space-y-4 mt-0">
                      <div className="border border-dashed border-slate-300 rounded-md p-6 bg-slate-50 text-center">
                        <Database className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Add SQL Examples</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Upload SQL examples or add them manually
                        </p>
                        <Button variant="outline" size="sm">
                          Add Examples
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-50 rounded-md border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">Customer Analysis Query</span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Validated</span>
                          </div>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                            SELECT customer_id, name, email, COUNT(order_id) as order_count
                            FROM customers LEFT JOIN orders USING(customer_id)
                            GROUP BY customer_id, name, email
                            HAVING COUNT(order_id) &gt; 5
                            ORDER BY order_count DESC;
                          </pre>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-md border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">Revenue by Category</span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Validated</span>
                          </div>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                            SELECT category, SUM(price * quantity) AS revenue
                            FROM products JOIN order_items ON products.id = order_items.product_id
                            GROUP BY category
                            ORDER BY revenue DESC;
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
            
            {/* Ask the DB */}
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
          </div>
        </TabsContent>

        {/* Batch QnA Trainer Content */}
        <TabsContent value="batch" className="mt-0">
          <div className="h-[calc(100vh-350px)]">
            <BatchQnATrainer />
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default TrainerDashboard;
