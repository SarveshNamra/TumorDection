// Maps the backend's lowercase predictedClass/probabilities keys to human-readable labels.
const TUMOR_LABELS = {
    glioma: "Glioma",
    meningioma: "Meningioma",
    notumor: "No Tumor",
    pituitary: "Pituitary",
};

const formatLabel = (key) => TUMOR_LABELS[key] || key;

// Backend confidence/probabilities are 0-1 floats. Multiply by 100
// exactly once here.
const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

const PredictionResult = ({ prediction }) => {
    if (!prediction) return null;

    const { predictedClass, confidence, probabilities } = prediction;

    const sortedProbabilities = probabilities ? Object.entries(probabilities).sort(([, a], [, b]) => b - a) : [];

    return (
        <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-700 uppercase mb-2">Model Prediction</p>

            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-1">
                <p className="text-base font-semibold text-gray-900">
                    Predicted Class: {formatLabel(predictedClass)}
                </p>
                <p className="text-sm text-gray-600">
                    Model Confidence: <span className="font-medium">{formatPercent(confidence)}</span>
                </p>
            </div>

            {sortedProbabilities.length > 0 && (
                <div className="space-y-1.5">
                {sortedProbabilities.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-24 shrink-0">{formatLabel(label)}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: formatPercent(value) }} />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{formatPercent(value)}</span>
                    </div>
                ))}
                </div>
            )}

            <p className="text-[11px] text-gray-400 mt-3">
                This is an AI-generated prediction, not a definitive clinical diagnosis.
            </p>
        </div>
    );
};

export default PredictionResult;