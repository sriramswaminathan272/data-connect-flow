
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-slate-50 p-2 border-b flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-slate-500 font-mono">[{index + 1}]</span>
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
        </div>
        <div>
          <Button 
            size="sm" 
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => onDelete(id)}
          >
            <Trash size={12} />
          </Button>
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
    </div>
  );
};

export default SqlNotebookCell;
