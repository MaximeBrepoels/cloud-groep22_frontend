import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export class WorkoutService {
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

  // Create workout for a user
  async createWorkout(
    userId: Number,
    workout: { name: string }
  ): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.post(
        `/workouts?userId=${userId}`,
        workout
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  // Get workout by id
  async getWorkoutById(id: Number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.get(`/workouts/${id}`);
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async updateWorkout(
    id: Number,
    name: string,
    rest: number,
    exerciseIds: string[]
  ): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.put(`/workouts/${id}`, {
        name: name,
        rest: rest,
        exerciseIds: exerciseIds,
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async deleteWorkout(id: Number): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.delete(`/workouts/${id}`);
      return response;
    } catch (error: any) {
      return error.response;
    }
  }

  async addExercise(
    workoutId: Number,
    exercise: { name: string, type: string },
    goal: String
  ): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.axiosInstance.post(
        `/workouts/${workoutId}/addExercise/${goal}`,
        exercise
      );
      return response;
    } catch (error: any) {
      return error.response;
    }
  }
}
