import React from "react";

interface WorkoutCardProps {
    title?: string;
    duration?: string;
    isAddNew?: boolean;
    onClick?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({title, duration, isAddNew, onClick,}) => {
    if (isAddNew) {
        return (
            <button
                className="flex items-center justify-center bg-white border border-gray-300 rounded-lg p-6 w-[48%] mb-4 opacity-50"
                onClick={onClick}
                type="button"
                aria-label="Add new workout"
            >
                <span className="text-3xl font-bold text-black">+</span>
            </button>
        );
    }

    return (
        <button
            className="bg-white border border-gray-300 rounded-lg p-6 w-[48%] mb-4 text-left"
            onClick={onClick}
            type="button"
        >
            <div className="text-lg font-bold">{title}</div>
            <div className="text-sm text-gray-500 mt-2">{duration}</div>
        </button>
    );
};

export default WorkoutCard;