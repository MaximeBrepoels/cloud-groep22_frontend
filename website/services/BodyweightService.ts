import axios, { AxiosInstance, AxiosResponse } from "axios";

export class BodyweightService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
        });

        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = sessionStorage.getItem('session_token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    async addBodyweight(userId: number, weight: number): Promise<AxiosResponse<Bodyweight>> {
        try {
            return await this.axiosInstance.post<Bodyweight>(`/bodyweight/add/${userId}`, { bodyWeight: weight });
        } catch (error: any) {
            return error.response;
        }
    }

    async getBodyweightByUserId(userId: number): Promise<AxiosResponse<Bodyweight[]>> {
        try {
            return await this.axiosInstance.get<Bodyweight[]>(`/bodyweight/${userId}`);
        } catch (error: any) {
            return error.response;
        }
    }
}