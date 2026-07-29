import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import FormInput from "../components/FormInput.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }} = useForm();

    const password = watch("password");

    const onSubmit = async (formData) => {
        setSubmitting(true);

        try {
            const { confirmPassword, ...payload } = formData;
            const res = await registerUser(payload);
            toast.success(res.message || "Account created successfully");
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            const message = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(message);
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                <h1 className="text-xl font-semibold text-gray-900 mb-1">NeuroGenAI</h1>
                <p className="text-sm text-gray-500 mb-6">Create your account</p>
            
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Full Name" type="text" error={errors.name}
                        registration={register("name", {
                            required: "Full name is required",
                            minLength: { value: 2, message: "Full name must be at least 2 characters" },
                            maxLength: { value: 100, message: "Full name must be at most 100 characters" }
                        })}
                    />

                    <FormInput label="Email" type="email" error={errors.email}
                        registration={register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: "Enter a valid email address",
                            },
                        })}
                    />

                    <PasswordInput label="Password" error={errors.password}
                        registration={register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Password must be at least 6 characters" },
                        })}
                    />

                    <PasswordInput label="Confirm Password" error={errors.confirmPassword}
                        registration={register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) => value === password || "Passwords do not match",
                        })}
                    />

                    <button type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-md transition-colors"
                    >
                        {submitting ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;