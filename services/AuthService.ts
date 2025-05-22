import axios, { AxiosResponse } from 'axios';
export class AuthService {

    constructor() {
    }

    // Register a new user
    async register(name: string, email: string, password: string): Promise<AxiosResponse<any, any>> {
        // for now because server is not implemented
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, { name, email, password });
            return response;
        } catch (error: any) {
            return error.response;
        }
    }

    // Login a user
    async login(email: string, password: string): Promise<AxiosResponse<any, any>> {
        // for now because server is not implemented
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, { email, password });
            return response;
        } catch (error: any) {
            return error.response;
        }
    }
}