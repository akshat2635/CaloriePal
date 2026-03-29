import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../services/api";
import { ArrowLeft, Save } from "lucide-react";

export default function UpdateProfilePage() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        weight_kg: user.weight_kg || "",
        height_cm: user.height_cm || "",
        age: user.age || "",
        gender: user.gender || "male",
        goal: user.goal || "maintenance",
        lifestyle: user.lifestyle || "moderately_active",
        exercise_frequency: user.exercise_frequency || "3-4 times per week",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const numericData = {
        ...formData,
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        age: parseInt(formData.age, 10),
      };

      await profileAPI.updateProfile(numericData);
      await fetchUser();
      setSuccess(
        "Profile updated successfully. Your calorie targets have been recalculated.",
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Update Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update your body metrics and goals. Your daily calorie targets will
            adjust automatically.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="150"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                required
                step="0.1"
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height (cm)
              </label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Goal
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="maintenance">Maintenance</option>
                <option value="muscle_building">
                  Conditioning / Muscle Gain
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lifestyle
              </label>
              <select
                name="lifestyle"
                value={formData.lifestyle}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              >
                <option value="sedentary">
                  Sedentary (Office job, little exercise)
                </option>
                <option value="moderately_active">
                  Moderately Active (Light exercise/sports 3-5 days/week)
                </option>
                <option value="very_active">
                  Very Active (Hard exercise/sports 6-7 days/week)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercise Frequency
              </label>
              <select
                name="exercise_frequency"
                value={formData.exercise_frequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2 border"
              >
                <option value="rarely">Rarely or Never</option>
                <option value="1-2 times per week">1-2 times per week</option>
                <option value="3-4 times per week">3-4 times per week</option>
                <option value="5+ times per week">5+ times per week</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
