import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export class ExerciseService {
  private axiosInstance: AxiosInstance;

  constructor() {
    // Create an Axios instance
    this.axiosInstance = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
    });

    // Add an interceptor to attach the Authorization header
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        let token = null;

        if (Platform.OS === "web") {
          token = sessionStorage.getItem("session_token");
        } else {
          token = await SecureStore.getItemAsync("session_token");
        }

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Get excercise by id
  async getExerciseById(id: Number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.get(`/exercises/${id}`);
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async getExercisesByUserId(userId: Number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.get(
        `/exercises/user/${userId}`
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async deleteExerciseFromWorkout(
    workoutId: number,
    exerciseId: number
  ): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.delete(
        `/exercises/workout/${workoutId}/exercise/${exerciseId}`
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async updateExercise(
    id: number,
    exercise: {
      name: string;
      type: string;
      rest: number;
      autoIncrease: boolean;
      autoIncreaseFactor: number;
      autoIncreaseWeightStep: number;
      autoIncreaseStartWeight: number;
      autoIncreaseMinSets: number;
      autoIncreaseMaxSets: number;
      autoIncreaseMinReps: number;
      autoIncreaseMaxReps: number;
      autoIncreaseStartDuration: number;
      autoIncreaseDurationSets: number;
      autoIncreaseCurrentSets: number;
      autoIncreaseCurrentReps: number;
      autoIncreaseCurrentWeight: number;
      autoIncreaseCurrentDuration: number;
      sets: Array<{
        id: number;
        reps: number;
        weight: number;
        duration: number;
      }>;
    }
  ): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.put(
        `/exercises/${id}`,
        exercise
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async autoIncrease(id: number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.put(
        `/exercises/increase/${id}`
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async autoDecrease(id: number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.put(
        `/exercises/decrease/${id}`
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }
}
