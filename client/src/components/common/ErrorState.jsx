const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-sm text-red-600 mb-3">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="text-sm font-medium text-blue-600 hover:underline">
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;