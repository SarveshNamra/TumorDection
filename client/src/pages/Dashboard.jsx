import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-1">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Role: {user?.role}</p>

      <Link
        to="/patients"
        className="inline-block bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
      >
        <p className="text-sm font-medium text-gray-900">Patients</p>
        <p className="text-xs text-gray-500 mt-1">View and manage your patient records</p>
      </Link>
    </div>
  );
};

export default Dashboard;