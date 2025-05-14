
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import TrainerHeader from "@/components/trainer/TrainerHeader";
import AccuracyScorecard from "@/components/trainer/AccuracyScorecard";
import SingleQnATab from "@/components/trainer/SingleQnATab";
import BatchQnATrainer from "@/components/BatchQnATrainer";

const TrainerDashboard = () => {
  const [accuracy, setAccuracy] = useState(78);
  const [generatedSQL, setGeneratedSQL] = useState("SELECT customer_id, name, email\nFROM customers\nWHERE order_count > 5\nORDER BY lifetime_value DESC");
  const [nlQuestion, setNlQuestion] = useState("Show me customers with more than 5 orders sorted by lifetime value");
  const [trainerTab, setTrainerTab] = useState("single");

  return (
    <div className="min-h-screen bg-white">
      <TrainerHeader />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <AccuracyScorecard accuracy={accuracy} />
        
        {/* Tabs for Single QnA vs Batch QnA */}
        <Tabs value={trainerTab} onValueChange={setTrainerTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="single">Single QnA</TabsTrigger>
            <TabsTrigger value="batch">Batch QnA Trainer</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Single QnA Content */}
        <TabsContent value="single" className="mt-0">
          <SingleQnATab 
            nlQuestion={nlQuestion}
            setNlQuestion={setNlQuestion}
            generatedSQL={generatedSQL}
            setGeneratedSQL={setGeneratedSQL}
          />
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
