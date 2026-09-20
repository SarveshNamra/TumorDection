import { useAuth } from "../hooks/useAuth.js";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
        <div className="mb-3">
          <p className="text-xs text-gray-400 uppercase">Name</p>
          <p className="text-sm text-gray-800">{user?.name}</p>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray-400 uppercase">Email</p>
          <p className="text-sm text-gray-800">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Role</p>
          <p className="text-sm text-gray-800">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;