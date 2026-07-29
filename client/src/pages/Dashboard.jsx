import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-semibold text-gray-900">NeuroGenAI Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-600 hover:text-red-600"
                    >
                        Logout
                    </button>
                </div>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <p className="text-gray-700">
                        Welcome, <span className="font-medium">{user?.name}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
                    <p className="text-sm text-gray-400 mt-4">Dashboard content coming soon.</p>
                    </div>
            </div>
        </div>
    );
};

export default Dashboard;