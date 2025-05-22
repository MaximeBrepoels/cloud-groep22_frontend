import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export class UserService {
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

    // Get all users
    async getUsers(): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.get('/users');
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    // Get a user by id
    async getUserById(id: string): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.get(`/users/${id}`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    // Get workouts for a user
    async getWorkouts(id: Number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.get(`/users/${id}/workouts`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.put(`/users/${userId}/password`, {
                currentPassword,
                newPassword,
            });
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async updateStreakGoal(userId: number, streakGoal: number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.put(`/users/${userId}/streakGoal/${streakGoal}`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async updateStreakProgress(userId: number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.put(`/users/${userId}/streakProgress`);
            return response;
        } catch (error: any) {
            return error.response;
        }

    }
}
