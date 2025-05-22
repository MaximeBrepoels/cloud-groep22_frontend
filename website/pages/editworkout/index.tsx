import React from "react";
import { useRouter } from "next/router";
import EditWorkoutForm from "@/components/EditWorkoutForm";

const EditWorkout: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-16">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-xl">
                <button
                    className="mb-4 flex items-center text-blue-600 hover:underline"
                    onClick={() => router.push("/")}
                >
                    <img
                        src="/backarrow.png"
                        alt="Back"
                        className="w-4 h-6 mr-2"
                    />
                    Back
                </button>
                <h2 className="text-2xl font-semibold mb-6">Edit workout</h2>
                <EditWorkoutForm />
            </div>
        </div>
    );
};

export default EditWorkout;