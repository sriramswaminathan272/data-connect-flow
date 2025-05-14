
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Database, Upload } from "lucide-react";

const TrainingInputs = () => {
  const [activeTab, setActiveTab] = useState("docs");

  return (
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
  );
};

export default TrainingInputs;
