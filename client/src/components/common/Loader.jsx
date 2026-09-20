const Loader = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center py-16">
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      {label}
    </div>
  </div>
);

export default Loader;