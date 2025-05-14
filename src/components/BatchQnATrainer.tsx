
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BatchTrainingPanel from "./BatchTrainingPanel";
import BatchHistoryPanel from "./BatchHistoryPanel";

const BatchQnATrainer = () => {
  const [activeTab, setActiveTab] = useState<string>("training");

  return (
    <div className="flex-1 flex flex-col">
      <Tabs 
        defaultValue="training" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-[400px] grid-cols-2 mb-4">
          <TabsTrigger value="training">Batch Training</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="training" className="flex-1 overflow-hidden">
          <BatchTrainingPanel />
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 overflow-hidden">
          <BatchHistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchQnATrainer;
