const STATUS_STYLES = {
  COMPLETED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const ScanStatusBadge = ({ status }) => (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

export default ScanStatusBadge;