
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface DatasetPreviewProps {
  uploadedData: DataRow[];
  hasResults: boolean;
  selectedQuestionId: number | null;
  setSelectedQuestionId: (id: number | null) => void;
}

const DatasetPreview = ({
  uploadedData,
  hasResults,
  selectedQuestionId,
  setSelectedQuestionId,
}: DatasetPreviewProps) => {
  return (
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
  );
};

export default DatasetPreview;
