import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { patientService } from "../services/patientService.js";
import { getErrorMessage } from "../utils/errorMessage.js";
import Loader from "../components/common/Loader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import PatientTable from "../components/patients/PatientTable.jsx";
import PatientCard from "../components/patients/PatientCard.jsx";
import PatientFormModal from "../components/patients/PatientFormModal.jsx";

const Patients = () => {
  const { user } = useAuth();
  const isRadiologist = user?.role === "RADIOLOGIST";

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load patients."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const openAddForm = () => {
    setFormMode("add");
    setEditingPatient(null);
    setFormOpen(true);
  };

  const openEditForm = (patient) => {
    setFormMode("edit");
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPatient(null);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (formMode === "edit") {
        await patientService.update(editingPatient.id, formData);
        toast.success("Patient updated successfully");
      } else {
        await patientService.create(formData);
        toast.success("Patient created successfully");
      }
      closeForm();
      fetchPatients();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save patient."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await patientService.remove(deleteTarget.id);
      toast.success("Patient deleted successfully");
      setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete patient."));
    } finally {
      setDeleting(false);
    }
  };

  // Backend allows both DOCTOR and RADIOLOGIST to delete (no role check
  // in patient.controller.js deletePatient). Edit/create remain
  // RADIOLOGIST-only, matching backend role checks. See Existing Code
  // Review note on this conflict vs. the task prompt's assumption.
  const canModify = { edit: isRadiologist, delete: true };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">Manage your patient records</p>
        </div>
        {isRadiologist && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <Plus size={16} />
            Add Patient
          </button>
        )}
      </div>

      {loading && <Loader label="Loading patients..." />}
      {!loading && error && <ErrorState message={error} onRetry={fetchPatients} />}
      {!loading && !error && patients.length === 0 && <EmptyState message="No patients found." />}

      {!loading && !error && patients.length > 0 && (
        <>
          <PatientTable patients={patients} canModify={canModify} onEdit={openEditForm} onDelete={setDeleteTarget} />
          <div className="md:hidden space-y-3">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                canModify={canModify}
                onEdit={openEditForm}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </>
      )}

      <PatientFormModal
        isOpen={formOpen}
        mode={formMode}
        initialData={editingPatient}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete patient?"
        message={`This will permanently remove ${deleteTarget?.fullName} and all associated scans.`}
        confirmText="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Patients;