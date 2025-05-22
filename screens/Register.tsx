import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthService } from "../services/AuthService"; // Adjust the import path as necessary

const authService = new AuthService();

const Register = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const response = await authService.register(name, email, password);
    if (response.status === 200) {
      navigation.navigate("Login");
    } else {
      setError(response.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          scrollEnabled={true}
        />
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
          scrollEnabled={true}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
                      />
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Go back to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F5F5F5",
    padding: 32,
    paddingTop: 48,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFF',
    height: 40,
    width: 200,
    borderColor: '#E6E6E6',
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
    textDecorationLine: 'underline',
  },
});

export default Register;