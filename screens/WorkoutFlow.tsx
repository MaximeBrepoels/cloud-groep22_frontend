import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { WorkoutService } from "../services/WorkoutService";
import { Exercise } from "../types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ExerciseService } from "../services/ExcerciseService";
import StepIndicator from "react-native-step-indicator";
import { UserService } from "../services/UserService";

const WorkoutFlow = () => {
  const [title, setTitle] = useState("");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { workoutId } = route.params;
  const [isReadyScreen, setIsReadyScreen] = useState(true);
  const [isCompletedScreen, setIsCompletedScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setsGenerated, setSetsGenerated] = useState(false);
  const [setResults, setSetResults] = useState<boolean[]>([]);
  const [userId, setUserId] = useState(0);

  const workoutService = new WorkoutService();
  const exerciseService = new ExerciseService();
  const userService = new UserService();
  
  const customStyles = {
    stepIndicatorSize: 18,
    currentStepIndicatorSize: 22,
    separatorStrokeWidth: 5,
    currentStepStrokeWidth: 0,
    stepStrokeCurrentColor: "transparent",
    stepStrokeWidth: 0,
    separatorFinishedColor: "#000000",
    separatorUnFinishedColor: "#cccccc",
    stepIndicatorFinishedColor: "#000000",
    stepIndicatorUnFinishedColor: "#cccccc",
    stepIndicatorCurrentColor: "#000000",
    stepIndicatorLabelFontSize: 0,
    currentStepIndicatorLabelFontSize: 0,
  };
  
  const getUserId = async () => {
    let id = "";
    if (Platform.OS === "web") {
      id = sessionStorage.getItem("session_id") || "";
    } else {
      id = (await SecureStore.getItemAsync("session_id")) || "";
    }

    if (id !== "") {
      setUserId(parseInt(id));
    } else {
      if (Platform.OS == "web") navigation.navigate("Login");
    }
  };

  React.useEffect(() => {
      getUserId();
    }, []);
  
  const getExercises = async () => {
    try {
      const response = await workoutService.getWorkoutById(workoutId);
      if (response.status !== 200) {
        handleSessionError();
      } else {
        setTitle(response.data.name);
        setExercises(response.data.exercises);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      Alert.alert("Error", "Failed to load workout.", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseWithoutSets = (exercises: any) => {
    let updatedExercises = exercises.filter(
      (exercise: any) => {
        return exercise.sets.length > 0;
      }
    );
    return updatedExercises;
  };

  const generateAutoIncreaseSets = () => {
    let updatedExercises = exercises.map((exercise) => {
      if (exercise.autoIncrease) {
        const sets: {
          id: number;
          weight: number;
          reps: number;
          duration: number;
        }[] = [];
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
    getExercises();
  }, []);

  useEffect(() => {
    if (exercises.length > 0 && !setsGenerated) {
      generateAutoIncreaseSets();
    }
  }, [exercises]);

  const handleSessionError = () => {
    if (Platform.OS === "web") {
      sessionStorage.removeItem("id");
      sessionStorage.removeItem("token");
    } else {
      SecureStore.deleteItemAsync("id");
      SecureStore.deleteItemAsync("token");
    }
    navigation.navigate("Login");
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
    if (currentSetIndex < exercises[currentExerciseIndex].sets.length - 1) {
      setCurrentSetIndex((prev) => prev + 1);
      startRest(currentExercise.rest);
    } else if (currentExerciseIndex < exercises.length - 1) {
      changeDifficulty();
      moveToNextExercise();
      setSetResults([]);
    } else {
      changeDifficulty();
      completeWorkout();
    }
  };

  const handleFail = async () => {
    setSetResults((prev) => [...prev, false]);
    if (currentSetIndex < exercises[currentExerciseIndex].sets.length - 1) {
      setCurrentSetIndex((prev) => prev + 1);
      startRest(currentExercise.rest);
    } else if (currentExerciseIndex < exercises.length - 1) {
      changeDifficulty();
      moveToNextExercise();
      setSetResults([]);
    } else {
      changeDifficulty();
      completeWorkout();
    }
  };

  const moveToNextExercise = () => {
    setCurrentSetIndex(0);
    setCurrentExerciseIndex((prev) => prev + 1);
    startRest(currentExercise.rest);
  };

  const completeWorkout = () => {
    userService.updateStreakProgress(userId);
    setIsCompletedScreen(true); // Show the "Completed" screen
  };

  const confirmCompletion = () => {
    navigation.navigate("Home"); // Navigate back to Home
  };

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isResting) {
      setIsResting(false);
      currentExercise?.type === "DURATION" &&
        setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, isResting, currentExercise, currentSetIndex]);

  useEffect(() => {
    if (!isResting && currentExercise && currentExercise.type === "DURATION") {
      setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
    }
  }, [currentSetIndex, currentExercise, isResting]);

  const startRest = (duration: number) => {
    setTimer(duration);
    setIsResting(true);
  };

  const skipRest = () => {
    setIsResting(false);
    currentExercise?.type === "DURATION" &&
      setTimer(currentExercise.sets[currentSetIndex]?.duration || 0);
  };

  const getNextSetExerciseName = () => {
    if (currentSetIndex < exercises[currentExerciseIndex].sets.length - 1) {
      return exercises[currentExerciseIndex].name;
    }
    return exercises[currentExerciseIndex].name;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (isReadyScreen) {
    return (
      <View style={styles.readyContainer}>
        <View style={styles.header}>
          <View style={styles.flexContainer}>
            <Text style={styles.workoutTitle}>{title}</Text>
            <Text style={styles.details}>
              set 0/
              {exercises[0]?.sets.length ||
                exercises[0]?.autoIncreaseCurrentSets}{" "}
              - exercise 0/
              {exercises.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.buttonText}>✗</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.readyContent}>
          <Text style={styles.readyText}>Ready?</Text>
          <View style={styles.exerciseOverview}>
            {exercises.map((exercise, index) => (
              <Text key={index} style={styles.exerciseItem}>
                {index + 1}. {exercise.name}
                {exercise.autoIncrease
                  ? exercise.type === "WEIGHTS"
                    ? ` - ${exercise.autoIncreaseCurrentWeight} kg`
                    : ""
                  : ""}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setIsReadyScreen(false)}
          >
            <Text style={styles.startButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isCompletedScreen) {
    // Completed screen
    return (
      <View style={styles.readyContainer}>
        <View style={styles.header}>
          <View style={styles.flexContainer}>
            <Text style={styles.workoutTitle}>{title}</Text>
            <Text style={styles.details}>
              set{" "}
              {exercises[0]?.sets.length ||
                exercises[0]?.autoIncreaseCurrentSets}
              /
              {exercises[0]?.sets.length ||
                exercises[0]?.autoIncreaseCurrentSets}{" "}
              - exercise {exercises.length}/{exercises.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.buttonText}>✗</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.readyContent}>
          <Text style={{...styles.readyText, marginBottom: 8}}>Succesfully completed workout!</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={confirmCompletion}
          >
            <Text style={styles.startButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (exercises.length > 0 && currentExercise) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.flexContainer}>
            <Text style={styles.workoutTitle}>{title}</Text>
            <Text style={styles.details}>
              set {currentSetIndex + 1}/
              {currentExercise.autoIncrease
                ? currentExercise.autoIncreaseCurrentSets
                : currentExercise.sets.length}
              - exercise
              {currentExerciseIndex + 1}/{exercises.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.buttonText}>✗</Text>
          </TouchableOpacity>
        </View>

        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentExerciseIndex}
          stepCount={exercises.length}
          renderStepIndicator={({ stepStatus }) => {
            if (stepStatus === "finished") {
              return (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✔</Text>
                </View>
              );
            }
            return <View />;
          }}
        />

        <View style={styles.content}>
          {isResting ? (
            <>
              <Text style={styles.timerText}>
                {`${Math.floor(timer / 60)}m${timer % 60 < 10 ? "0" : ""}${timer % 60}`}
                s
              </Text>
              <Text style={styles.details}>Rest</Text>
              <Text style={styles.nextExerciseText}>
                Next: {getNextSetExerciseName()}
              </Text>
            </>
          ) : (
            <>
              {currentExercise.type === "DURATION" ? (
                <Text style={styles.timerText}>
                  {`${Math.floor(timer / 60)}m${
                    timer % 60 < 10 ? "0" : ""
                  }${timer % 60}s`}
                </Text>
              ) : (
                <Text style={styles.exerciseName}>
                  {currentExercise.type === "WEIGHTS" &&
                    `${currentExercise.sets[currentSetIndex]?.weight}kg ${
                      currentExercise.sets[currentSetIndex]?.reps
                    }reps`}
                  {currentExercise.type === "BODYWEIGHT" &&
                    `${currentExercise.sets[currentSetIndex]?.reps} reps`}
                </Text>
              )}
              <Text style={styles.details}>{currentExercise.name}</Text>
            </>
          )}
        </View>

        {!isResting && currentExercise && (
          <View style={styles.completionContainer}>
            <Text style={styles.completedText}>
              Completed set successfully?
            </Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button} onPress={handleFail}>
                <Text style={styles.buttonText}>✗</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSuccess}>
                <Text style={styles.buttonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {isResting && (
          <View style={styles.completionContainer}>
            <Text style={styles.completedText}>Skip rest?</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
                <Text style={styles.buttonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  } else {
    return <Text>No exercise found</Text>;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: "#6B6B6B",
  },
  finishedText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  readyContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 64,
    padding: 32,
  },
  readyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  readyText: {
    fontSize: 32,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  startButtonText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    padding: 32,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  flexContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  exerciseName: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 40,
    fontWeight: "500",
    color: "#000",
  },
  completionContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  completedText: {
    fontSize: 16,
    color: "#000",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000",
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    alignItems: "center",
  },
  restContainer: {
    alignItems: "center",
    justifyContent: "center", // Centers the timer and "Rest" text
    flex: 1, // Ensures it doesn't stretch unnecessarily
    width: "100%",
  },
  buttonsContainer: {
    alignItems: "center",
    bottom: 0, // Adjust to your preference
    width: "99%",
    marginHorizontal: 10,
  },
  nextExerciseText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
  exerciseOverview: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  exerciseItem: {
    fontSize: 16,
    color: "#000",
    marginVertical: 5,
  },
  checkmarkContainer: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#000000", // Black for completed steps
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#ffffff", // White checkmark for completed steps
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default WorkoutFlow;
