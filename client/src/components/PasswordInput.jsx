import { useState } from "react";

const PasswordInput = ({ label, error, registration, ...rest }) => {
    const [visible, setVisible] = useState(false);
    const id = registration?.name;

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input id={id} type={visible ? "text" : "password"} aria-invalid={error ? "true" : "false"} 
                    {...registration} {...rest} 
                    className={`w-full px-3 py-2 pr-16 border rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        error ? "border-red-400" : "border-gray-300"
                    }`}
                />
                <button type="button" onClick={() => setVisible((v) => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                    {visible ? "Hide" : "Show"}
                </button>
            </div>
            {error && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default PasswordInput;