import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Line } from "react-chartjs-2";
import {Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend,
} from "chart.js";
import { Exercise, Workout } from "@/types";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

type ProgressProps = {
    workouts: Workout[];
};

const Progress: React.FC<ProgressProps> = ({ workouts }) => {
    const router = useRouter();
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | number>(
        workouts[0]?.id ?? ""
    );
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | undefined>(workouts[0]);

    useEffect(() => {
        setSelectedWorkout(workouts.find((w) => w.id === selectedWorkoutId));
    }, [selectedWorkoutId, workouts]);

    const handleWorkoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWorkoutId(e.target.value);
    };

    const renderExerciseGraph = (exercise: Exercise) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        };

        const labels = exercise.progressList.map((entry) => formatDate(entry.date));
        const data =
            exercise.type === "WEIGHTS"
                ? exercise.progressList.map((entry) => entry.weight)
                : exercise.progressList.map((entry) => entry.duration);

        const interval = Math.ceil(labels.length / 6) || 1;
        const reducedLabels = labels.map((label, idx) => (idx % interval === 0 ? label : ""));

        const chartData = {
            labels: reducedLabels,
            datasets: [
                {
                    label: exercise.type === "WEIGHTS" ? "Weight (kg)" : "Duration (s)",
                    data,
                    fill: false,
                    borderColor: "rgba(39, 174, 96, 1)",
                    backgroundColor: "rgba(39, 174, 96, 0.2)",
                    tension: 0.3,
                    pointRadius: 4,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: exercise.type === "WEIGHTS" ? "kg" : "s" },
                },
                x: {
                    title: { display: true, text: "Date" },
                },
            },
        };

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4" key={exercise.id}>
                <div className="font-semibold mb-2">{exercise.name}</div>
                <Line data={chartData} options={options} height={200} />
            </div>
        );
    };

    if (!selectedWorkout) {
        return <div>No workout selected.</div>;
    }

    const filteredExercises = selectedWorkout.exercises.filter(
        (exercise: any) =>
            exercise.autoIncrease &&
            exercise.type !== "BODYWEIGHT" &&
            exercise.progressList.length > 0
    );

    return (
        <div className="max-w-xl w-full mx-auto p-8 pt-12 bg-gray-100 min-h-screen">
            <button
                className="mb-4 text-blue-600 underline"
                onClick={() => router.push("/")}
            >
                &#8592; Back
            </button>
            <h2 className="text-xl font-semibold mb-4">Select Workout</h2>
            <select
                className="w-full p-2 border border-gray-300 rounded mb-6"
                value={selectedWorkoutId}
                onChange={handleWorkoutChange}
            >
                {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                        {workout.name}
                    </option>
                ))}
            </select>
            <h2 className="text-xl font-semibold mb-4">Exercise Progress</h2>
            {filteredExercises.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">No progress data available.</div>
            ) : (
                filteredExercises.map((exercise: Exercise) => renderExerciseGraph(exercise))
            )}
        </div>
    );
};

export default Progress;