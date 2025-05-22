import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AddExerciseButtonProps {
  onPress: () => void;
}

const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, styles.addCard]}
      onPress={onPress}
    >
        <Text style={styles.addText}>+</Text>
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
        width: "100%",
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
});

export default AddExerciseButton;