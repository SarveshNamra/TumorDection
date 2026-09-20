import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";

const PatientTable = ({ patients, canModify, onEdit, onDelete }) => {
  return (
    <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Age</th>
            <th className="px-4 py-3 font-medium">Gender</th>
            <th className="px-4 py-3 font-medium">Scans</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-medium">{patient.fullName}</td>
              <td className="px-4 py-3 text-gray-600">{patient.age}</td>
              <td className="px-4 py-3 text-gray-600">{patient.gender}</td>
              <td className="px-4 py-3 text-gray-600">{patient._count?.scans ?? 0}</td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(patient.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link to={`/patients/${patient.id}`} className="text-gray-500 hover:text-blue-600" title="View">
                    <Eye size={16} />
                  </Link>
                  {canModify.edit && (
                    <button onClick={() => onEdit(patient)} className="text-gray-500 hover:text-blue-600" title="Edit">
                      <Pencil size={16} />
                    </button>
                  )}
                  {canModify.delete && (
                    <button onClick={() => onDelete(patient)} className="text-gray-500 hover:text-red-600" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;