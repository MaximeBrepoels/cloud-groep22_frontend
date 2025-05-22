import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { SetService } from "../services/SetService";

interface Set {
  id: number;
  reps: number;
  weight: number;
  duration: number;
}

interface SetCardProps {
  set: Set;
  exerciseType: string;
  deleteSet?: () => void;
  currentSets?: number;
  updateSet: (id: number, updatedSet: Partial<Set>) => void;
}

const SetCard = (props: SetCardProps) => {
  const [reps, setReps] = React.useState(props.set.reps);
  const [weight, setWeight] = React.useState(props.set.weight);
  const [duration, setDuration] = React.useState(props.set.duration);

  const handleRepsChange = (text: string) => {
    setReps(Number(text));
    props.updateSet(props.set.id, { reps: Number(text) });
  };

  const handleWeightChange = (text: string) => {
    setWeight(Number(text));
    props.updateSet(props.set.id, { weight: Number(text) });
  };

  const handleDurationChange = (text: string) => {
    setDuration(Number(text));
    props.updateSet(props.set.id, { duration: Number(text) });
  };

  return (
    <View style={styles.container}>
      {props.exerciseType !== "DURATION" && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={reps.toString()}
            onChangeText={handleRepsChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#888"
          />
          <Text style={styles.label}>reps</Text>
        </View>
      )}
      {props.exerciseType === "WEIGHTS" && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={weight.toString()}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#888"
          />
          <Text style={styles.label}>kg</Text>
        </View>
      )}
      {props.exerciseType === "DURATION" && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={duration.toString()}
            onChangeText={handleDurationChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#888"
          />
          <Text style={styles.label}>seconds</Text>
        </View>
      )}
      {props.deleteSet && (
        <TouchableOpacity style={styles.deleteButton} onPress={props.deleteSet}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  input: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    textAlign: "left",
    width: "80%",
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
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
});

export default SetCard;
