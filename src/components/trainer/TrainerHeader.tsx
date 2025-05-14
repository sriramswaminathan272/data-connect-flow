
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";

const TrainerHeader = () => {
  return (
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
  );
};

export default TrainerHeader;
