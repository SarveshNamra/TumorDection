import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileImage, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { scanService } from "../../services/scanService.js";
import { getErrorMessage } from "../../utils/errorMessage.js";

// Mirrors backend constraints exactly (upload.middleware.js):
// ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'], 10MB limit.
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ScanUpload = ({ patientId, onUploadSuccess, onUploadFailed }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const clearSelection = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setValidationError(null);
        if (inputRef.current) inputRef.current.value = "";
    }, [previewUrl]);

    const validateFile = (candidate) => {
        if (!ALLOWED_TYPES.includes(candidate.type)) {
        return "Only JPEG and PNG images are allowed.";
        }
        if (candidate.size > MAX_FILE_SIZE) {
        return "File size must not exceed 10 MB.";
        }
        return null;
    };

    const handleFileSelect = (candidate) => {
        const error = validateFile(candidate);
        if (error) {
            setValidationError(error);
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setValidationError(null);
        setFile(candidate);
        setPreviewUrl(URL.createObjectURL(candidate));
    };

    const handleInputChange = (e) => {
        const candidate = e.target.files?.[0];
        if (candidate) handleFileSelect(candidate);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const candidate = e.dataTransfer.files?.[0];
        if (candidate) handleFileSelect(candidate);
    };

    const handleUpload = async () => {
        if (!file || uploading) return;
        setUploading(true);
        try {
            const res = await scanService.createScan(patientId, file);
            toast.success(res.message || "Scan uploaded and analyzed successfully");
            onUploadSuccess(res.data);
            clearSelection();
        } catch (err) {
            // A FAILED scan row may already exist in the DB (see 502 cases in
            // scan.controller.js) — the parent resyncs from the backend rather
            // than us fabricating a scan-list entry from a partial error body.
            toast.error(getErrorMessage(err, "Scan upload failed. Please try again."));
            onUploadFailed?.();
            clearSelection();
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
        {!file && (
            <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-10 px-4 text-center cursor-pointer transition-colors ${
                    dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
            >
                <UploadCloud size={28} className="text-gray-400" />
                <p className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">JPEG or PNG, up to 10 MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleInputChange}
                    className="hidden"
                />
            </div>
        )}

        {validationError && (
            <p role="alert" className="mt-2 text-xs text-red-600">
                {validationError}
            </p>
        )}

        {file && (
            <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
                <img
                    src={previewUrl}
                    alt="Selected MRI scan preview"
                    className="w-24 h-24 object-cover rounded-md border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                    <FileImage size={14} className="shrink-0" />
                    {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {formatFileSize(file.size)} &middot; {file.type}
                </p>
                <button
                    type="button"
                    onClick={clearSelection}
                    disabled={uploading}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 mt-2 disabled:opacity-50"
                >
                    <X size={14} /> Remove
                </button>
                </div>
            </div>

            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-md transition-colors"
            >
                {uploading ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading &amp; analyzing...
                </>
                ) : (
                "Upload Scan"
                )}
            </button>
            </div>
        )}
        </div>
    );
};

export default ScanUpload;