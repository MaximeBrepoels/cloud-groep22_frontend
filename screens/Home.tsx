import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import StreakCard from "../components/StreakCard";
import * as SecureStore from "expo-secure-store";
import WorkoutCard from "../components/WorkoutCard";
import { useNavigation } from "@react-navigation/native";
import { UserService } from "../services/UserService";
import { WorkoutService } from "../services/WorkoutService";
import ModalComponent from "../components/ModalComponent";
import Graph from "../components/Graph";
import { ExerciseService } from "../services/ExcerciseService";
import { Exercise } from "../types";
import LoadingScreen from "../components/LoadingScreen";

const Home = () => {
  const navigation = useNavigation<any>();

  const [selectedWorkout, setSelectedWorkout] = useState<{
    id: string;
    name: string;
  }>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [workouts, setWorkouts] = useState<{ id: string; name: string }[]>([]);
  const [userId, setUserId] = useState(Number);
  const [workoutName, setWorkoutName] = useState("");
  const [progressExercises, setProgressExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [suggestions, setSuggestions] = useState<string[]>([]); // Added for suggestions

  const workoutNameSuggestions = [
    "Full Body",
    "Functional Training",
    "Core",
    "Push",
    "Pull",
    "Chest & Triceps",
    "Back & Biceps",
    "Shoulders",
    "Arm",
    "Leg",
    "Glutes & Hamstrings",
    "Quad Focus",
    "Lower Body",
    "Calf",
    "Abs & Core",
    "Core Stability",
    "Plank",
    "Six-Pack Abs",
    "Lower Back",
    "Pilates",
    "Powerlifting",
    "Deadlift",
    "Barbell",
    "No Equipment",
    "Calisthenics",
    "Bodyweight",
    "Home Workout",
    "Yoga",
    "Stretch",
    "Mobility",
    "Dynamic Stretching",
    "Active Recovery",
    "Functional Fitness",
  ];

  const handleWorkoutNameChange = (name: string) => {
    setWorkoutName(name);
    const filteredSuggestions = workoutNameSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const selectSuggestion = (name: string) => {
    setWorkoutName(name);
    setSuggestions([]); // Clear suggestions after selection
  };

  const userService = new UserService();
  const workoutService = new WorkoutService();
  const exerciseService = new ExerciseService();

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

  const getWorkouts = async () => {
    if (userId === 0) {
      return;
    }

    const response = await userService.getWorkouts(userId);

    if (response.status !== 200) {
      logout();
      return;
    }

    setWorkouts(response.data);
  };

  const getExercises = async () => {
    if (userId === 0) {
      return;
    }
    const response = await exerciseService.getExercisesByUserId(userId);
    if (response.status !== 200) {
      logout();
      return;
    }
    const autoIncreaseExercises = response.data.filter(
      (exercise: any) =>
        exercise.autoIncrease &&
        exercise.type !== "BODYWEIGHT" &&
        exercise.progressList.length > 1
    );
    setProgressExercises(autoIncreaseExercises);
  };

  useEffect(() => {
    getUserId();
    setSuggestions(workoutNameSuggestions);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getWorkouts();
      await getExercises();
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (selectedWorkout) {
      if (Platform.OS === "web") {
        sessionStorage.setItem("selectedWorkout", selectedWorkout.id);
      } else {
        SecureStore.setItemAsync("selectedWorkout", selectedWorkout.id);
      }
    }
  }, [selectedWorkout]);

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
    navigation.navigate("WorkoutFlow", { workoutId: selectedWorkout?.id });
  };

  const createWorkout = async () => {
    if (workoutName.trim() === "") {
      setError("Workout name is required");
      return;
    }
    const workout = {
      name: workoutName,
    };
    const response = await workoutService.createWorkout(userId, workout);
    if (response.status === 200) {
      getWorkouts();
      setModalVisible2(false);
      setWorkoutName("");
      navigation.navigate("EditWorkout", { workoutId: response.data.id });
    } else {
      console.log("Workout creation failed");
    }
  };

  const editWorkout = () => {
    closeModal();
    navigation.navigate("EditWorkout", {
      workoutId: selectedWorkout?.id,
    });
  };

  const logout = async () => {
    if (Platform.OS === "web") {
      sessionStorage.removeItem("session_id");
      sessionStorage.removeItem("session_token");
    } else {
      SecureStore.deleteItemAsync("session_id");
      SecureStore.deleteItemAsync("session_token");
    }
    navigation.navigate("Login");
  };

  const calcDuration = (workout: any) => {
    let duration = 0;

    const updatedExercises = workout.exercises.map((exercise: any) => {
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

    workout.exercises = updatedExercises;

    workout.exercises.forEach((exercise: any) => {
      duration += workout.rest;
      exercise.sets.forEach((set: any) => {
        duration += exercise.rest;
        if (exercise.type == "BODYWEIGHT" || exercise.type == "WEIGHTS") {
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <LoadingScreen />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View>
        <Text style={styles.sectionTitle}>Streak</Text>
        <View>
          <StreakCard userId={userId} />
        </View>
        <Text style={styles.sectionTitle}>My Workouts</Text>
        <View style={styles.workoutContainer}>
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={workout.id}
              title={workout.name}
              duration={calcDuration(workout)}
              onPress={() => handleWorkoutPress(index)}
            />
          ))}
          <WorkoutCard
            isAddNew
            onPress={() => setModalVisible2(true)}
            title="Add new workout"
          />
        </View>
        <Text style={styles.sectionTitle}>Progress</Text>
        <Graph exercises={progressExercises} />
        {progressExercises.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Progress", { workouts: workouts })
            }
          >
            <Text>View all progress</Text>
          </TouchableOpacity>
        )}
      </View>
      <ModalComponent visible={isModalVisible} onClose={closeModal}>
        <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={editWorkout}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={startWorkout}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ModalComponent>
      <ModalComponent
        visible={isModalVisible2}
        onClose={() => setModalVisible2(false)}
      >
        <Text style={styles.modalTitle}>Add new workout</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={workoutName}
          onChangeText={handleWorkoutNameChange} // Updated to handle suggestions
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(suggestion)}
              >
                <Text>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={{ color: "red" }}>{error}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible2(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={createWorkout}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </ModalComponent>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.logoutButtonText}>Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 500,
    width: "100%",
    marginHorizontal: "auto",
    flex: 1,
    padding: 32,
    paddingTop: 48,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    minHeight: "100%",
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 16,
  },
  workoutContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  modalContent: {
    width: "100%",
    padding: 32,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "500",
    color: "black",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    gap: 16,
  },
  button: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 20,
    alignItems: "center",
    marginHorizontal: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  input: {
    backgroundColor: "#FFF",
    height: 40,
    width: "100%",
    borderColor: "#E6E6E6",
    borderWidth: 1,
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderColor: "#E6E6E6",
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#000",
    fontWeight: "500",
  },
  suggestionsContainer: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 156,
    width: "100%",
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    width: "100%",
  },
});

export default Home;
