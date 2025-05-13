
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Search, Table, Database, FileText, Play, Eye, Code, ArrowDown } from "lucide-react";
import { ConnectorType } from "./DatabaseConnector";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface DatabaseWorkspaceProps {
  connector: ConnectorType;
  onDisconnect: () => void;
}

interface SchemaType {
  id: string;
  name: string;
  tables: TableType[];
  expanded?: boolean;
}

interface TableType {
  id: string;
  name: string;
  rowCount: number;
  columns: ColumnType[];
}

interface ColumnType {
  name: string;
  type: string;
}

interface TablePreviewData {
  columns: string[];
  rows: any[][];
}

interface QueryResultType {
  columns: string[];
  rows: any[][];
  executionTime: string;
  rowCount: number;
}

const DatabaseWorkspace = ({ connector, onDisconnect }: DatabaseWorkspaceProps) => {
  const [schemas, setSchemas] = useState<SchemaType[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState("");
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningQuery, setIsRunningQuery] = useState(false);
  const [tablePreviewOpen, setTablePreviewOpen] = useState(false);
  const [previewTableData, setPreviewTableData] = useState<TablePreviewData | null>(null);
  const [previewTableName, setPreviewTableName] = useState("");
  const [activeTab, setActiveTab] = useState("sql");
  const [queryResult, setQueryResult] = useState<QueryResultType | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Show me total sales by region for the last quarter",
    "Find customers who made more than 5 orders last month",
    "Calculate average order value by product category",
    "List top 10 products by revenue",
    "Show daily active users trend over the past 30 days"
  ]);

  useEffect(() => {
    // Simulate loading schemas from database
    setTimeout(() => {
      const mockSchemas: SchemaType[] = [
        {
          id: "public",
          name: "public",
          expanded: true,
          tables: [
            {
              id: "customers",
              name: "customers",
              rowCount: 1243,
              columns: [
                { name: "customer_id", type: "integer" },
                { name: "name", type: "varchar" },
                { name: "email", type: "varchar" },
                { name: "created_at", type: "timestamp" },
              ],
            },
            {
              id: "orders",
              name: "orders",
              rowCount: 8721,
              columns: [
                { name: "order_id", type: "integer" },
                { name: "customer_id", type: "integer" },
                { name: "order_date", type: "timestamp" },
                { name: "status", type: "varchar" },
                { name: "total", type: "decimal" },
              ],
            },
            {
              id: "products",
              name: "products",
              rowCount: 356,
              columns: [
                { name: "product_id", type: "integer" },
                { name: "name", type: "varchar" },
                { name: "description", type: "text" },
                { name: "price", type: "decimal" },
                { name: "category", type: "varchar" },
              ],
            },
          ],
        },
        {
          id: "analytics",
          name: "analytics",
          expanded: false,
          tables: [
            {
              id: "daily_sales",
              name: "daily_sales",
              rowCount: 730,
              columns: [
                { name: "date", type: "date" },
                { name: "revenue", type: "decimal" },
                { name: "orders", type: "integer" },
                { name: "customers", type: "integer" },
              ],
            },
            {
              id: "user_metrics",
              name: "user_metrics",
              rowCount: 5248,
              columns: [
                { name: "date", type: "date" },
                { name: "user_id", type: "integer" },
                { name: "session_count", type: "integer" },
                { name: "conversion_rate", type: "decimal" },
              ],
            },
          ],
        },
      ];

      setSchemas(mockSchemas);
      setSelectedSchema("public");
      setIsLoading(false);
    }, 1500);
  }, []);

  const toggleSchema = (schemaId: string) => {
    setSchemas(
      schemas.map((schema) =>
        schema.id === schemaId
          ? { ...schema, expanded: !schema.expanded }
          : schema
      )
    );
  };

  const selectTable = (schemaId: string, tableId: string) => {
    setSelectedSchema(schemaId);
    setSelectedTable(tableId);
    
    // Generate sample SQL query for the selected table
    const schema = schemas.find(s => s.id === schemaId);
    const table = schema?.tables.find(t => t.id === tableId);
    
    if (schema && table) {
      setSqlQuery(`SELECT *\nFROM ${schema.name}.${table.name}\nLIMIT 100;`);
    }
  };

  const handleRunQuery = () => {
    if (!sqlQuery.trim()) {
      toast.error("Please enter a SQL query first");
      return;
    }
    
    setIsRunningQuery(true);
    
    // Simulate query execution
    setTimeout(() => {
      setIsRunningQuery(false);
      toast.success("Query executed successfully");
      
      // Switch to results tab
      setActiveTab("results");
      
      // Generate mock results based on query
      const mockResult = generateMockQueryResults(sqlQuery);
      setQueryResult(mockResult);
    }, 1500);
  };

  const generateMockQueryResults = (query: string): QueryResultType => {
    // Simple parsing to determine what kind of mock data to return
    const queryLower = query.toLowerCase();
    let columns: string[] = [];
    let rows: any[][] = [];
    let rowCount = Math.floor(Math.random() * 100) + 5;
    
    if (queryLower.includes("customer")) {
      columns = ["customer_id", "name", "email", "created_at", "orders_count", "lifetime_value"];
      
      // Generate mock rows
      rows = Array.from({ length: rowCount }).map((_, i) => [
        1000 + i,
        `Customer ${1000 + i}`,
        `customer${1000 + i}@example.com`,
        new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        Math.floor(Math.random() * 50),
        `$${(Math.random() * 10000).toFixed(2)}`
      ]);
    } else if (queryLower.includes("order")) {
      columns = ["order_id", "customer_id", "order_date", "status", "total", "items"];
      
      // Generate mock rows
      rows = Array.from({ length: rowCount }).map((_, i) => [
        5000 + i,
        1000 + Math.floor(Math.random() * 500),
        new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        ["Completed", "Processing", "Shipped", "Cancelled"][Math.floor(Math.random() * 4)],
        `$${(Math.random() * 1000).toFixed(2)}`,
        Math.floor(Math.random() * 20) + 1
      ]);
    } else if (queryLower.includes("product")) {
      columns = ["product_id", "name", "category", "price", "stock", "rating"];
      
      // Generate mock rows
      rows = Array.from({ length: rowCount }).map((_, i) => [
        3000 + i,
        `Product ${3000 + i}`,
        ["Electronics", "Clothing", "Home", "Books", "Food"][Math.floor(Math.random() * 5)],
        `$${(Math.random() * 500).toFixed(2)}`,
        Math.floor(Math.random() * 1000),
        (Math.random() * 5).toFixed(1)
      ]);
    } else {
      // Generic results
      columns = ["id", "name", "value", "date", "status"];
      
      // Generate mock rows
      rows = Array.from({ length: rowCount }).map((_, i) => [
        i + 1,
        `Item ${i + 1}`,
        Math.floor(Math.random() * 100000),
        new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        ["Active", "Inactive", "Pending", "Completed"][Math.floor(Math.random() * 4)]
      ]);
    }
    
    return {
      columns,
      rows,
      executionTime: `${(Math.random() * 3).toFixed(2)} seconds`,
      rowCount
    };
  };

  const handleGenerateSQL = () => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generating SQL from natural language
    setTimeout(() => {
      const selectedSchemaObj = schemas.find(s => s.id === selectedSchema);
      
      // Simulate different SQL based on the prompt
      let generatedSQL = "";
      
      if (promptText.toLowerCase().includes("customer") && promptText.toLowerCase().includes("order")) {
        generatedSQL = `-- SQL generated from: "${promptText}"\n\nSELECT\n  c.customer_id,\n  c.name,\n  COUNT(o.order_id) AS order_count,\n  SUM(o.total) AS total_spent\nFROM public.customers c\nJOIN public.orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC\nLIMIT 100;`;
      } else if (promptText.toLowerCase().includes("product")) {
        generatedSQL = `-- SQL generated from: "${promptText}"\n\nSELECT\n  p.product_id,\n  p.name,\n  p.price,\n  p.category,\n  COUNT(o.order_id) AS times_ordered\nFROM public.products p\nLEFT JOIN public.orders o ON p.product_id = o.product_id\nGROUP BY p.product_id, p.name, p.price, p.category\nORDER BY times_ordered DESC;`;
      } else {
        generatedSQL = `-- SQL generated from: "${promptText}"\n\n-- Based on your available tables: customers, orders, products\n\nSELECT *\nFROM public.${selectedSchemaObj?.tables[0]?.name || "customers"}\nLIMIT 100;`;
      }
      
      setSqlQuery(generatedSQL);
      setIsGenerating(false);
      toast.success("SQL generated successfully");
    }, 2000);
  };
  
  const handleTablePreview = (schemaId: string, tableId: string) => {
    const schema = schemas.find(s => s.id === schemaId);
    const table = schema?.tables.find(t => t.id === tableId);
    
    if (schema && table) {
      setPreviewTableName(`${schema.name}.${table.name}`);
      
      // Simulate loading table preview data
      const mockColumns = table.columns.map(col => col.name);
      const mockRows = [];
      
      // Generate 10 rows of mock data
      for (let i = 0; i < 10; i++) {
        const row = table.columns.map(col => {
          if (col.type === "integer") return Math.floor(Math.random() * 1000);
          if (col.type === "decimal") return (Math.random() * 1000).toFixed(2);
          if (col.type === "date" || col.type === "timestamp") {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            return date.toISOString().split('T')[0];
          }
          return `Sample ${col.name} ${i + 1}`;
        });
        mockRows.push(row);
      }
      
      setPreviewTableData({
        columns: mockColumns,
        rows: mockRows
      });
      
      setTablePreviewOpen(true);
    }
  };

  const applySuggestedPrompt = (prompt: string) => {
    setPromptText(prompt);
    // Automatically generate SQL for the selected prompt
    setTimeout(() => {
      handleGenerateSQL();
    }, 100);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Database size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold">{connector.name}</h2>
            <p className="text-sm text-slate-500">{connector.id === "redshift" ? "Connected to Redshift" : "Connected"}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
      </div>
      
      <div className="flex-1 flex">
        {/* Left Sidebar - Schema Browser */}
        <div className="w-64 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tables..."
                className="pl-8"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2 mt-6" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="p-2">
                {schemas.map((schema) => (
                  <div key={schema.id} className="mb-1">
                    <div 
                      className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-slate-100 ${
                        selectedSchema === schema.id ? "bg-slate-100" : ""
                      }`}
                      onClick={() => toggleSchema(schema.id)}
                    >
                      {schema.expanded ? (
                        <ChevronDown size={16} className="mr-1" />
                      ) : (
                        <ChevronRight size={16} className="mr-1" />
                      )}
                      <span className="text-sm font-medium">{schema.name}</span>
                    </div>
                    
                    {schema.expanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {schema.tables.map((table) => (
                          <div 
                            key={table.id}
                            className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer text-sm hover:bg-slate-100 ${
                              selectedSchema === schema.id && selectedTable === table.id
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }`}
                            onClick={() => selectTable(schema.id, table.id)}
                          >
                            <div className="flex items-center">
                              <Table size={14} className="mr-2 opacity-70" />
                              {table.name}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTablePreview(schema.id, table.id);
                              }}
                              className="p-1 opacity-70 hover:opacity-100 hover:bg-slate-200 rounded"
                              title="Preview table data"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <TabsList className="px-4">
                <TabsTrigger value="sql">SQL Editor</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="preview">Table Preview</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="sql" className="flex-1 flex flex-col p-4 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="sql-editor">SQL Query</Label>
                  <Button 
                    size="sm" 
                    onClick={handleRunQuery}
                    disabled={isRunningQuery}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunningQuery ? "Running..." : "Run SQL"}
                    {!isRunningQuery && <Play size={14} className="ml-2" />}
                  </Button>
                </div>
                <Textarea 
                  id="sql-editor"
                  className="w-full h-60 p-4 border rounded-md font-mono text-sm"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Write your SQL query here..."
                />
              </div>
              
              <div className="mt-6">
                <Label htmlFor="nl-prompt" className="mb-2 block">Natural Language to SQL</Label>
                <div className="flex">
                  <Input
                    id="nl-prompt"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Describe what data you need in natural language..."
                    className="flex-1"
                  />
                  <Button 
                    className="ml-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleGenerateSQL}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate SQL"}
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-2 flex items-center">
                    <ArrowDown size={12} className="inline mr-1" />
                    Try these example prompts:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => applySuggestedPrompt(prompt)}
                        className="text-xs bg-slate-50 hover:bg-slate-100 transition-all"
                      >
                        "{prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}"
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="flex-1 p-4 data-[state=active]:flex data-[state=inactive]:hidden flex-col">
              {queryResult ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
                    <div>
                      <span className="font-medium">{queryResult.rowCount} rows</span> returned
                    </div>
                    <div>Execution time: {queryResult.executionTime}</div>
                  </div>
                  
                  <div className="border rounded-md overflow-auto flex-1">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          {queryResult.columns.map((column, i) => (
                            <TableHead key={i} className="font-semibold">{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResult.rows.map((row, i) => (
                          <TableRow key={i} className="hover:bg-slate-50">
                            {row.map((cell, j) => (
                              <TableCell key={j}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("sql")}
                      size="sm"
                      className="text-sm"
                    >
                      <Code size={14} className="mr-1" />
                      Back to SQL Editor
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <FileText size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Run a query to see results</p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 p-4">
              <div className="border rounded-md h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Table size={36} className="mx-auto mb-2 opacity-40" />
                  <p>Select a table to preview data</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Table Preview Sheet */}
      <Sheet open={tablePreviewOpen} onOpenChange={setTablePreviewOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Table Preview: {previewTableName}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {previewTableData && (
              <div className="border rounded-md overflow-auto max-h-[calc(100vh-180px)]">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      {previewTableData.columns.map((column, i) => (
                        <TableHead key={i}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewTableData.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DatabaseWorkspace;
