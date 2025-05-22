import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import EditWorkoutForm from "../components/EditWorkoutForm";

const EditWorkout = () => {
  const navigation = useNavigation<any>();

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image
            source={require("../assets/backarrow.png")}
            style={{ width: 15, height: 22 }}
          />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Edit workout</Text>
        <EditWorkoutForm />
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

export default EditWorkout;
