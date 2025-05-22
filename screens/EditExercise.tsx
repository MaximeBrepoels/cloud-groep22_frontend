import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import EditExerciseForm from "../components/EditExerciseForm";

const EditExercise = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { workoutId } = route.params;

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditWorkout", { workoutId: workoutId })
          }
        >
          <Image
            source={require("../assets/backarrow.png")}
            style={{ width: 15, height: 22 }}
          />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Edit Exercise</Text>
        <EditExerciseForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    marginHorizontal: "auto",
    maxWidth: 500,
    padding: 32,
    paddingTop: 64,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 16,
  },
});

export default EditExercise;
