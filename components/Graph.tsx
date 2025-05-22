import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types";

type Props = {
  exercises: Exercise[];
};

const ProgressGraph: React.FC<Props> = ({ exercises }: Props) => {
  const [topExercises, setTopExercises] = useState<Exercise[]>([]);

  const getTopExercises = (data: Exercise[]) => {
    return data
      .filter(
        (exercise) =>
          exercise.type !== "BODYWEIGHT" && exercise.progressList.length > 1
      )
      .map((exercise) => {
        const startProgress = exercise.progressList[0];
        const endProgress =
          exercise.progressList[exercise.progressList.length - 1];
        const progress =
          exercise.type === "WEIGHTS"
            ? (endProgress?.weight ?? 0) - (startProgress?.weight ?? 0)
            : (endProgress?.duration ?? 0) - (startProgress?.duration ?? 0);

        return {
          ...exercise,
          progress,
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  };

  useEffect(() => {
    const topExercises = getTopExercises(exercises);
    setTopExercises(topExercises);
    console.log("Top Exercises:", topExercises);
  }, [exercises]);

  const renderExercise = (exercise: Exercise) => {
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
      {topExercises.length < 1 ? (
        <Text>
          Add auto increase to an exercise to start tracking your progress
        </Text>
      ) : null}

      {topExercises.map((exercise) => renderExercise(exercise))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
    textAlign: "left",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 16,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
    width: "100%",
  },
  progressText: {
    fontSize: 14,
    color: "#777",
  },
});

export default ProgressGraph;
