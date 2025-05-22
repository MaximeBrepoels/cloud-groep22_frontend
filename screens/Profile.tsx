import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Image,
  View,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { UserService } from "../services/UserService";
import { updateStreak } from "../utils/streakUtils";
import {BodyweightService} from "../services/BodyweightService";
import ProgressGraph from "../components/GraphBodyweight";
import { Bodyweight } from "../types";

const Profile = () => {
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [bodyweight, setBodyweight] = useState<string>("");
  const [showBodyweightForm, setShowBodyweightForm] = useState<boolean>(false);
  const [bodyweightCollection, setBodyweightCollection] = useState<any[]>([]);

  const userService = new UserService();
  const bodyweightService = new BodyweightService();

  useEffect(() => {
    getUserId();
    fetchUserDetails();
    fetchBodyweightCollection();
  }, [userId]);

  //useEffect(() => {
  //  if (userId) {
  //    fetchBodyweightCollection();
  //  }
  //}, []); // needs to run when a new Bodyweight is added

  const getUserId = async () => {
    let id = "";
    if (Platform.OS === "web") {
      id = sessionStorage.getItem("session_id") || "";
    } else {
      id = (await SecureStore.getItemAsync("session_id")) || "";
    }

    if (id !== "") {
      setUserId(parseInt(id));
      await updateStreak();
    } else {
      if (Platform.OS === "web") navigation.navigate("Login");
    }
  };

  const fetchUserDetails = async () => {
    if (userId) {
      let response = await userService.getUserById(String(userId));
      setName(response.data.name);
      setEmail(response.data.email);
    }
  };

  const fetchBodyweightCollection = async () => {
    if (userId) {
      const response = await bodyweightService.getBodyweightByUserId(userId);
      if (response.status === 200) {
        const bodyWeights = response.data
            .filter((entry: any) => entry.bodyWeight !== null)
            .map((entry: any) => ({
              date: entry.date,
              bodyWeight: entry.bodyWeight,
            }));
        setBodyweightCollection(bodyWeights);
      } else {
        setError(response.data.message);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
        setError("All fields are required");
        return;
      }
      if (userId !== null) {
        let respone = await userService.updatePassword(userId, currentPassword, newPassword);
        if (respone.status === 200) {
          setError("Password updated successfully");
        } else {
          setError(respone.data.message);
        }
      } else {
        setError("User ID is not available");
      }
    } catch (error) {
      setError("Something went wrong. Please try again");
    }
  };

  const handleBodyWeightSubmit = async () => {
    if (bodyweight === "") {
      setError("Body weight is required");
      return;
    }

    try {
      if (userId !== null) {
        const response = await bodyweightService.addBodyweight(userId, parseFloat(bodyweight));
        if (response.status === 200) {
          setBodyweight("");
          setShowBodyweightForm(false);
          await fetchBodyweightCollection();
        } else {
          setError(response.data.message);
        }
      } else {
        setError("User ID is not available");
      }
    } catch (error) {
      setError("Something went wrong. Please try again");
    }
  };

  const logout = async () => {
    if (Platform.OS === "web") {
      sessionStorage.removeItem("session_id");
      sessionStorage.removeItem("session_token");
    } else {
      SecureStore.deleteItemAsync("session_id");
      SecureStore.deleteItemAsync("session_token");
    }
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Image
              source={require("../assets/backarrow.png")}
              style={{ width: 15, height: 22 }}
            />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>

          {!showPasswordForm && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowPasswordForm(true)}
            >
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          )}

          {showPasswordForm && (
            <>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={styles.button2}
                  onPress={() => setShowPasswordForm(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button2} onPress={handlePasswordChange}>
                  <Text style={styles.buttonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        <View>
          <Text style={styles.sectionTitle}>Bodyweight</Text>
          <ProgressGraph bodyweightData={bodyweightCollection} />
          {!showBodyweightForm && (

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowBodyweightForm(true)}
            >
              <Text style={styles.buttonText}>Add Bodyweight</Text>
            </TouchableOpacity>
          )}

          {showBodyweightForm && (
            <>
              <TextInput
                  style={styles.input}
                  placeholder="Enter your bodyweight"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={bodyweight}
                  onChangeText={setBodyweight}
              />
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={styles.button2}
                  onPress={() => setShowBodyweightForm(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button2} onPress={handleBodyWeightSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>

           </>
          )}
        </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 500,
    width: "100%",
    marginHorizontal: "auto",
    flex: 1,
    padding: 32,
    paddingTop: 64,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    height: 40,
    width: "100%",
    borderColor: "#E6E6E6",
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderColor: "#E6E6E6",
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontWeight: "500",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button2: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "45%",
  },
});

export default Profile;
