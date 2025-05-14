
import React from "react";
import TrainingInputs from "./TrainingInputs";
import AskTheDbPanel from "./AskTheDbPanel";

interface SingleQnATabProps {
  nlQuestion: string;
  setNlQuestion: (value: string) => void;
  generatedSQL: string;
  setGeneratedSQL: (value: string) => void;
}

const SingleQnATab = ({
  nlQuestion,
  setNlQuestion,
  generatedSQL,
  setGeneratedSQL,
}: SingleQnATabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TrainingInputs />
      <AskTheDbPanel 
        nlQuestion={nlQuestion}
        setNlQuestion={setNlQuestion}
        generatedSQL={generatedSQL}
        setGeneratedSQL={setGeneratedSQL}
      />
    </div>
  );
};

export default SingleQnATab;
