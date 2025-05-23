import React from "react";

interface StepIndicatorProps {
    currentPosition: number;
    stepCount: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentPosition, stepCount }) => (
    <div className="flex gap-2">
        {Array.from({ length: stepCount }).map((_, idx) => (
            <div
                key={idx}
                className={`w-5 h-5 rounded-full flex items-center justify-center
          ${idx < currentPosition ? "bg-black text-white" : "bg-gray-300"}
        `}
            >
                {idx < currentPosition ? "✔" : ""}
            </div>
        ))}
    </div>
);

export default StepIndicator;