import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import Home from "./screens/Home";
import Login from "./screens/Login";
import WorkoutFlow from "./screens/WorkoutFlow";
import Register from "./screens/Register";
import EditWorkout from "./screens/EditWorkout";
import EditExercise from "./screens/EditExercise";
import Profile from "./screens/Profile";
import Progress from "./screens/Progress";
import "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform } from "react-native";
import { usePushNotification } from "./components/PushNotification";

const Stack = createStackNavigator();

export default function App() {
  const { expoPushToken, notification } = usePushNotification();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="WorkoutFlow" component={WorkoutFlow} />
          <Stack.Screen name="EditWorkout" component={EditWorkout} />
          <Stack.Screen name="EditExercise" component={EditExercise} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Progress" component={Progress} />
        </Stack.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
}
