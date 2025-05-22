import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export class BodyweightService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL,
        });

        this.axiosInstance.interceptors.request.use(
            async (config) => {
                let token = null;

                if (Platform.OS === 'web') {
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

    async addBodyweight(userId: number, weight: number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.post(`/bodyweight/add/${userId}`, { bodyWeight:weight });
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    async getBodyweightByUserId(userId: number): Promise<AxiosResponse<any, any>> {
        try {
            const response = await this.axiosInstance.get(`/bodyweight/${userId}`);
            return response;
        } catch (error: any) {
            return error.response;
        }
    }
}