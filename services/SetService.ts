import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export class SetService {
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
                
                if(Platform.OS === 'web') {
                    token = sessionStorage.getItem('session_token');
                } else {
                    token = await SecureStore.getItemAsync('session_token');
                }

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // Get excercise by id
    async getSetById(id: Number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.get(`/sets/${id}`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async addSetToExercise(exerciseId: Number, set: { reps: Number, weight: Number, duration: Number }): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.post(`/sets/exercise/${exerciseId}/addSet`, set);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async deleteSet(id: Number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.delete(`/sets/${id}`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }
}