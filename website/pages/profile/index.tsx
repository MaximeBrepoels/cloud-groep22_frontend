import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserService } from "@/services/UserService";
import { BodyweightService } from "@/services/BodyweightService";
import { updateStreak } from "@/utils/StreakUtil";
import ProgressGraph from "@/components/BodyweightGraph";

const Profile: React.FC = () => {
    const router = useRouter();

    const [userId, setUserId] = useState<number | null>(null);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [bodyweight, setBodyweight] = useState<string>("");
    const [showBodyweightForm, setShowBodyweightForm] = useState<boolean>(false);
    const [bodyweightCollection, setBodyweightCollection] = useState<any[]>([]);

    const userService = new UserService();
    const bodyweightService = new BodyweightService();

    useEffect(() => {
        const id = sessionStorage.getItem("session_id") || "";
        if (id !== "") {
            setUserId(parseInt(id));
            updateStreak();
        } else {
            router.replace("/login");
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
            fetchBodyweightCollection();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUserDetails = async () => {
        if (userId) {
            const response = await userService.getUserById(String(userId));
            setName(response.data.name);
            setEmail(response.data.email);
        }
    };

    const fetchBodyweightCollection = async () => {
        if (userId) {
            const response = await bodyweightService.getBodyweightByUserId(userId);
            if (response.status === 200) {
                const bodyWeights = response.data
                    .filter((entry: any) => entry.bodyWeight !== null)
                    .map((entry: any) => ({
                        date: entry.date,
                        bodyWeight: entry.bodyWeight,
                    }));
                setBodyweightCollection(bodyWeights);
            } else {
                setError(response.data.message);
            }
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }
        if (userId !== null) {
            const response = await userService.updatePassword(userId, currentPassword, newPassword);
            if (response.status === 200) {
                setError("Password updated successfully");
                setShowPasswordForm(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(response.data.message);
            }
        } else {
            setError("User ID is not available");
        }
    };

    const handleBodyWeightSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (bodyweight === "") {
            setError("Body weight is required");
            return;
        }
        if (userId !== null) {
            const response = await bodyweightService.addBodyweight(userId, parseFloat(bodyweight));
            if (response.status === 200) {
                setBodyweight("");
                setShowBodyweightForm(false);
                await fetchBodyweightCollection();
            } else {
                setError(response.data.message);
            }
        } else {
            setError("User ID is not available");
        }
    };

    const logout = () => {
        sessionStorage.removeItem("session_id");
        sessionStorage.removeItem("session_token");
        router.push("/login");
    };

    return (
        <div className="max-w-xl w-full mx-auto p-8 pt-12 bg-gray-100 min-h-screen">
            <button
                className="mb-4 text-blue-600 underline"
                onClick={() => router.push("/home")}
            >
                &larr; Back
            </button>
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            <div className="mb-4">
                <div className="font-medium">Name</div>
                <div className="mb-2">{name}</div>
                <div className="font-medium">Email</div>
                <div className="mb-2">{email}</div>
            </div>
            {!showPasswordForm && (
                <button
                    className="bg-white px-4 py-2 rounded border mb-4"
                    onClick={() => setShowPasswordForm(true)}
                >
                    Change Password
                </button>
            )}
            {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Change Password</h3>
                    <input
                        className="bg-white border border-gray-300 rounded px-4 py-2 mb-2 w-full"
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <input
                        className="bg-white border border-gray-300 rounded px-4 py-2 mb-2 w-full"
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                    <input
                        className="bg-white border border-gray-300 rounded px-4 py-2 mb-2 w-full"
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <div className="text-red-500 text-center mb-2">{error}</div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="flex-1 bg-white py-2 rounded border"
                            onClick={() => setShowPasswordForm(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 bg-white py-2 rounded border">
                            Update Password
                        </button>
                    </div>
                </form>
            )}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Bodyweight</h3>
                <ProgressGraph bodyweightData={bodyweightCollection} />
                {!showBodyweightForm && (
                    <button
                        className="bg-white px-4 py-2 rounded border mt-4"
                        onClick={() => setShowBodyweightForm(true)}
                    >
                        Add Bodyweight
                    </button>
                )}
                {showBodyweightForm && (
                    <form onSubmit={handleBodyWeightSubmit} className="mt-4">
                        <input
                            className="bg-white border border-gray-300 rounded px-4 py-2 mb-2 w-full"
                            type="number"
                            placeholder="Enter your bodyweight"
                            value={bodyweight}
                            onChange={e => setBodyweight(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="flex-1 bg-white py-2 rounded border"
                                onClick={() => setShowBodyweightForm(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 bg-white py-2 rounded border">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <button
                className="bg-white px-4 py-2 rounded border mt-8 w-full"
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
};

export default Profile;