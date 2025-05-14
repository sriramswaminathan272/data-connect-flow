
import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, ChevronRight } from "lucide-react";

interface BatchHistoryItem {
  id: string;
  name: string;
  date: string;
  questionsCount: number;
  accuracy: number;
  status: 'completed' | 'failed' | 'processing';
}

const BatchHistoryPanel = () => {
  // Mock history data
  const historyItems: BatchHistoryItem[] = [
    {
      id: "batch-001",
      name: "Initial QnA Dataset",
      date: "2025-05-12 14:30",
      questionsCount: 25,
      accuracy: 68,
      status: 'completed'
    },
    {
      id: "batch-002",
      name: "Customer Queries - May",
      date: "2025-05-10 09:15",
      questionsCount: 43,
      accuracy: 82,
      status: 'completed'
    },
    {
      id: "batch-003",
      name: "Financial Reporting Queries",
      date: "2025-05-08 16:45",
      questionsCount: 18,
      accuracy: 75,
      status: 'completed'
    },
    {
      id: "batch-004",
      name: "Product Catalog Queries",
      date: "2025-05-05 11:20",
      questionsCount: 32,
      accuracy: 90,
      status: 'completed'
    },
    {
      id: "batch-005",
      name: "Inventory Management",
      date: "2025-05-03 08:30",
      questionsCount: 27,
      accuracy: 78,
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      default:
        return null;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-emerald-600";
    if (accuracy >= 70) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="flex-1 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Batch Evaluation History</h2>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Export History
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-slate-600">{item.date}</TableCell>
                <TableCell>{item.questionsCount}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${getAccuracyColor(item.accuracy)}`}>
                    {item.accuracy}%
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye size={16} className="text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight size={16} className="text-slate-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default BatchHistoryPanel;
