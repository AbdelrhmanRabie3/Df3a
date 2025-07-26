import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../contexts/ProfileContext";
import { editUserProfile } from "../../services/profileService";
import { StudentProfileSchema } from "../../utils/Schema";
import { AuthContext } from "../../contexts/AuthContextProvider";
import Cookies from "js-cookie";
export default function StudentProfileForm({  isRegistered }) {
  const { user } = useContext(AuthContext);
  const { refreshUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    education: "",
    skills: [],
    careerGoals: "",
    cvs: [], // array of File objects or URLs
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [cvsInput, setCvsInput] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        education: user.education || "",
        skills: user.skills || [],
        careerGoals: user.careerGoals || "",
        cvs: user.cvs || [],
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (!skillsInput.trim()) return;
    if (formData.skills.length >= 15) return;
    if (!formData.skills.includes(skillsInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillsInput.trim()],
      }));
    }
    setSkillsInput("");
  };
  const handleRemoveSkill = (idx) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  // CV upload handlers
  const handleCvsChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      cvs: [...prev.cvs, ...files],
    }));
    setCvsInput([]);
  };

  // Remove CV from backend and UI
  const handleRemoveCv = async (idx) => {
    const cvToRemove = formData.cvs[idx];

    // If it's a Cloudinary object, it should have public_id
    if (cvToRemove && typeof cvToRemove === "object" && cvToRemove.public_id) {
      try {
        const token = Cookies.get("token");

        await fetch("http://localhost:5000/api/students/delete-cv", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            public_id: cvToRemove.public_id,
          }),
        });
      } catch (err) {
        console.error("Failed to delete CV:", err);
      }
    }

    // Remove from frontend state
    setFormData((prev) => ({
      ...prev,
      cvs: prev.cvs.filter((_, i) => i !== idx),
    }));
  };

  // Helper to upload a single CV file
  async function uploadCvFile(file) {
    const formData = new FormData();
    formData.append("cv", file);

    const token = Cookies.get("token");

    const res = await fetch("http://localhost:5000/api/students/upload-cv", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log(data);
    if (data.success) {
      return {
        url: data.url, // secure_url from Cloudinary
        public_id: data.public_id, // used for deletion
        original_filename: file.name, // show correct file name
      };
    } else {
      throw new Error(data.message || "CV upload failed");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setValidationErrors({});
    try {
      StudentProfileSchema.parse(formData);
      const { education, skills, careerGoals, cvs } = formData;
      // Upload new CV files and collect their URLs
      const uploadedCvUrls = [];
      for (const cv of cvs) {
        if (cv instanceof File) {
          const uploaded = await uploadCvFile(cv);
          uploadedCvUrls.push(uploaded);
        } else {
          uploadedCvUrls.push(cv); // already a URL
        }
      }
      const updatedUser = await editUserProfile({
        education,
        skills,
        careerGoals,
        cvs: uploadedCvUrls,
        isRegistered: true,
      });
      if (updatedUser) {
        setSuccess(
          isRegistered
            ? "Profile updated successfully!"
            : "Profile registered successfully!"
        );
        if (refreshUser) await refreshUser();
      }
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      if (err.errors) {
        // zod error
        const errors = {};
        err.errors.forEach((e) => {
          errors[e.path[0]] = e.message;
        });
        setValidationErrors(errors);
      } else {
        setError("Failed to save profile. Please try again.");
      }
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-2 rounded">{success}</div>
      )}
      {/* Education */}
      <section className="bg-surface card shadow-xl p-8 rounded-2xl">
        <h2 className="text-xl font-bold font-poppins text-primary mb-6">
          Education
        </h2>
        <input
          className="input-field bg-input border-input border text-primary text-sm rounded-md px-4 py-3 block w-full"
          name="education"
          type="text"
          placeholder="Your education (e.g. BSc Computer Science)"
          value={formData.education}
          onChange={handleChange}
          disabled={submitting}
        />
        {validationErrors.education && (
          <div className="text-red-600 text-sm mb-2">
            {validationErrors.education}
          </div>
        )}
      </section>
      {/* Skills */}
      <section className="bg-surface card shadow-xl p-8 rounded-2xl">
        <h2 className="text-xl font-bold font-poppins text-primary mb-6">
          Skills
        </h2>
        <div className="flex gap-2 mb-2">
          <input
            className="input-field bg-input border-input border text-primary text-sm rounded-md px-4 py-3 block w-full"
            type="text"
            placeholder="Add a skill"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            disabled={submitting}
          />
          <button
            type="button"
            className="btn-primary px-4 py-2 rounded"
            onClick={handleAddSkill}
            disabled={submitting}
          >
            Add
          </button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {formData.skills.map((skill, idx) => (
            <li
              key={idx}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"
            >
              {skill}
              <button
                type="button"
                className="text-red-500 text-xs"
                onClick={() => handleRemoveSkill(idx)}
                disabled={submitting}
              >
                x
              </button>
            </li>
          ))}
        </ul>
        {validationErrors.skills && (
          <div className="text-red-600 text-sm mb-2">
            {validationErrors.skills}
          </div>
        )}
      </section>
      {/* Career Goals */}
      <section className="bg-surface card shadow-xl p-8 rounded-2xl">
        <h2 className="text-xl font-bold font-poppins text-primary mb-6">
          Career Goals
        </h2>
        <textarea
          className="input-field w-full p-4 border border-input rounded-md text-secondary bg-background"
          name="careerGoals"
          placeholder="Describe your career goals..."
          rows="4"
          value={formData.careerGoals}
          onChange={handleChange}
          disabled={submitting}
        ></textarea>
        {validationErrors.careerGoals && (
          <div className="text-red-600 text-sm mb-2">
            {validationErrors.careerGoals}
          </div>
        )}
      </section>
      {/* CV Upload */}
      <section className="bg-surface card shadow-xl p-8 rounded-2xl">
        <h2 className="text-xl font-bold font-poppins text-primary mb-6">
          CVs
        </h2>
        <input
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          type="file"
          multiple
          onChange={handleCvsChange}
          disabled={submitting}
        />
        <ul className="mt-2">
          {formData.cvs.map((cv, idx) => {
            // Extract the filename from various formats
            let filename = "CV";

            if (cv.original_filename) {
              filename = cv.original_filename;
            } else if (typeof cv === "string") {
              filename = cv.split(/[/\\]/).pop();
            } else if (typeof cv === "object" && cv.url) {
              filename = decodeURIComponent(
                cv.url.split("/").pop().split("?")[0]
              );
            }

            // Remove numeric prefix if present (e.g., 1752761968918-)
            filename = filename.replace(/^\d+-/, "");

            return (
              <li key={idx} className="flex items-center gap-2">
                {filename}
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => handleRemoveCv(idx)}
                  disabled={submitting}
                >
                  Remove
                </button>
                <a
                  href={cv.url || (typeof cv === "string" ? cv : "#")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View
                </a>
              </li>
            );
          })}
        </ul>
        {validationErrors.cvs && (
          <div className="text-red-600 text-sm mb-2">
            {validationErrors.cvs}
          </div>
        )}
      </section>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary  py-2 px-6 rounded disabled:opacity-50"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : !isRegistered
            ? "Register"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
