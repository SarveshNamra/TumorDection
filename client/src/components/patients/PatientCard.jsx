import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";

const PatientCard = ({ patient, canModify, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{patient.fullName}</p>
          <p className="text-xs text-gray-500">
            {patient.age} yrs &middot; {patient.gender}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(patient.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Scans: {patient._count?.scans ?? 0}</p>
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <Link to={`/patients/${patient.id}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
          <Eye size={14} /> View
        </Link>
        {canModify.edit && (
          <button onClick={() => onEdit(patient)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
            <Pencil size={14} /> Edit
          </button>
        )}
        {canModify.delete && (
          <button onClick={() => onDelete(patient)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientCard;