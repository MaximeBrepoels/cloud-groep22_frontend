import React, { useState } from "react";
import { useRouter } from "next/router";
import { AuthenticationService } from "@/services/AuthenticationService";

const Register: React.FC = () => {
    const authenticationService = new AuthenticationService();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        const response = await authenticationService.register(name, email, password);
        if (response.status === 200) {
            router.push("/login");
        } else {
            setError(response.data.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <form
                className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center"
                onSubmit={handleRegister}
            >
                <h1 className="text-2xl font-bold mb-8">Register</h1>
                <input
                    className="bg-gray-50 border border-gray-300 rounded px-4 py-2 mb-4 w-64"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
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
                <input
                    className="bg-gray-50 border border-gray-300 rounded px-4 py-2 mb-4 w-64"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
                <div className="text-red-500 text-center mb-2">{error}</div>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded font-bold mt-2 w-64"
                >
                    Create account
                </button>
                <button
                    type="button"
                    className="text-blue-600 underline mt-8"
                    onClick={() => router.push("/login")}
                >
                    Go back to login
                </button>
            </form>
        </div>
    );
};

export default Register;