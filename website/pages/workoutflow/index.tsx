import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { WorkoutService } from "@/services/WorkoutService";
import { ExerciseService } from "@/services/ExerciseService";
import { UserService } from "@/services/UserService";
import { Exercise } from "@/types";
import StepIndicator from "@/components/StepIndicator";

const WorkoutFlow: React.FC = () => {
    const [title, setTitle] = useState("");
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isResting, setIsResting] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isReadyScreen, setIsReadyScreen] = useState(true);
    const [isCompletedScreen, setIsCompletedScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [setsGenerated, setSetsGenerated] = useState(false);
    const [setResults, setSetResults] = useState<boolean[]>([]);
    const [userId, setUserId] = useState<number | null>(null);

    const workoutService = new WorkoutService();
    const exerciseService = new ExerciseService();
    const userService = new UserService();
    const router = useRouter();
    const { workoutId } = router.query;

    useEffect(() => {
        const id = sessionStorage.getItem("session_id");
        if (id) setUserId(parseInt(id));
        else router.push("/login");
    }, [router]);

    const getExercises = async () => {
        try {
            if (!workoutId || Array.isArray(workoutId) || isNaN(Number(workoutId))) {
                handleSessionError();
                return;
            }
            const response = await workoutService.getWorkoutById(Number(workoutId));
            if (response.status !== 200) {
                handleSessionError();
            } else {
                setTitle(response.data.name);
                setExercises(response.data.exercises);
            }
        } catch (error) {
            alert("Failed to load workout.");
            await router.push("/");
        } finally {
            setIsLoading(false);
        }
    };

    const removeExerciseWithoutSets = (exs: Exercise[]) =>
        exs.filter((exercise) => exercise.sets.length > 0);

    const generateAutoIncreaseSets = () => {
        let updatedExercises = exercises.map((exercise) => {
            if (exercise.autoIncrease) {
                const sets = [];
                for (let i = 0; i < exercise.autoIncreaseCurrentSets; i++) {
                    sets.push({
                        id: i,
                        weight: exercise.autoIncreaseCurrentWeight,
                        reps: exercise.autoIncreaseCurrentReps,
                        duration: exercise.autoIncreaseCurrentDuration,
                    });
                }
                return { ...exercise, sets };
            }
            return exercise;
        });
        updatedExercises = removeExerciseWithoutSets(updatedExercises);
        setExercises(updatedExercises);
        setSetsGenerated(true);
    };

    useEffect(() => {
        if (workoutId) getExercises();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workoutId]);

    useEffect(() => {
        if (exercises.length > 0 && !setsGenerated) {
            generateAutoIncreaseSets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exercises]);

    const handleSessionError = () => {
        sessionStorage.removeItem("session_id");
        router.push("/login");
    };

    const increaseDifficulty = async () => {
        const currentExercise = exercises[currentExerciseIndex];
        if (currentExercise.autoIncrease) {
            await exerciseService.autoIncrease(currentExercise.id);
        }
    };

    const decreaseDifficulty = async () => {
        const currentExercise = exercises[currentExerciseIndex];
        if (currentExercise.autoIncrease) {
            await exerciseService.autoDecrease(currentExercise.id);
        }
    };

    const changeDifficulty = async () => {
        if (setResults.includes(false)) {
            await decreaseDifficulty();
        } else if (setResults.length > 0) {
            await increaseDifficulty();
        }
    };

    const handleSuccess = async () => {
        setSetResults((prev) => [...prev, true]);
        const currentExercise = exercises[currentExerciseIndex];
        if (currentSetIndex < currentExercise.sets.length - 1) {
            setCurrentSetIndex((prev) => prev + 1);
            startRest(currentExercise.rest);
        } else if (currentExerciseIndex < exercises.length - 1) {
            await changeDifficulty();
            moveToNextExercise();
            setSetResults([]);
        } else {
            await changeDifficulty();
            completeWorkout();
        }
    };

    const handleFail = async () => {
        setSetResults((prev) => [...prev, false]);
        const currentExercise = exercises[currentExerciseIndex];
        if (currentSetIndex < currentExercise.sets.length - 1) {
            setCurrentSetIndex((prev) => prev + 1);
            startRest(currentExercise.rest);
        } else if (currentExerciseIndex < exercises.length - 1) {
            await changeDifficulty();
            moveToNextExercise();
            setSetResults([]);
        } else {
            await changeDifficulty();
            completeWorkout();
        }
    };

    const moveToNextExercise = () => {
        setCurrentSetIndex(0);
        setCurrentExerciseIndex((prev) => prev + 1);
        const nextExercise = exercises[currentExerciseIndex + 1];
        if (nextExercise) startRest(nextExercise.rest);
    };

    const completeWorkout = () => {
        if (userId) userService.updateStreakProgress(userId);
        setIsCompletedScreen(true);
    };

    const confirmCompletion = () => {
        router.push("/");
    };

    const currentExercise = exercises[currentExerciseIndex];

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0 && isResting) {
            setIsResting(false);
            if (currentExercise?.type === "DURATION") {
                setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer, isResting, currentExercise, currentSetIndex]);

    useEffect(() => {
        if (!isResting && currentExercise && currentExercise.type === "DURATION") {
            setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSetIndex, currentExercise, isResting]);

    const startRest = (duration: number) => {
        setTimer(duration);
        setIsResting(true);
    };

    const skipRest = () => {
        setIsResting(false);
        if (currentExercise?.type === "DURATION") {
            setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
        }
    };

    const getNextSetExerciseName = () => {
        if (currentSetIndex < exercises[currentExerciseIndex].sets.length - 1) {
            return exercises[currentExerciseIndex].name;
        }
        return exercises[currentExerciseIndex].name;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="text-lg mb-2">Loading workout...</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (isReadyScreen) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
                <div className="flex flex-row justify-between w-full max-w-xl mb-8">
                    <div>
                        <div className="text-xl font-semibold">{title}</div>
                        <div className="text-gray-500">
                            set 0/
                            {exercises[0]?.sets.length || exercises[0]?.autoIncreaseCurrentSets} - exercise 0/
                            {exercises.length}
                        </div>
                    </div>
                    <button onClick={() => router.push("/")} className="text-2xl">✗</button>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold mb-4">Ready?</div>
                    <div className="mb-6">
                        {exercises.map((exercise, index) => (
                            <div key={exercise.id} className="text-base">
                                {index + 1}. {exercise.name}
                                {exercise.autoIncrease && exercise.type === "WEIGHTS"
                                    ? ` - ${exercise.autoIncreaseCurrentWeight} kg`
                                    : ""}
                            </div>
                        ))}
                    </div>
                    <button
                        className="w-20 h-20 rounded-full bg-white border border-gray-300 flex items-center justify-center text-3xl"
                        onClick={() => setIsReadyScreen(false)}
                    >
                        ✓
                    </button>
                </div>
            </div>
        );
    }

    if (isCompletedScreen) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
                <div className="flex flex-row justify-between w-full max-w-xl mb-8">
                    <div>
                        <div className="text-xl font-semibold">{title}</div>
                        <div className="text-gray-500">
                            set {exercises[0]?.sets.length || exercises[0]?.autoIncreaseCurrentSets}/
                            {exercises[0]?.sets.length || exercises[0]?.autoIncreaseCurrentSets} - exercise {exercises.length}/{exercises.length}
                        </div>
                    </div>
                    <button onClick={() => router.push("/")} className="text-2xl">✗</button>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold mb-2">Successfully completed workout!</div>
                    <button
                        className="w-20 h-20 rounded-full bg-white border border-gray-300 flex items-center justify-center text-3xl"
                        onClick={confirmCompletion}
                    >
                        ✓
                    </button>
                </div>
            </div>
        );
    }

    if (exercises.length > 0 && currentExercise) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100 p-8">
                <div className="flex flex-row justify-between w-full max-w-xl mb-8">
                    <div>
                        <div className="text-xl font-semibold">{title}</div>
                        <div className="text-gray-500">
                            set {currentSetIndex + 1}/
                            {currentExercise.autoIncrease
                                ? currentExercise.autoIncreaseCurrentSets
                                : currentExercise.sets.length}
                            - exercise {currentExerciseIndex + 1}/{exercises.length}
                        </div>
                    </div>
                    <button onClick={() => router.push("/")} className="text-2xl">✗</button>
                </div>
                {/* Replace with your own step indicator if needed */}
                <div className="mb-8">
                    <StepIndicator
                        currentPosition={currentExerciseIndex}
                        stepCount={exercises.length}
                    />
                </div>
                <div className="flex flex-col items-center flex-1">
                    {isResting ? (
                        <>
                            <div className="text-4xl font-bold">
                                {`${Math.floor(timer / 60)}m${timer % 60 < 10 ? "0" : ""}${timer % 60}s`}
                            </div>
                            <div className="text-gray-500 mb-2">Rest</div>
                            <div className="text-gray-500">Next: {getNextSetExerciseName()}</div>
                        </>
                    ) : (
                        <>
                            {currentExercise.type === "DURATION" ? (
                                <div className="text-4xl font-bold">
                                    {`${Math.floor(timer / 60)}m${timer % 60 < 10 ? "0" : ""}${timer % 60}s`}
                                </div>
                            ) : (
                                <div className="text-4xl font-bold mb-2">
                                    {currentExercise.type === "WEIGHTS" &&
                                        `${currentExercise.sets[currentSetIndex]?.weight}kg ${currentExercise.sets[currentSetIndex]?.reps}reps`}
                                    {currentExercise.type === "BODYWEIGHT" &&
                                        `${currentExercise.sets[currentSetIndex]?.reps} reps`}
                                </div>
                            )}
                            <div className="text-gray-500">{currentExercise.name}</div>
                        </>
                    )}
                </div>
                <div className="flex flex-col items-center mt-8">
                    {!isResting && currentExercise && (
                        <>
                            <div className="mb-2">Completed set successfully?</div>
                            <div className="flex flex-row gap-4">
                                <button
                                    className="flex-1 border border-gray-300 rounded p-4 text-2xl"
                                    onClick={handleFail}
                                >
                                    ✗
                                </button>
                                <button
                                    className="flex-1 border border-gray-300 rounded p-4 text-2xl"
                                    onClick={handleSuccess}
                                >
                                    ✓
                                </button>
                            </div>
                        </>
                    )}
                    {isResting && (
                        <>
                            <div className="mb-2">Skip rest?</div>
                            <button
                                className="border border-gray-300 rounded p-4 text-2xl"
                                onClick={skipRest}
                            >
                                ✓
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return <div>No exercise found</div>;
};

export default WorkoutFlow;