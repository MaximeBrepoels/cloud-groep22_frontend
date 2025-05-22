import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";

const Progress = ({ route }: { route: any }) => {
  const { workouts } = route.params;
  const navigation = useNavigation<any>();
  const [selectedWorkout, setSelectedWorkout] = useState(workouts[0]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    selectedWorkout ? selectedWorkout.id : null
  );
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(
      workouts.map((workout: any) => ({
        label: workout.name,
        value: workout.id,
      }))
    );
  }, [workouts]);

  const handleWorkoutChange = (workoutId: string) => {
    const workout = workouts.find((w: any) => w.id === workoutId);
    setSelectedWorkout(workout);
  };

  const renderExerciseGraph = (exercise: Exercise) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const reduceLabels = (labels: string[], interval: number) =>
      labels.map((label, index) => (index % interval === 0 ? label : ""));

    const labels = exercise.progressList.map((entry) => formatDate(entry.date));
    const data =
      exercise.type === "WEIGHTS"
        ? exercise.progressList.map((entry) => entry.weight)
        : exercise.progressList.map((entry) => entry.duration);

    const interval = Math.ceil(labels.length / 6);
    const reducedLabels = reduceLabels(labels, interval);

    return (
      <View style={styles.card} key={exercise.id}>
        <Text style={styles.exerciseTitle}>{exercise.name}</Text>
        <LineChart
          data={{
            labels: reducedLabels,
            datasets: [{ data }],
          }}
          width={280}
          height={200}
          yAxisSuffix={exercise.type === "WEIGHTS" ? "kg" : "s"}
          chartConfig={{
            backgroundColor: "#FFF",
            backgroundGradientFrom: "#FFF",
            backgroundGradientTo: "#FFF",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 4 },
          }}
          style={{ marginVertical: 8, borderRadius: 8 }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Image
          source={require("../assets/backarrow.png")}
          style={{ width: 15, height: 22 }}
        />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Select Workout</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        onChangeValue={() => handleWorkoutChange(value)}
        style={styles.picker}
      />
      <Text style={styles.sectionTitle}>Exercise Progress</Text>
      <FlatList
        data={selectedWorkout.exercises.filter(
          (exercise: any) =>
            exercise.autoIncrease &&
            exercise.type !== "BODYWEIGHT" &&
            exercise.progressList.length > 0
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderExerciseGraph(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 24,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  picker: {
    width: "100%",
    color: "#000",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },
});

export default Progress;
