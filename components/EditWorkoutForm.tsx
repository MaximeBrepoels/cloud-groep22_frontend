import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { WorkoutService } from "../services/WorkoutService";
import ExerciseCard from "./ExerciseCard";
import AddExerciseButton from "./AddExerciseButton";
import ModalComponent from "./ModalComponent";
import { ExerciseService } from "../services/ExcerciseService";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Exercise {
  id: string;
  name: string;
  rest: string;
  type: string;
}

const EditWorkoutForm = () => {
  const navigation = useNavigation<any>();

  const [workoutName, setWorkoutName] = React.useState("");
  const [restTime, setRestTime] = React.useState(60);
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseGoal, setExerciseGoal] = React.useState("POWER");
  const [exerciseType, setExerciseType] = React.useState("WEIGHTS");
  const [error, setError] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  
  const exerciseNameSuggestions = [
    // Bodyweight Exercises
    "Push-up",
    "Pull-up",
    "Plank",
    "Side Plank",
    "Burpees",
    "Mountain Climbers",
    "Lunges",
    "Jump Squat",
    "Glute Bridge",
    "Hollow Hold",
    "Wall Sit",
    "Pistol Squat",
    "Spiderman Push-up",
    "Archer Push-up",
    "Clap Push-up",
    "Bear Crawl",
    "Bird Dog",
    "Reverse Lunge",
    "Bulgarian Split Squat",
    "Incline Push-up",
  
    // Barbell Exercises
    "Bench Press",
    "Squat",
    "Deadlift",
    "Overhead Press",
    "Barbell Row",
    "Romanian Deadlift",
    "Incline Bench Press",
    "Good Morning",
    "Sumo Deadlift",
    "Snatch",
    "Clean and Jerk",
    "Front Squat",
    "Barbell Shrug",
  
    // Dumbbell Exercises
    "Dumbbell Curl",
    "Incline Dumbbell Curl",
    "Hammer Curl",
    "Zottman Curl",
    "Arnold Press",
    "Seated Dumbbell Press",
    "Dumbbell Lateral Raise",
    "Dumbbell Front Raise",
    "Chest Fly",
    "Dumbbell Row",
    "Dumbbell Bench Press",
    "Dumbbell Pullover",
    "Goblet Squat",
    "Single-Arm Dumbbell Press",
    "Renegade Row",
    "Dumbbell Romanian Deadlift",
  
    // Cable Machine Exercises
    "Cable Chest Press",
    "Cable Row",
    "Lat Pulldown",
    "Tricep Pushdown",
    "Face Pull",
    "Cable Kickback",
    "Cable Lateral Raise",
    "Cable Front Raise",
    "Cable Curl",
    "Cable Fly",
    "Cable Reverse Fly",
    "Cable Pull-Through",
    "Cable Woodchopper",
  
    // Bench Exercises
    "Bench Press",
    "Incline Bench Press",
    "Dumbbell Bench Press",
    "Chest Fly",
    "Tricep Dips",
    "Step-Up",
    "Split Squat",
    "Glute Bridge on Bench",
    "Hip Thrust on Bench"
  ];

  const route = useRoute<any>();
  const { workoutId } = route.params;

  const workoutService = new WorkoutService();

  const exerciseService = new ExerciseService();

  const handleExerciseNameChange = (name: string) => {
    setExerciseName(name);
    const filteredSuggestions = exerciseNameSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const selectSuggestion = (name: string) => {
    setExerciseName(name);
    setSuggestions([]); // Clear suggestions after selection
  };

  const getWorkoutInfo = async () => {
    workoutService.getWorkoutById(workoutId).then((response) => {
      setWorkoutName(response.data.name);
      setRestTime(response.data.rest);
      setExercises(response.data.exercises);
    });
  };

  React.useEffect(() => {
    if (workoutId !== 0) {
      getWorkoutInfo();
    }
  }, [workoutId]);

  const updateWorkout = () => {
    workoutService
      .updateWorkout(
        workoutId,
        workoutName,
        restTime,
        exercises.map((exercise) => exercise.id)
      )
      .then((response) => {
        navigation.navigate("Home");
      });
  };

  const createExercise = () => {
    if (exerciseName.trim() === "") {
      setError("Exercise name cannot be empty");
      return;
    }
    workoutService
      .addExercise(workoutId, { name: exerciseName, type: exerciseType }, exerciseGoal)
      .then((response) => {
        const newExercise = response.data;
        setExercises([...exercises, newExercise]);
      });
    setModalVisible(false);
    setExerciseName("");
    setExerciseGoal("POWER");
    setExerciseType("WEIGHTS");
    setError("");
  };

  const deleteWorkout = () => {
    workoutService.deleteWorkout(workoutId).then((response) => {
      navigation.navigate("Home");
    });
  };

  // Handle move up and down
  const moveItem = (index: number, direction: "up" | "down") => {
    const newExercises = [...exercises];
    const [removed] = newExercises.splice(index, 1);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    newExercises.splice(newIndex, 0, removed);
    setExercises(newExercises);
  };

  const deleteExercise = (exerciseId: number) => {
    exerciseService
      .deleteExerciseFromWorkout(workoutId, exerciseId)
      .then((response) => {
        navigation.replace("EditWorkout", { workoutId: workoutId });
      })
      .catch((error) => {
        console.error("Exercise could not be deleted!", error);
      });
  };

  // Render individual exercise
  const renderExercise = ({
    item,
    index,
  }: {
    item: Exercise;
    index: number;
  }) => (
    <View key={index} style={styles.exerciseCardContainer}>
      <ExerciseCard exercise={item} workoutId={workoutId} />
      <View style={styles.arrowButtons}>
        <TouchableOpacity
          style={index != 0 ? styles.arrowButton : styles.disabledArrowButton}
          onPress={() => moveItem(index, "up")}
          disabled={index === 0} // Disable "up" button if it's the first item
        >
          <Text style={styles.arrowText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            index != exercises.length - 1
              ? styles.arrowButton
              : styles.disabledArrowButton
          }
          onPress={() => moveItem(index, "down")}
          disabled={index === exercises.length - 1}
        >
          <Text style={styles.arrowText}>↓</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteExercise(parseInt(item.id))}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={workoutName}
          onChangeText={setWorkoutName}
        />
        <Text style={styles.inputLabel}>Rest in between exercises</Text>
        <TextInput
          style={styles.input}
          value={restTime.toString()}
          onChangeText={(text) => setRestTime(Number(text))}
        />
        <Text style={styles.inputLabel}>Exercises</Text>
        {exercises.map((exercise, index) =>
          renderExercise({ item: exercise, index })
        )}
        <AddExerciseButton onPress={() => setModalVisible(true)} />
        <View style={{ ...styles.buttonContainer2, marginTop: 32 }}>
          <TouchableOpacity
            style={styles.button2}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText2}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={updateWorkout}>
            <Text style={styles.buttonText2}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer2}>
          <TouchableOpacity onPress={deleteWorkout}>
            <Text style={{...styles.buttonText2, marginTop: 16, color: "red"}}>Delete</Text>
          </TouchableOpacity>
        </View>
        <ModalComponent
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
        >
          <Text style={styles.modalTitle}>Add new exercise</Text>
          <Text style={styles.buttonLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={exerciseName}
            onChangeText={handleExerciseNameChange} // Updated to handle suggestions
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
          <Text style={styles.buttonLabel}>Type</Text>
          <View style={styles.buttonContainer3}>
            <TouchableOpacity
              key={"WEIGHTS"}
              style={[
                styles.button2,
                exerciseType == "WEIGHTS" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseType("WEIGHTS")}
            >
              <Text style={styles.ButtonText}>WEIGHTS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"BODYWEIGHT"}
              style={[
                styles.button2,
                exerciseType == "BODYWEIGHT" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseType("BODYWEIGHT")}
            >
              <Text style={styles.ButtonText}>BODYWEIGHT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"DURATION"}
              style={[
                styles.button2,
                exerciseType == "DURATION" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseType("DURATION")}
            >
              <Text style={styles.ButtonText}>DURATION</Text>
            </TouchableOpacity>
          </View>
          
          {exerciseType !== "DURATION" && (
            <>
            <Text style={styles.buttonLabel}>Goal</Text>
            <View style={styles.buttonContainer3}>
            <TouchableOpacity
              key={"POWER"}
              style={[
                styles.button2,
                exerciseGoal == "POWER" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseGoal("POWER")}
            >
              <Text style={styles.ButtonText}>POWER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"MUSCLE"}
              style={[
                styles.button2,
                exerciseGoal == "MUSCLE" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseGoal("MUSCLE")}
            >
              <Text style={styles.ButtonText}>MUSCLE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"ENDURANCE"}
              style={[
                styles.button2,
                exerciseGoal == "ENDURANCE" ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => setExerciseGoal("ENDURANCE")}
            >
              <Text style={styles.ButtonText}>ENDURANCE</Text>
            </TouchableOpacity>
          </View>
            </>
            
          )}
          <Text style={{ color: "red", marginTop: 24 }}>{error}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setExerciseName("");
                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={createExercise}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </ModalComponent>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    width: "100%",
    alignItems: "flex-start",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 8,
  },
  input: {
    width: "100%",
    padding: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
  },
  exerciseCardContainer: {
    flexDirection: "row",
    width: "90%",
    marginBottom: 16,
    gap: "2%",
  },
  arrowButtons: {
    flexDirection: "column",
    width: "18%",
    gap: 8,
  },
  arrowButton: {
    padding: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledArrowButton: {
    padding: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
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
    marginTop: 24,
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
  button2: {
    padding: 12,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#FFF",
    alignItems: "center",
    width: "49%",
  },
  buttonText2: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer2: {
    flexDirection: "row",
    marginBottom: 16,
    gap: "2%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 18,
    color: "#000",
  },
  buttonContainer3: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 6,
  },
  selectedButton: {
    backgroundColor: "#FFF",
    width: "31%",
    opacity: 1,
  },
  unselectedButton: {
    backgroundColor: "#FFF",
    width: "31%",
    opacity: 0.5,
  },
  ButtonText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "500",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 32,
    marginBottom: 8,
    width: "100%",
  },
  suggestionsContainer: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 156,
    width: "100%",
    overflow: "hidden",
    marginTop: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    width: "100%",
  },
});

export default EditWorkoutForm;
