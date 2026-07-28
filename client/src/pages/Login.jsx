import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import FormInput from "../components/FormInput.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        setSubmitting(true);

        try {
            const res = await login(formData);
            toast.success(res.message || "Logged in successfully");
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            const message = error.response?.data?.message || "Login failed. Please try again.";
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
                <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Email" type="email" error={errors.email}
                        registration={register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: "Invalid email address"
                            },
                        })}
                    />

                    <PasswordInput label="Password" error={errors.password}
                        registration={register("password", {
                            required: "Password is required",
                        })}
                    />

                    <button type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-md transition-colors"
                    >
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;