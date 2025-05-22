import {useState, useEffect} from "react";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { WorkoutService } from "../services/WorkoutService";
import ExerciseCard from "./ExerciseCard";
import { ExerciseService } from "../services/ExcerciseService";
import SetCard from "./SetCard";
import AddExerciseButton from "./AddExerciseButton";
import { SetService } from "../services/SetService";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Set {
  id: number;
  reps: number;
  weight: number;
  duration: number;
}

const EditExerciseForm = () => {
  const navigation = useNavigation<any>();

  const [exerciseName, setExerciseName] = useState("");
  const [restTime, setRestTime] = useState(60);
  const [exerciseType, setExerciseType] = useState("");
  const [autoIncrease, setAutoIncrease] = useState(true);
  const [increaseFactor, setIncreaseFactor] = useState(1.05);
  const [startWeight, setStartWeight] = useState("0");
  const [weightSteps, setWeightSteps] = useState("0");
  const [minSets, setMinSets] = useState("0");
  const [maxSets, setMaxSets] = useState("0");
  const [minReps, setMinReps] = useState("0");
  const [maxReps, setMaxReps] = useState("0");
  const [durationSets, setDurationSets] = useState("0");
  const [startDuration, setStartDuration] = useState("0");
  const [currentDuration, setCurrentDuration] = useState("0");
  const [currentWeight, setCurrentWeight] = useState("0");
  const [currentSets, setCurrentSets] = useState("0");
  const [currentReps, setCurrentReps] = useState("0");
  const [sets, setSets] = useState<Set[]>([]);

  const route = useRoute<any>();

  const { exerciseId, workoutId } = route.params;

  const exerciseService = new ExerciseService();

  const getExerciseInfo = async () => {
    exerciseService.getExerciseById(exerciseId).then((response) => {
      setExerciseName(response.data.name);
      setRestTime(response.data.rest);
      setExerciseType(response.data.type);
      setAutoIncrease(response.data.autoIncrease);
      setIncreaseFactor(response.data.autoIncreaseFactor);
      setSets(response.data.sets);
      setStartWeight(response.data.autoIncreaseStartWeight.toString());
      setWeightSteps(response.data.autoIncreaseWeightStep.toString());
      setMinSets(response.data.autoIncreaseMinSets.toString());
      setMaxSets(response.data.autoIncreaseMaxSets.toString());
      setMinReps(response.data.autoIncreaseMinReps.toString());
      setMaxReps(response.data.autoIncreaseMaxReps.toString());
      setDurationSets(response.data.autoIncreaseDurationSets.toString());
      setStartDuration(response.data.autoIncreaseStartDuration.toString());
      setCurrentDuration(response.data.autoIncreaseCurrentDuration.toString());
      setCurrentWeight(response.data.autoIncreaseCurrentWeight.toString());
      setCurrentSets(response.data.autoIncreaseCurrentSets.toString());
      setCurrentReps(response.data.autoIncreaseCurrentReps.toString());
    });
  };

  useEffect(() => {
    getExerciseInfo();
  }, []);

  const handleExerciseTypeChange = (type: string) => {
    setExerciseType(type);
  };

  const deleteExercise = () => {
    exerciseService
      .deleteExerciseFromWorkout(workoutId, exerciseId)
      .then((response) => {
        navigation.navigate("EditWorkout", { workoutId: workoutId });
      })
      .catch((error) => {
        console.error("Exercise could not be deleted!", error);
      });
  };

  const addSet = () => {
    let currentIndex =
      sets.length > 0 ? Number(sets[sets.length - 1].id) + 1 : 0;
    setSets([...sets, { id: currentIndex, reps: 0, weight: 0, duration: 0 }]);
  };

  const updateSet = (id: number, updatedSet: Partial<Set>) => {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, ...updatedSet } : set))
    );
  };

  const deleteSet = (id: Number) => {
    setSets(sets.filter((set) => set.id !== id));
  };

  const updateExercise = () => {
    exerciseService
      .updateExercise(exerciseId, {
        name: exerciseName,
        type: exerciseType,
        rest: restTime,
        autoIncrease: autoIncrease,
        autoIncreaseFactor: increaseFactor,
        autoIncreaseWeightStep: parseFloat(weightSteps.replace(',', '.')),
        autoIncreaseStartWeight: parseInt(startWeight),
        autoIncreaseMinSets: parseInt(minSets),
        autoIncreaseMaxSets: parseInt(maxSets),
        autoIncreaseMinReps: parseInt(minReps),
        autoIncreaseMaxReps: parseInt(maxReps),
        autoIncreaseStartDuration: parseInt(startDuration),
        autoIncreaseDurationSets: parseInt(durationSets),
        autoIncreaseCurrentSets: validateCurrentSets(parseInt(currentSets)),
        autoIncreaseCurrentReps: validateCurrentReps(parseInt(currentReps)),
        autoIncreaseCurrentWeight: validateCurrentWeight(parseFloat(currentWeight.replace(',', '.'))),
        autoIncreaseCurrentDuration: validateCurrentDuration(parseInt(currentDuration)),
        sets: sets.map((set) => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight,
          duration: set.duration,
        })),
      })
      .then((response) => {
        navigation.navigate("EditWorkout", { workoutId: workoutId });
      })
      .catch((error) => {
        console.error("Exercise could not be updated!", error);
      });
  };

  const renderSet = ({ item, index }: { item: Set; index: number }) => (
    <View key={index} style={styles.exerciseCardContainer}>
      <SetCard
        set={item}
        exerciseType={exerciseType}
        deleteSet={() => deleteSet(item.id)}
        updateSet={updateSet}
      />
    </View>
  );

  const validateCurrentSets = (value: number) => {
    const min = parseInt(minSets);
    const max = parseInt(maxSets);
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

  const validateCurrentReps = (value: number) => {
    const min = parseInt(minReps);
    const max = parseInt(maxReps);
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

  const validateCurrentWeight = (value: number) => {
    const start = parseFloat(startWeight.replace(',', '.'));
    const step = parseFloat(weightSteps.replace(',', '.'));
    if (value < start) return start;
    if (value % step !== 0) return Math.floor(value / step) * step;
    return value;
  };

  const validateCurrentDuration = (value: number) => {
    const start = parseInt(startDuration);
    if (value < start) return start;
    return value;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={exerciseName}
          onChangeText={setExerciseName}
        />
        <Text style={styles.inputLabel}>Type</Text>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
              key={"WEIGHTS"}
              style={[
                styles.button3,
                exerciseType === "WEIGHTS"
                  ? styles.selectedButton
                  : styles.unselectedButton,
              ]}
              onPress={() => handleExerciseTypeChange("WEIGHTS")}
            >
              <Text style={styles.ButtonText}>Weights</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"BODYWEIGHT"}
              style={[
                styles.button3,
                exerciseType === "BODYWEIGHT"
                  ? styles.selectedButton
                  : styles.unselectedButton,
              ]}
              onPress={() => handleExerciseTypeChange("BODYWEIGHT")}
            >
              <Text style={styles.ButtonText}>Bodyweight</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={"DURATION"}
              style={[
                styles.button3,
                exerciseType === "DURATION"
                  ? styles.selectedButton
                  : styles.unselectedButton,
              ]}
              onPress={() => handleExerciseTypeChange("DURATION")}
            >
              <Text style={styles.ButtonText}>Duration</Text>
            </TouchableOpacity>
          
        </View>
        <Text style={styles.inputLabel}>Auto increase</Text>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
            key={"Automatic"}
            style={[
              styles.button2,
              autoIncrease ? styles.selectedButton : styles.unselectedButton,
            ]}
            onPress={() => setAutoIncrease(true)}
          >
            <Text style={styles.ButtonText}>Automatic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={"Manual"}
            style={[
              styles.button2,
              autoIncrease ? styles.unselectedButton : styles.selectedButton,
            ]}
            onPress={() => setAutoIncrease(false)}
          >
            <Text style={styles.ButtonText}>Manual</Text>
          </TouchableOpacity>
        </View>
        {autoIncrease && (
          <>
            <Text style={styles.inputLabel}>Increase intensity</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button3,
                  increaseFactor === 1.05
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}
                onPress={() => setIncreaseFactor(1.05)}
              >
                <Text style={styles.ButtonText}>Easy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button3,
                  increaseFactor === 1.1
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}
                onPress={() => setIncreaseFactor(1.1)}
              >
                <Text style={styles.ButtonText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button3,
                  increaseFactor === 1.15
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}
                onPress={() => setIncreaseFactor(1.15)}
              >
                <Text style={styles.ButtonText}>Hard</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Text style={styles.inputLabel}>Rest in between sets</Text>
        <TextInput
          style={styles.input}
          value={restTime.toString()}
          onChangeText={(text) => setRestTime(Number(text))}
        />
        {exerciseType === "WEIGHTS" && autoIncrease && (
          <>
            <Text style={styles.inputLabel}>Start weight</Text>
            <TextInput
              style={styles.input}
              value={startWeight}
              keyboardType="decimal-pad"
              onChangeText={(text) => setStartWeight(text)}
            />
            <Text style={styles.inputLabel}>Weight steps equipment</Text>
            <TextInput
              style={styles.input}
              value={weightSteps}
              keyboardType="decimal-pad"
              onChangeText={(text) => setWeightSteps(text)}
            />
          </>
        )}
        {exerciseType !== "DURATION" && autoIncrease && (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.column}>
                <Text style={styles.inputLabel}>Min sets</Text>
                <TextInput
                  style={styles.smallInput}
                  value={minSets}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setMinSets(text)}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.inputLabel}>Max sets</Text>
                <TextInput
                  style={styles.smallInput}
                  value={maxSets}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setMaxSets(text)}
                />
              </View>
            </View>
            <View style={styles.rowContainer}>
              <View style={styles.column}>
                <Text style={styles.inputLabel}>Min reps</Text>
                <TextInput
                  style={styles.smallInput}
                  value={minReps}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setMinReps(text)}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.inputLabel}>Max reps</Text>
                <TextInput
                  style={styles.smallInput}
                  value={maxReps}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setMaxReps(text)}
                />
              </View>
            </View>
          </>
        )}
        {exerciseType === "DURATION" && autoIncrease && (
          <>
            <Text style={styles.inputLabel}>Sets</Text>
            <TextInput
              style={styles.input}
              value={durationSets}
              keyboardType="decimal-pad"
              onChangeText={(text) => setDurationSets(text)}
            />
            <Text style={styles.inputLabel}>Start duration</Text>
            <TextInput
              style={styles.input}
              value={startDuration}
              keyboardType="decimal-pad"
              onChangeText={(text) => setStartDuration(text)}
            />
          </>
        )}
        {autoIncrease && (
          <>
            <Text style={{ ...styles.inputLabel, fontSize: 20, marginTop: 8 }}>
              Current
            </Text>
            {(exerciseType === "WEIGHTS" || exerciseType === "BODYWEIGHT") && (
              <View style={styles.rowContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Sets</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={currentSets.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={(text) => setCurrentSets(text)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={currentReps.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={(text) => setCurrentReps(text)}
                  />
                </View>
                {exerciseType === "WEIGHTS" && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={currentWeight.toString()}
                      keyboardType="decimal-pad"
                      onChangeText={(text) => setCurrentWeight(text)}
                    />
                  </View>
                )}
              </View>
            )}
            {exerciseType === "DURATION" && (
              <View style={styles.rowContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={currentDuration.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={(text) => setCurrentDuration(text)}
                  />
                </View>
              </View>
            )}
          </>
        )}
        {!autoIncrease && (
          <>
            <Text style={styles.inputLabel}>Sets</Text>
            {sets.map((set, index) => renderSet({ item: set, index }))}
            <AddExerciseButton onPress={addSet} />
          </>
        )}
        <View style={{ ...styles.buttonContainer, marginTop: 32 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("EditWorkout", { workoutId: workoutId })
            }
          >
            <Text style={styles.ButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={updateExercise}>
            <Text style={styles.ButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 32,
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
    marginBottom: 16,
  },
  exerciseCardContainer: {
    flexDirection: "row",
    width: "100%",
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
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: "2%",
    width: "100%",
    justifyContent: "space-around",
  },
  button3: {
    padding: 12,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "32%",
  },
  button2: {
    padding: 12,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "49%",
  },
  selectedButton: {
    backgroundColor: "#FFF",
    opacity: 1,
  },
  unselectedButton: {
    backgroundColor: "#FFF",
    opacity: 0.5,
  },
  ButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "500",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    gap: "2%",
  },
  column: {
    flex: 1,
    width: "49%",
  },
  smallInput: {
    width: "100%",
    padding: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
  },
  button: {
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
});

export default EditExerciseForm;
