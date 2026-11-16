import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { patientService } from "../services/patientService.js";
import { scanService } from "../services/scanService.js";
import { reportService } from "../services/reportService.js";
import { getErrorMessage } from "../utils/errorMessage.js";
import Loader from "../components/common/Loader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import PatientFormModal from "../components/patients/PatientFormModal.jsx";
import ScanUpload from "../components/scans/ScanUpload.jsx";
import PredictionResult from "../components/scans/PredictionResult.jsx";
import ScanStatusBadge from "../components/scans/ScanStatusBadge.jsx";
import ReportModal from "../components/reports/ReportModal.jsx";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRadiologist = user?.role === "RADIOLOGIST";

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scans, setScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [scansError, setScansError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Holds the mlPrediction object from the most recent successful upload in this session, so it can be shown alongside the scan
  // list without a second API call.
  const [latestPrediction, setLatestPrediction] = useState(null);

  const generatingRef = useRef(new Set()); // Holds scan IDs for which a report is being generated, to disable the button while waiting for the backend.
  const [generatingIds, setGeneratingIds] = useState([]);
  const [viewReportId, setViewReportId] = useState(null);
  
  const fetchPatient = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLatestPrediction(null);
    try {
      const data = await patientService.getById(id);
      setPatient(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load patient."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchScans = useCallback(async () => {
    setScansLoading(true);
    setScansError(null);
    try {
      const data = await scanService.getByPatientId(id);
      setScans(data);
    } catch (err) {
      setScansError(getErrorMessage(err, "Failed to load scans."));
    } finally {
      setScansLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
    fetchScans();
  }, [fetchPatient, fetchScans]);

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

  // Successful 201: add the returned scan to history without refetching.
  // No report object is fabricated; a new scan has no report yet.
  const handleUploadSuccess = (data) => {
    const { patient: _omit, mlPrediction, ...newScan } = data;
    setScans((prev) => [{ ...newScan, report: null }, ...prev]);
    setLatestPrediction(mlPrediction);
  };

  // On failure (typically 502), the backend has already persisted a FAILED scan row with only partial data returned in the error body.
  // Resync from the backend rather than fabricating a scan-list entry from incomplete data.
  const handleUploadFailed = () => {
    fetchScans();
  };

  const handleGenerateReport = async (scanId) => {
    if (generatingRef.current.has(scanId)) return;
    generatingRef.current.add(scanId);
    setGeneratingIds((prev) => [...prev, scanId]);

    try {
      const { report, created, message } = await reportService.generate(scanId);

      setScans((prev) =>
        prev.map((scan) =>
          scan.id === scanId
            ? {
                ...scan,
                report: {
                  id: report.id,
                  pdfUrl: report.pdfUrl,
                  createdAt: report.createdAt,
                },
              }
            : scan
        )
      );

      toast.success(created ? "Report generated successfully" : message || "Report already exists");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate report."));
    } finally {
      generatingRef.current.delete(scanId);
      setGeneratingIds((prev) => prev.filter((sid) => sid !== scanId));
    }
  };

  const renderReportAction = (scan) => {
    if (scan.status !== "COMPLETED") {
      return (
        <p className="text-xs text-gray-400">
          Reports are available after successful scan processing.
        </p>
      );
    }

    if (scan.report) {
      return (
        <button
          type="button"
          onClick={() => setViewReportId(scan.report.id)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <FileText size={14} /> View Report
        </button>
      );
    }

    const isGenerating = generatingIds.includes(scan.id);
    return (
      <button
        type="button"
        onClick={() => handleGenerateReport(scan.id)}
        disabled={isGenerating}
        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating...
          </>
        ) : (
          <>
            <FileText size={14} /> Generate Report
          </>
        )}
      </button>
    );
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

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Upload MRI Scan</h2>
        <ScanUpload
          patientId={id}
          onUploadSuccess={handleUploadSuccess}
          onUploadFailed={handleUploadFailed}
        />
      </div>

      {latestPrediction && (
        <div className="mb-6">
          <PredictionResult prediction={latestPrediction} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Scans{!scansLoading && !scansError ? ` (${scans.length})` : ""}
        </h2>

        {scansLoading && <Loader label="Loading scans..." />}
        {!scansLoading && scansError && <ErrorState message={scansError} onRetry={fetchScans} />}

        {!scansLoading && !scansError && scans.length === 0 && (
          <p className="text-sm text-gray-500">No scans uploaded yet.</p>
        )}

        {!scansLoading && !scansError && scans.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {scans.map((scan) => (
              <li key={scan.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-800">
                    {scan.tumorType ? scan.tumorType.replace("_", " ") : "Pending result"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(scan.createdAt).toLocaleString()}
                    {scan.confidence != null && ` · Confidence: ${(scan.confidence * 100).toFixed(1)}%`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {renderReportAction(scan)}
                  <ScanStatusBadge status={scan.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewReportId && (
        <ReportModal reportId={viewReportId} onClose={() => setViewReportId(null)} />
      )}

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