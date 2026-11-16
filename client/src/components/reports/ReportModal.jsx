import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { reportService } from "../../services/reportService.js";
import { getErrorMessage } from "../../utils/errorMessage.js";
import Loader from "../common/Loader.jsx";
import ErrorState from "../common/ErrorState.jsx";
import ReportView from "./ReportView.jsx";

const ReportModal = ({ reportId, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await reportService.getById(reportId));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load report."));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Close on Escape; listener removed on unmount.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close report"
          >
            <X size={20} />
          </button>
        </div>

        {loading && <Loader label="Loading report..." />}
        {!loading && error && <ErrorState message={error} onRetry={loadReport} />}
        {!loading && !error && <ReportView report={report} />}
      </div>
    </div>
  );
};

export default ReportModal;