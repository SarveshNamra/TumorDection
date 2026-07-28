const FormInput = ({ label, type = "text", error, registration, ...rest }) => {
    const id = registration?.name;

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input id={id} type={type} aria-invalid={error ? "true" : "false"}
                {...registration} {...rest}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? "border-red-400" : "border-gray-300"
                }`}
            />
            {error && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default FormInput;