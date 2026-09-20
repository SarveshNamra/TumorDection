const EmptyState = ({ message = "No data found.", action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-sm text-gray-500 mb-3">{message}</p>
    {action}
  </div>
);

export default EmptyState;