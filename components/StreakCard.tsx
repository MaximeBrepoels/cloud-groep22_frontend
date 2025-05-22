import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import ModalComponent from "./ModalComponent";
import { Picker } from "@react-native-picker/picker";
import { UserService } from "../services/UserService";
import DropDownPicker from "react-native-dropdown-picker";
import * as Notifications from "expo-notifications";

interface StreakCardProps {
  userId: number;
}

const StreakCard = ({ userId }: StreakCardProps) => {
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(0);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const userService = new UserService();

  const fetchStreak = async () => {
    userService.getUserById(String(userId)).then((response) => {
      setStreak(response.data.streak);
      setGoal(response.data.streakGoal);
    });
  };

  useEffect(() => {
    fetchStreak();
  }, [userId]);

  const handleSetGoal = () => {
    setModalVisible(true);
  };

  const saveGoal = () => {
    userService.updateStreakGoal(userId, selectedGoal);
    setGoal(selectedGoal);
    setModalVisible(false);
  };

  const scheduleNotification = async (goal: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const remainingDays = 7 - dayOfWeek;

    if (goal <= remainingDays + 1) {
      const trigger = new Date();
      trigger.setHours(17, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Workout Reminder",
          body: "Don't forget to complete your workout to maintain your streak!",
        },
        trigger: {
          type: "daily",
          hour: 17,
          minute: 0,
          repeats: true,
        } as any,
      });
    }
  };

  useEffect(() => {
    scheduleNotification(goal);
  }, [goal]);

  return (
    <>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.setGoalButton}
          onPress={handleSetGoal}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("../assets/change_streak.png")}
            style={styles.editImage}
          />
        </TouchableOpacity>
        {goal > 0 ? (
          <>
            <Text style={streak == 0 ? styles.noStreakText : styles.streakText}>
              {streak > 0 ? "🔥 " : ""}
              {streak} week{streak > 1 || streak == 0 ? "s" : ""}
            </Text>
            <Text style={styles.subtitle}>
              Weekly goal: {goal} time{goal > 1 ? "s" : ""} per week
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.noStreakText}>0 weeks</Text>
            <Text style={styles.subtitle}>Set your goal to get started!</Text>
          </>
        )}
      </View>
      <ModalComponent
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Text style={styles.modalTitle}>Set your weekly goal!</Text>
        <DropDownPicker
          open={open}
          value={selectedGoal}
          items={[...Array(8).keys()].map((i) => ({
            label: `${i} time${i > 1 || i === 0 ? "s" : ""} per week`,
            value: i,
          }))}
          setOpen={setOpen}
          setValue={setSelectedGoal}
          style={styles.picker}
        />
        <TouchableOpacity style={styles.button} onPress={saveGoal}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </ModalComponent>
    </>
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
  streakText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5722",
    zIndex: 1,
  },
  noStreakText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    zIndex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  goalText: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
  setGoalButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  setGoalButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
  editImage: {
    width: 24,
    height: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "50%",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  picker: {
    width: "100%",
    color: "#000",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },
});

export default StreakCard;
