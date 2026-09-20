import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { patientService } from "../services/patientService.js";
import { getErrorMessage } from "../utils/errorMessage.js";
import Loader from "../components/common/Loader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import PatientFormModal from "../components/patients/PatientFormModal.jsx";

const STATUS_STYLES = {
  COMPLETED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRadiologist = user?.role === "RADIOLOGIST";

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getById(id);
      setPatient(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load patient."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await patientService.update(id, formData);
      toast.success("Patient updated successfully");
      setFormOpen(false);
      fetchPatient();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update patient."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await patientService.remove(id);
      toast.success("Patient deleted successfully");
      navigate("/patients", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete patient."));
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading patient..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPatient} />;
  if (!patient) return null;

  return (
    <div>
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{patient.fullName}</h1>
            <p className="text-sm text-gray-500">
              {patient.age} yrs &middot; {patient.gender}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRadiologist && (
              <button onClick={() => setFormOpen(true)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                <Pencil size={16} /> Edit
              </button>
            )}
            {/* Both DOCTOR and RADIOLOGIST can delete — matches backend authorization */}
            <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase mb-1">Medical History</h2>
          <p className="text-sm text-gray-700">{patient.medicalHistory || "No medical history recorded."}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Scans ({patient.scans?.length ?? 0})</h2>

        {(!patient.scans || patient.scans.length === 0) && (
          <p className="text-sm text-gray-500">No scans uploaded yet.</p>
        )}

        {patient.scans && patient.scans.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {patient.scans.map((scan) => (
              <li key={scan.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800">
                    {scan.tumorType ? scan.tumorType.replace("_", " ") : "Pending result"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(scan.createdAt).toLocaleString()}
                    {scan.confidence != null && ` · Confidence: ${(scan.confidence * 100).toFixed(1)}%`}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    STATUS_STYLES[scan.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {scan.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PatientFormModal
        isOpen={formOpen}
        mode="edit"
        initialData={patient}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete patient?"
        message={`This will permanently remove ${patient.fullName} and all associated scans.`}
        confirmText="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default PatientDetail;