import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Target,
  Activity,
  Dumbbell,
  ArrowRight,
  Check,
} from "lucide-react";

const STEPS = ["Personal Info", "Goals & Activity"];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    weight_kg: "",
    height_cm: "",
    age: "",
    gender: "male",
    goal: "maintenance",
    lifestyle: "moderately_active",
    exercise_frequency: "3-4 times per week",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate first step
      if (
        !formData.name ||
        !formData.age ||
        !formData.weight_kg ||
        !formData.height_cm
      ) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.age < 1 || formData.age > 150) {
        setError("Please enter a valid age");
        return;
      }
      if (formData.weight_kg < 1 || formData.height_cm < 1) {
        setError("Please enter valid measurements");
        return;
      }
    }
    setError("");
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await completeOnboarding(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome! Let's Get Started
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about yourself to get personalized recommendations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {STEPS.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      index <= currentStep
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`ml-3 font-medium ${
                      index <= currentStep
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 rounded ${
                      index < currentStep
                        ? "bg-primary-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Personal Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="1"
                        max="150"
                        className="input-field pl-11"
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="weight_kg"
                        value={formData.weight_kg}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.1"
                        className="input-field pl-11"
                        placeholder="70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Height (cm)
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="height_cm"
                        value={formData.height_cm}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.1"
                        className="input-field pl-11"
                        placeholder="175"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Goals & Activity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Goals & Activity Level
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Target className="inline w-5 h-5 mr-2" />
                    What's your goal?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "weight_loss",
                        label: "Weight Loss",
                        emoji: "📉",
                      },
                      {
                        value: "maintenance",
                        label: "Maintenance",
                        emoji: "⚖️",
                      },
                      {
                        value: "muscle_building",
                        label: "Muscle Gain",
                        emoji: "💪",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`card cursor-pointer border-2 transition-all hover:shadow-lg ${
                          formData.goal === option.value
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value={option.value}
                          checked={formData.goal === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="font-semibold dark:text-white">
                            {option.label}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Activity className="inline w-5 h-5 mr-2" />
                    Lifestyle
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "sedentary",
                        label: "Sedentary",
                        desc: "Desk job, little activity",
                      },
                      {
                        value: "moderately_active",
                        label: "Moderately Active",
                        desc: "Some daily activity",
                      },
                      {
                        value: "very_active",
                        label: "Very Active",
                        desc: "Active job/lifestyle",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`card cursor-pointer border-2 transition-all hover:shadow-lg ${
                          formData.lifestyle === option.value
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="lifestyle"
                          value={option.value}
                          checked={formData.lifestyle === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-semibold dark:text-white mb-1">
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {option.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Dumbbell className="inline w-5 h-5 mr-2" />
                    Exercise Frequency
                  </label>
                  <select
                    name="exercise_frequency"
                    value={formData.exercise_frequency}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="rarely">Rarely/Never</option>
                    <option value="1-2 times per week">
                      1-2 times per week
                    </option>
                    <option value="3-4 times per week">
                      3-4 times per week
                    </option>
                    <option value="5-6 times per week">
                      5-6 times per week
                    </option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Complete Setup</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
