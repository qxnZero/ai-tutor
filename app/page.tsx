"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    difficulty: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCourse(null);

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Course Roadmap Generator</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="e.g., 8 weeks"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {course && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
          <div className="text-sm text-gray-500">
            Duration: {course.duration} | Difficulty: {course.difficulty}
          </div>

          <div className="space-y-6">
            {course.modules.map((module: any) => (
              <div key={module.id} className="border rounded p-4">
                <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                <p className="text-gray-600 mb-4">{module.description}</p>

                <div className="space-y-4">
                  {module.topics.map((topic: any) => (
                    <div key={topic.id} className="ml-4 border-l-2 pl-4">
                      <h4 className="text-lg font-medium mb-2">
                        {topic.title}
                      </h4>
                      <p className="text-gray-600 mb-2">{topic.description}</p>

                      <ul className="list-disc list-inside space-y-1">
                        {topic.objectives.map((objective: any) => (
                          <li key={objective.id} className="text-gray-700">
                            {objective.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
