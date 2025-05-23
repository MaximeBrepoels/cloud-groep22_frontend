import React from "react";
import { useRouter } from "next/router";
import EditExerciseForm from "@/components/EditExerciseForm";

const EditExercise: React.FC = () => {
    const router = useRouter();
    const { workoutId } = router.query;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center">
            <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8 mt-12">
                <button
                    onClick={() => router.push({ pathname: "/edit-workout", query: { workoutId } })}
                    className="mb-4 flex items-center text-blue-600 hover:underline"
                >
                    <img
                        src="/backarrow.png"
                        alt="Back"
                        style={{ width: 15, height: 22, marginRight: 8 }}
                    />
                    Back
                </button>
                <h1 className="text-2xl font-semibold mb-6">Edit Exercise</h1>
                <EditExerciseForm />
            </div>
        </div>
    );
};

export default EditExercise;