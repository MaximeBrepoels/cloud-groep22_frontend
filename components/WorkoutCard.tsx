import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutCardProps {
  title?: string;
  duration?: string;
  isAddNew?: boolean;
  onPress?: (title: string) => void; // Add this
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  duration,
  isAddNew,
  onPress,
}) => {
  const handlePress = () => {
    if (title && onPress) {
      onPress(title); // Trigger the onPress function passed from parent
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isAddNew && styles.addCard]}
      onPress={handlePress} // Disable press for "Add New"
    >
      {isAddNew ? (
        <Text style={styles.addText}>+</Text>
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.duration}>{duration}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 16,
    width: "48%",
    marginBottom: 16,
  },
  addCard: {
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  addText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  duration: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
});

export default WorkoutCard;
