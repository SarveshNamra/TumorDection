import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import FormInput from "../FormInput.jsx";
import SelectInput from "../SelectInput.jsx";
import FormTextArea from "../FormTextArea.jsx";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const PatientFormModal = ({ isOpen, mode, initialData, onClose, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: "", age: "", gender: "", medicalHistory: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        fullName: initialData?.fullName || "",
        age: initialData?.age ?? "",
        gender: initialData?.gender || "",
        medicalHistory: initialData?.medicalHistory || "",
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (formData) => {
    onSubmit({ ...formData, age: Number(formData.age) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit Patient" : "Add Patient"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <FormInput
            label="Full Name"
            type="text"
            error={errors.fullName}
            registration={register("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
              maxLength: { value: 100, message: "Name must be less than 100 characters" },
            })}
          />

          <FormInput
            label="Age"
            type="number"
            error={errors.age}
            registration={register("age", {
              required: "Age is required",
              min: { value: 1, message: "Age must be at least 1" },
              max: { value: 150, message: "Age must be less than 150" },
              validate: (value) => Number.isInteger(Number(value)) || "Age must be a whole number",
            })}
          />

          <SelectInput
            label="Gender"
            options={GENDER_OPTIONS}
            error={errors.gender}
            registration={register("gender", { required: "Gender is required" })}
          />

          <FormTextArea
            label="Medical History (optional)"
            error={errors.medicalHistory}
            registration={register("medicalHistory")}
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md"
            >
              {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal;