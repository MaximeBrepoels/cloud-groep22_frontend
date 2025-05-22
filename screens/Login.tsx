import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  View,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { AuthService } from "../services/AuthService"; // Adjust the import path as necessary
import { updateStreak } from "../utils/streakUtils";

const Login = () => {
  const authService = new AuthService();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const checkToken = async () => {
    try {
      let token = "";
      if (Platform.OS === "web") {
        token = sessionStorage.getItem("session_token") || "";
      } else {
        token = (await SecureStore.getItemAsync("session_token")) || "";
      }

      console.log("Token:", token);
      if (token) {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const response = await authService.login(email, password);
    if (response.status === 200) {
      if (Platform.OS === "web") {
        sessionStorage.setItem("session_token", response.data.token);
        sessionStorage.setItem("session_id", response.data.userId);
      } else {
        SecureStore.setItemAsync("session_token", response.data.token);
        SecureStore.setItemAsync("session_id", response.data.userId.toString());
      }

      await updateStreak();

      navigation.navigate("Home");
    } else {
      setError(response.data.message);
    }
  };

  React.useEffect(() => {
    checkToken().catch((err) => console.error("Token check failed", err));
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          scrollEnabled={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          scrollEnabled={true}
        />
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Register here</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 32,
    paddingTop: 48,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#FFF",
    height: 40,
    width: 200,
    borderColor: "#E6E6E6",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFF",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderColor: "#E6E6E6",
    borderWidth: 1,
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#007BFF",
    marginTop: 40,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default Login;
