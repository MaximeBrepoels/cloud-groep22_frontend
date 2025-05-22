import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

interface Exercise {
  id: string;
  name: string;
  rest: string;
  type: string;
}

const ExerciseCard = ({ exercise, workoutId }: { exercise: Exercise, workoutId: number }) => {
  const navigation = useNavigation<any>();   
  
  const handleEdit = (exercise: Exercise) => {
    navigation.navigate("EditExercise", {exerciseId: exercise.id, workoutId: workoutId});
  };
  
  return (
    <TouchableOpacity onPress={() => handleEdit(exercise)} style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.details}>
          {exercise.type}
        </Text>
        <Text style={styles.rest}>{exercise.rest}s rest</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 16,
    width: "80%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  details: {
    fontSize: 14,
    color: "#999",
  },
  rest: {
    fontSize: 14,
    color: "#999",
  },
});

export default ExerciseCard;
