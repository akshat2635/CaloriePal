import { useState } from "react";
import { X, Plus, Sparkles, ImagePlus, Trash2 } from "lucide-react";

const PRESET_MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "snacks"];

export default function FoodLogModal({ isOpen, onClose, onSubmit, loading }) {
  const [foodInput, setFoodInput] = useState("");
  const [images, setImages] = useState([]);
  const [mealType, setMealType] = useState("lunch");
  const [customMealName, setCustomMealName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setImages((prev) => [
          ...prev,
          { file, preview: reader.result, base64: base64String },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodInput.trim() && images.length === 0) {
      setError(
        "Please provide a food description or upload at least one image",
      );
      return;
    }

    setError("");
    setSuccess("");

    const selectedMealName =
      mealType === "custom" ? customMealName.trim() : mealType;

    if (!selectedMealName) {
      setError("Please enter a custom meal name");
      return;
    }

    try {
      const result = await onSubmit({
        description: foodInput,
        images: images.length > 0 ? images.map((img) => img.base64) : null,
        combine_as_meal: true,
        meal_type: selectedMealName,
      });
      if (result.success) {
        setSuccess(`✓ ${result.message}`);
        setFoodInput("");
        setImages([]);
        setMealType("lunch");
        setCustomMealName("");
        // Close modal after 1.5 seconds of showing success
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Failed to log food");
    }
  };

  const handleClose = () => {
    setFoodInput("");
    setImages([]);
    setMealType("lunch");
    setCustomMealName("");
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Log Your Food
              </h2>
              <p className="text-primary-100 mt-1">
                Describe what you ate in natural language
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="food-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                What did you eat?
              </label>
              <textarea
                id="food-input"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="e.g., 2 eggs and toast with butter, chicken salad with olive oil dressing, bowl of pasta with marinara sauce..."
                className="w-full px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-500 outline-none resize-none"
                rows="4"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Be as detailed as possible for accurate calorie tracking
              </p>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Food Images (Optional)
              </label>
              <div className="space-y-3">
                {/* Upload Button */}
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <ImagePlus className="w-5 h-5" />
                    <span>Click to upload images</span>
                  </div>
                </label>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                📸 Upload photos of your meal for better accuracy
              </p>
            </div>

            {/* Meal Naming */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Meal Name
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_MEAL_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center justify-center px-2 py-2 border-2 rounded-lg cursor-pointer transition-all ${
                        mealType === type
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="meal-type"
                        value={type}
                        checked={mealType === type}
                        onChange={(e) => setMealType(e.target.value)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <span className="text-xs sm:text-sm font-medium capitalize text-center leading-tight">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="max-w-xs">
                  <label
                    className={`inline-flex items-center px-3 py-1.5 border rounded-md cursor-pointer transition-all text-xs font-medium ${
                      mealType === "custom"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="meal-type"
                      value="custom"
                      checked={mealType === "custom"}
                      onChange={(e) => setMealType(e.target.value)}
                      className="sr-only"
                      disabled={loading}
                    />
                    Custom
                  </label>
                </div>

                {mealType === "custom" && (
                  <div>
                    <label
                      htmlFor="custom-meal-name"
                      className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2"
                    >
                      Custom meal name
                    </label>
                    <input
                      id="custom-meal-name"
                      type="text"
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                      placeholder="e.g., Post-workout meal"
                      className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🍽️ Everything in this submission is logged as one meal with
                  combined nutrition and item-level details.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  (!foodInput.trim() && images.length === 0) ||
                  (mealType === "custom" && !customMealName.trim())
                }
                className="flex-1 bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Log Food</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
