import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import StreakCard from '@/components/StreakCard';
import WorkoutCard from '@/components/WorkoutCard';
import ModelComponent from '@/components/ModelComponent';
import Graph from '@/components/Graph';
import LoadingScreen from '@/components/LoadingScreen';

import { UserService } from '@/services/UserService';
import { WorkoutService } from '@/services/WorkoutService';
import { ExerciseService } from '@/services/ExerciseService';
import { Exercise } from '@/types';


const workoutNameSuggestions = [
  'Full Body', 'Functional Training', 'Core', 'Push', 'Pull', 'Chest & Triceps', 'Back & Biceps', 'Shoulders', 'Arm', 'Leg', 'Glutes & Hamstrings', 'Quad Focus', 'Lower Body', 'Calf', 'Abs & Core', 'Core Stability', 'Plank', 'Six-Pack Abs', 'Lower Back', 'Pilates', 'Powerlifting', 'Deadlift', 'Barbell', 'No Equipment', 'Calisthenics', 'Bodyweight', 'Home Workout', 'Yoga', 'Stretch', 'Mobility', 'Dynamic Stretching', 'Active Recovery', 'Functional Fitness',
];

export default function Home() {
  const router = useRouter();

  const [selectedWorkout, setSelectedWorkout] = useState<{ id: string; name: string }>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [workouts, setWorkouts] = useState<{ id: string; name: string }[]>([]);
  const [userId, setUserId] = useState<number>(0);
  const [workoutName, setWorkoutName] = useState('');
  const [progressExercises, setProgressExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>(workoutNameSuggestions);

  const userService = new UserService();
  const workoutService = new WorkoutService();
  const exerciseService = new ExerciseService();

  useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('session_id') : '';
    if (id) {
      setUserId(parseInt(id));
    } else {
      router.push('/login');
    }
    setSuggestions(workoutNameSuggestions);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!userId) return;
      const workoutsRes = await userService.getWorkouts(userId);
      if (workoutsRes.status !== 200) {
        logout();
        return;
      }
      setWorkouts(workoutsRes.data);

      const exercisesRes = await exerciseService.getExercisesByUserId(userId);
      if (exercisesRes.status !== 200) {
        logout();
        return;
      }
      const autoIncreaseExercises = exercisesRes.data.filter(
          (exercise: any) =>
              exercise.autoIncrease &&
              exercise.type !== 'BODYWEIGHT' &&
              exercise.progressList.length > 1
      );
      setProgressExercises(autoIncreaseExercises);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (selectedWorkout) {
      sessionStorage.setItem('selectedWorkout', selectedWorkout.id);
    }
  }, [selectedWorkout]);

  const handleWorkoutNameChange = (name: string) => {
    setWorkoutName(name);
    const filtered = workoutNameSuggestions.filter(s =>
        s.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const selectSuggestion = (name: string) => {
    setWorkoutName(name);
    setSuggestions([]);
  };

  const handleWorkoutPress = (workoutIndex: number) => {
    setSelectedWorkout(workouts[workoutIndex]);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWorkout(undefined);
  };

  const startWorkout = () => {
    closeModal();
    router.push(`/workout-flow?workoutId=${selectedWorkout?.id}`);
  };

  const createWorkout = async () => {
    if (workoutName.trim() === '') {
      setError('Workout name is required');
      return;
    }
    const workout = { name: workoutName };
    const response = await workoutService.createWorkout(userId, workout);
    if (response.status === 200) {
      setWorkouts(await (await userService.getWorkouts(userId)).data);
      setModalVisible2(false);
      setWorkoutName('');
      router.push(`/edit-workout?workoutId=${response.data.id}`);
    } else {
      setError('Workout creation failed');
    }
  };

  const editWorkout = () => {
    closeModal();
    router.push(`/edit-workout?workoutId=${selectedWorkout?.id}`);
  };

  const logout = () => {
    sessionStorage.removeItem('session_id');
    sessionStorage.removeItem('session_token');
    router.push('/login');
  };

  const calcDuration = (workout: any) => {
    let duration = 0;
    const updatedExercises = workout.exercises.map((exercise: any) => {
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
    workout.exercises = updatedExercises;
    workout.exercises.forEach((exercise: any) => {
      duration += workout.rest;
      exercise.sets.forEach((set: any) => {
        duration += exercise.rest;
        if (exercise.type === 'BODYWEIGHT' || exercise.type === 'WEIGHTS') {
          duration += set.reps * 2;
        } else {
          duration += set.duration;
        }
      });
    });
    const minutes = Math.floor(duration / 60);
    return `~ ${Math.round(minutes / 5) * 5} min`;
  };

  if (loading) {
    return (
        <div className="max-w-xl w-full mx-auto p-8 pt-12 bg-gray-100 min-h-screen">
          <LoadingScreen />
        </div>
    );
  }

  return (
      <div className="max-w-xl w-full mx-auto p-8 pt-12 bg-gray-100 min-h-screen">
        <h2 className="text-xl font-semibold my-4">Streak</h2>
        <StreakCard userId={userId} />

        <h2 className="text-xl font-semibold my-4">My Workouts</h2>
        <div className="flex flex-wrap gap-4">
          {workouts.map((workout, index) => (
              <WorkoutCard
                  key={workout.id}
                  title={workout.name}
                  duration={calcDuration(workout)}
                  onClick={() => handleWorkoutPress(index)}
              />
          ))}
          <WorkoutCard
              isAddNew
              onClick={() => setModalVisible2(true)}
              title="Add new workout"
          />
        </div>

        <h2 className="text-xl font-semibold my-4">Progress</h2>
        <Graph exercises={progressExercises} />
        {progressExercises.length > 0 && (
            <button
                className="text-blue-600 underline mt-2"
                onClick={() => router.push('/progress')}
            >
              View all progress
            </button>
        )}

        <ModelComponent visible={isModalVisible} onClose={closeModal}>
          <h3 className="text-2xl font-semibold mb-4">{selectedWorkout?.name}</h3>
          <div className="flex gap-4 mt-4 w-full">
            <button className="flex-1 bg-white py-3 rounded border" onClick={editWorkout}>
              Edit
            </button>
            <button className="flex-1 bg-white py-3 rounded border" onClick={startWorkout}>
              Start
            </button>
          </div>
        </ModelComponent>

        <ModelComponent visible={isModalVisible2} onClose={() => setModalVisible2(false)}>
          <h3 className="text-2xl font-semibold mb-4">Add new workout</h3>
          <input
              className="bg-white h-10 w-full border border-gray-200 my-4 px-3 rounded text-base"
              placeholder="Name"
              value={workoutName}
              onChange={e => handleWorkoutNameChange(e.target.value)}
          />
          {suggestions.length > 0 && (
              <div className="bg-white border border-gray-300 rounded max-h-40 w-full overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                    <button
                        key={idx}
                        className="block w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                ))}
              </div>
          )}
          <div className="text-red-500">{error}</div>
          <div className="flex gap-4 mt-4 w-full">
            <button className="flex-1 bg-white py-3 rounded border" onClick={() => setModalVisible2(false)}>
              Cancel
            </button>
            <button className="flex-1 bg-white py-3 rounded border" onClick={createWorkout}>
              Create
            </button>
          </div>
        </ModelComponent>

        <button
            className="bg-white py-2 px-4 rounded border mt-8 w-full"
            onClick={() => router.push('/profile')}
        >
          Profile
        </button>
      </div>
  );
}