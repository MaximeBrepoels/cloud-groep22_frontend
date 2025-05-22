import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthenticationService } from "@/services/AuthenticationService";
import { updateStreak } from "@/utils/StreakUtil";

const Login: React.FC = () => {
    const authenticationService = new AuthenticationService();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const checkToken = () => {
        const token = sessionStorage.getItem("session_token");
        if (token) {
            router.replace("/home");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        const response = await authenticationService.login(email, password);
        if (response.status === 200) {
            sessionStorage.setItem("session_token", response.data.token);
            sessionStorage.setItem("session_id", response.data.userId);
            await updateStreak();
            router.replace("/home");
        } else {
            setError(response.data.message);
        }
    };

    useEffect(() => {
        checkToken();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <form
                className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center"
                onSubmit={handleLogin}
            >
                <h1 className="text-2xl font-bold mb-8">Login</h1>
                <input
                    className="bg-gray-50 border border-gray-300 rounded px-4 py-2 mb-4 w-64"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="bg-gray-50 border border-gray-300 rounded px-4 py-2 mb-4 w-64"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="text-red-500 text-center mb-2">{error}</div>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded font-bold mt-2 w-64"
                >
                    Login
                </button>
                <button
                    type="button"
                    className="text-blue-600 underline mt-8"
                    onClick={() => router.push("/register")}
                >
                    Register here
                </button>
            </form>
        </div>
    );
};

export default Login;