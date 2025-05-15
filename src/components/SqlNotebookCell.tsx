
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Trash, Download, MessageSquare, Wand, Book, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface QueryResultType {
  columns: string[];
  rows: any[][];
  executionTime: string;
  rowCount: number;
}

interface SqlNotebookCellProps {
  id: string;
  index: number;
  sql: string;
  results: QueryResultType | null;
  isRunning: boolean;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, sql: string) => void;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

const SqlNotebookCell = ({
  id,
  index,
  sql,
  results,
  isRunning,
  onRun,
  onDelete,
  onChange,
}: SqlNotebookCellProps) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Jane Smith",
      text: "This query could be optimized by adding an index on the customer_id column.",
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      author: "John Doe",
      text: "I think we should join with the orders table to get more meaningful data.",
      timestamp: "Yesterday"
    }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleFixSql = async () => {
    // In a real implementation, this would call an API
    toast({
      title: "AI Fix Applied",
      description: "SQL query has been optimized",
    });
    
    // Simulate API call with a delay
    setTimeout(() => {
      // For demo purposes, just modify the SQL slightly
      onChange(id, sql.replace("SELECT *", "SELECT id, name, email"));
    }, 500);
  };

  const handleAddToRag = () => {
    toast({
      title: "Added to examples",
      description: "Query saved to your SQL examples dataset",
    });
  };

  const handleDownloadCsv = () => {
    if (!results) return;
    
    // In a real implementation, this would generate and download a CSV
    toast({
      title: "Download started",
      description: "Preparing CSV for download...",
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: "Current User",
      text: newComment,
      timestamp: "Just now"
    };
    
    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-slate-50 p-2 border-b flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-slate-500 font-mono">[{index + 1}]</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="ml-2 h-7 text-xs"
                  onClick={() => onRun(id)}
                  disabled={isRunning}
                >
                  {isRunning ? "Running..." : "Run"}
                  {!isRunning && <Play size={12} className="ml-1" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run this SQL query</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="ml-1 h-7 text-xs"
                  onClick={handleFixSql}
                >
                  <Wand size={12} className="mr-1" />
                  Fix it
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run AI-powered correction on this SQL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-slate-600"
                  onClick={handleAddToRag}
                >
                  <Book size={12} className="mr-1" />
                  <Plus size={10} />
                  RAG
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save this query to your example-SQL dataset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setCommentsOpen(true)}
                >
                  <MessageSquare size={12} />
                  {comments.length > 0 && (
                    <span className="ml-1 text-xs">{comments.length}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View and add comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onDelete(id)}
                >
                  <Trash size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this cell</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div>
        <Textarea 
          value={sql}
          onChange={(e) => onChange(id, e.target.value)}
          className="w-full p-4 border-0 rounded-none shadow-none font-mono text-sm min-h-[120px]"
          placeholder="Write your SQL here..."
        />
      </div>
      
      {/* Cell Results */}
      {results && (
        <div className="border-t">
          <div className="bg-slate-50 p-2 border-b flex items-center justify-between">
            <span className="text-xs text-slate-500">Results: {results.rowCount} rows ({results.executionTime})</span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs flex items-center gap-1"
                    onClick={handleDownloadCsv}
                  >
                    <Download size={12} />
                    CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download the full result set as CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {results.columns.map((column, i) => (
                    <TableHead key={i} className="font-semibold">{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.rows.slice(0, 5).map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50">
                    {row.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {results.rows.length > 5 && (
              <div className="text-center py-2 text-sm text-slate-500">
                Showing 5 of {results.rowCount} rows
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Sheet */}
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent className="w-[400px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Comments for cell [{index + 1}]</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-auto mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-slate-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] flex-1"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button onClick={handleAddComment} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SqlNotebookCell;
