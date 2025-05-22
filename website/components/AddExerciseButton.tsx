import React from "react";

interface AddExerciseButtonProps {
    onClick: () => void;
}

const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onClick }) => {
    return (
        <button
            type="button"
            className="w-full mb-4 p-4 bg-white border border-gray-300 rounded-lg flex justify-center items-center opacity-50 hover:opacity-80 transition"
            onClick={onClick}
            aria-label="Add exercise"
        >
            <span className="text-2xl font-bold text-black">+</span>
        </button>
    );
};

export default AddExerciseButton;