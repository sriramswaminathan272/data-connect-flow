
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Table, 
  Database, 
  FileText, 
  Play, 
  Eye, 
  Code, 
  ArrowDown,
  Plus,
  Save,
  Upload,
  Trash,
  HelpCircle,
  BookOpen
} from "lucide-react";
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
import { Card } from "@/components/ui/card";
import SqlNotebookCell from "./SqlNotebookCell";
import TempTablesPanel from "./TempTablesPanel";
import DocumentationUploader from "./DocumentationUploader";
import QueryExampleManager from "./QueryExampleManager";

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

interface NotebookCellType {
  id: string;
  sql: string;
  results: QueryResultType | null;
  isRunning: boolean;
}

interface TempTableType {
  name: string;
  rowCount: number;
  columns: string[];
}

const DatabaseWorkspace = ({ connector, onDisconnect }: DatabaseWorkspaceProps) => {
  const [schemas, setSchemas] = useState<SchemaType[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tablePreviewOpen, setTablePreviewOpen] = useState(false);
  const [previewTableData, setPreviewTableData] = useState<TablePreviewData | null>(null);
  const [previewTableName, setPreviewTableName] = useState("");
  const [activeTab, setActiveTab] = useState("notebook");
  const [queryResult, setQueryResult] = useState<QueryResultType | null>(null);
  const [notebookCells, setNotebookCells] = useState<NotebookCellType[]>([
    { id: "cell-1", sql: "-- Write your SQL here\nSELECT * FROM public.customers LIMIT 10;", results: null, isRunning: false }
  ]);
  const [tempTables, setTempTables] = useState<TempTableType[]>([
    { name: "temp_customers", rowCount: 1243, columns: ["customer_id", "name", "email", "created_at"] },
    { name: "temp_recent_orders", rowCount: 156, columns: ["order_id", "customer_id", "order_date", "total"] }
  ]);
  const [documentation, setDocumentation] = useState<string[]>([]);
  const [queryExamples, setQueryExamples] = useState<string[]>([
    "-- Find customers who made more than 5 orders\nSELECT c.customer_id, c.name, COUNT(o.order_id) as order_count\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name\nHAVING COUNT(o.order_id) > 5\nORDER BY order_count DESC;",
    "-- Calculate revenue by product category\nSELECT p.category, SUM(o.total) as total_revenue\nFROM orders o\nJOIN products p ON o.product_id = p.product_id\nGROUP BY p.category\nORDER BY total_revenue DESC;"
  ]);
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
      // Add a new cell with the table query if in notebook mode
      if (activeTab === "notebook") {
        addNotebookCell(`SELECT *\nFROM ${schema.name}.${table.name}\nLIMIT 100;`);
      }
    }
  };

  const addNotebookCell = (sqlContent: string = "") => {
    const newCell = {
      id: `cell-${Date.now()}`,
      sql: sqlContent || "-- Write your SQL here",
      results: null,
      isRunning: false
    };
    
    setNotebookCells([...notebookCells, newCell]);
  };

  const updateNotebookCell = (cellId: string, sql: string) => {
    setNotebookCells(
      notebookCells.map(cell => 
        cell.id === cellId ? { ...cell, sql } : cell
      )
    );
  };

  const deleteNotebookCell = (cellId: string) => {
    if (notebookCells.length > 1) {
      setNotebookCells(notebookCells.filter(cell => cell.id !== cellId));
    } else {
      toast.error("Cannot delete the last cell");
    }
  };

  const runNotebookCell = (cellId: string) => {
    // Mark the cell as running
    setNotebookCells(
      notebookCells.map(cell => 
        cell.id === cellId ? { ...cell, isRunning: true } : cell
      )
    );
    
    // Get the cell's SQL
    const cell = notebookCells.find(c => c.id === cellId);
    if (!cell) return;
    
    // Simulate query execution
    setTimeout(() => {
      // Generate mock results based on query
      const mockResult = generateMockQueryResults(cell.sql);
      
      // Update cell with results
      setNotebookCells(
        notebookCells.map(c => 
          c.id === cellId ? { ...c, results: mockResult, isRunning: false } : c
        )
      );
      
      // Check if we should add a temp table
      if (cell.sql.toLowerCase().includes("into temp_") || cell.sql.toLowerCase().includes("create temp table")) {
        const tableName = extractTempTableName(cell.sql);
        if (tableName && !tempTables.some(t => t.name === tableName)) {
          addTempTable(tableName, mockResult);
        }
      }
      
      toast.success("Query executed successfully");
    }, 1500);
  };

  const extractTempTableName = (sql: string): string | null => {
    // Simple regex to extract temp table name from common SQL patterns
    const intoMatch = sql.match(/INTO\s+(\w+)/i);
    const createMatch = sql.match(/CREATE\s+TEMP\s+TABLE\s+(\w+)/i);
    
    return (intoMatch && intoMatch[1]) || (createMatch && createMatch[1]) || null;
  };

  const addTempTable = (name: string, result: QueryResultType) => {
    const newTempTable: TempTableType = {
      name,
      rowCount: result.rowCount,
      columns: result.columns
    };
    
    setTempTables([...tempTables, newTempTable]);
  };

  const handleRunQuery = (sql: string) => {
    if (!sql.trim()) {
      toast.error("Please enter a SQL query first");
      return;
    }
    
    setActiveTab("results");
    setQueryResult(null);
    
    // Simulate query execution
    setTimeout(() => {
      toast.success("Query executed successfully");
      
      // Generate mock results based on query
      const mockResult = generateMockQueryResults(sql);
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
      
      // Add to notebook
      if (activeTab === "notebook") {
        addNotebookCell(generatedSQL);
      } else {
        // In other tabs, we can directly run the query
        handleRunQuery(generatedSQL);
      }
      
      setIsGenerating(false);
      setPromptText("");
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

  const handleDocumentUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Simulate document processing
    Array.from(files).forEach(file => {
      // In a real app, we would process the file content
      setDocumentation(prev => [...prev, file.name]);
      toast.success(`Document "${file.name}" uploaded and processed`);
    });
  };

  const handleAddQueryExample = (example: string) => {
    setQueryExamples([...queryExamples, example]);
    toast.success("Query example added");
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setActiveTab("documentation")}
          >
            <BookOpen size={16} />
            Documentation
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </div>
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
                <h3 className="px-2 py-1 text-sm font-semibold text-slate-500 uppercase">Database Schemas</h3>
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

                {/* Temporary Tables Section */}
                <div className="mt-4">
                  <h3 className="px-2 py-1 text-sm font-semibold text-slate-500 uppercase flex items-center justify-between">
                    <span>Temporary Tables</span>
                    <HelpCircle size={14} className="opacity-70 cursor-help" title="Tables created during your current session" />
                  </h3>
                  <div className="mt-1 space-y-1">
                    {tempTables.map((table) => (
                      <div 
                        key={table.name}
                        className="flex items-center justify-between py-1 px-2 rounded cursor-pointer text-sm hover:bg-slate-100"
                      >
                        <div className="flex items-center">
                          <Table size={14} className="mr-2 text-emerald-500" />
                          {table.name}
                        </div>
                        <span className="text-xs text-slate-500">{table.rowCount} rows</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <TabsList className="px-4">
                <TabsTrigger value="notebook" className="gap-1">
                  <Code size={16} />
                  SQL Notebook
                </TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="examples">Query Examples</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>
            </div>
            
            {/* SQL Notebook Tab */}
            <TabsContent value="notebook" className="flex-1 flex flex-col p-4 data-[state=active]:flex data-[state=inactive]:hidden overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Natural Language to SQL Input (at the top) */}
                <div className="mb-6">
                  <Label htmlFor="nl-prompt" className="mb-2 block font-medium">Natural Language to SQL</Label>
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
                  <div className="mt-2">
                    <div className="text-xs text-slate-500 mb-1 flex items-center">
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
                
                {/* Notebook Cells */}
                <div className="flex-1 overflow-auto pb-4">
                  <div className="space-y-6">
                    {notebookCells.map((cell, index) => (
                      <div key={cell.id} className="border rounded-md overflow-hidden">
                        <div className="bg-slate-50 p-2 border-b flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xs text-slate-500 font-mono">[{index + 1}]</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="ml-2 h-7 text-xs"
                              onClick={() => runNotebookCell(cell.id)}
                              disabled={cell.isRunning}
                            >
                              {cell.isRunning ? "Running..." : "Run"}
                              {!cell.isRunning && <Play size={12} className="ml-1" />}
                            </Button>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => deleteNotebookCell(cell.id)}
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Textarea 
                            value={cell.sql}
                            onChange={(e) => updateNotebookCell(cell.id, e.target.value)}
                            className="w-full p-4 border-0 rounded-none shadow-none font-mono text-sm min-h-[120px]"
                            placeholder="Write your SQL here..."
                          />
                        </div>
                        
                        {/* Cell Results */}
                        {cell.results && (
                          <div className="border-t">
                            <div className="bg-slate-50 p-2 border-b flex items-center justify-between">
                              <span className="text-xs text-slate-500">Results: {cell.results.rowCount} rows ({cell.results.executionTime})</span>
                            </div>
                            <div className="max-h-[300px] overflow-auto">
                              <UITable>
                                <TableHeader>
                                  <TableRow>
                                    {cell.results.columns.map((column, i) => (
                                      <TableHead key={i} className="font-semibold">{column}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cell.results.rows.slice(0, 5).map((row, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50">
                                      {row.map((cell, j) => (
                                        <TableCell key={j}>{cell}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </UITable>
                              {cell.results.rows.length > 5 && (
                                <div className="text-center py-2 text-sm text-slate-500">
                                  Showing 5 of {cell.results.rowCount} rows
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add Cell Button */}
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => addNotebookCell()}
                    className="gap-1"
                  >
                    <Plus size={16} />
                    Add Cell
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Results Tab */}
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
                      onClick={() => setActiveTab("notebook")}
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
            
            {/* Query Examples Tab */}
            <TabsContent value="examples" className="flex-1 p-4 overflow-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Query Examples</h2>
                <p className="text-slate-600 text-sm mb-4">
                  Add example queries that represent common patterns in your data analysis. These help improve SQL generation accuracy.
                </p>
                
                <div className="border rounded-md p-4 bg-slate-50">
                  <Label htmlFor="new-example" className="block mb-2">Add a new example query:</Label>
                  <Textarea 
                    id="new-example"
                    placeholder="-- Example: Find top customers by revenue
SELECT c.customer_id, c.name, SUM(o.total) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 10;"
                    className="w-full h-40 font-mono text-sm mb-3"
                  />
                  <Button 
                    onClick={() => handleAddQueryExample(
                      (document.getElementById("new-example") as HTMLTextAreaElement).value
                    )}
                    className="gap-1"
                  >
                    <Save size={16} />
                    Save Example
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium">Saved Examples:</h3>
                {queryExamples.map((example, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Example #{index + 1}</h4>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash size={16} />
                      </Button>
                    </div>
                    <pre className="bg-slate-50 p-3 rounded border text-sm font-mono overflow-auto max-h-[200px]">
                      {example}
                    </pre>
                  </Card>
                ))}
                
                {queryExamples.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No examples added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Documentation Tab */}
            <TabsContent value="documentation" className="flex-1 p-4 overflow-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Project Documentation</h2>
                <p className="text-slate-600 text-sm mb-4">
                  Upload documentation to provide context for SQL generation. This helps the AI understand your data model and business rules.
                </p>
                
                <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="mb-4 text-slate-600">Drag and drop files or click to upload</p>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e.target.files)}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Upload Files
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-4">Uploaded Documentation:</h3>
                
                {documentation.length > 0 ? (
                  <div className="space-y-3">
                    {documentation.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 border rounded-md bg-slate-50">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="flex-1">{doc}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 border rounded-md">
                    <p>No documentation uploaded yet</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-md font-medium mb-4">Table Metadata</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Document your tables and columns to improve SQL generation accuracy.
                </p>
                
                {schemas.map((schema) => (
                  <div key={schema.id} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{schema.name} Schema</h4>
                    
                    <div className="space-y-3">
                      {schema.tables.map((table) => (
                        <Card key={table.id} className="p-4">
                          <div className="flex items-center mb-3">
                            <Table size={16} className="mr-2" />
                            <h5 className="font-medium">{table.name}</h5>
                          </div>
                          
                          <div className="bg-slate-50 rounded border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="px-3 py-2 text-left font-medium">Column</th>
                                  <th className="px-3 py-2 text-left font-medium">Type</th>
                                  <th className="px-3 py-2 text-left font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.columns.map((column, i) => (
                                  <tr key={i} className={i !== table.columns.length - 1 ? "border-b" : ""}>
                                    <td className="px-3 py-2 font-mono">{column.name}</td>
                                    <td className="px-3 py-2 text-slate-600">{column.type}</td>
                                    <td className="px-3 py-2">
                                      <Input 
                                        placeholder="Add description..."
                                        className="h-7 text-xs"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline">Save Metadata</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
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
