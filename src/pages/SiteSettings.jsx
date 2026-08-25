import { useEffect, useState } from "react";
import { Image, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { siteAPI, assetUrl } from "../api";

const emptySlide = {
  schoolName: "",
  motto: "",
  intro: "",
  yearsOfExcellence: "",
  heroImage: "",
};

const SiteSettings = () => {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptySlide);
  const [editingId, setEditingId] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSlides = async () => {
    try {
      const response = await siteAPI.get();
      setSlides(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load Hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const startAdd = () => {
    setEditingId(null);
    setForm(emptySlide);
    setHeroFile(null);
  };
  const startEdit = (slide) => {
    setEditingId(slide.id);
    setForm(slide);
    setHeroFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        const val = value || "";
        // Do not resend a stored base64 photo (huge string) or an empty value
        // back to the server for heroImage; the API preserves the existing image.
        if (key === "heroImage" && (val === "" || val.startsWith("data:")))
          return;
        payload.append(key, val);
      });
      if (heroFile) payload.set("heroImage", heroFile);
      if (editingId) await siteAPI.update(editingId, payload);
      else await siteAPI.create(payload);
      setMessage(
        editingId
          ? "Hero slide updated successfully"
          : "Hero slide added successfully",
      );
      startAdd();
      await loadSlides();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save Hero slide");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Hero slide?")) return;
    try {
      await siteAPI.delete(id);
      setMessage("Hero slide deleted successfully");
      if (editingId === id) startAdd();
      await loadSlides();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not delete Hero slide",
      );
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-500">
        Loading Hero slides...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage up to 4 Hero slides shown on the user frontend.
          </p>
        </div>
        {/* <button
          type="button"
          className="btn-primary"
          onClick={startAdd}
          disabled={slides.length >= 4}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Hero
        </button> */}
      </div>
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className="card p-4 space-y-3">
            <div className="h-32 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {slide.heroImage ? (
                <img
                  src={
                    slide.heroImage.startsWith("data:") ||
                    slide.heroImage.startsWith("http")
                      ? slide.heroImage
                      : assetUrl(slide.heroImage)
                  }
                  alt={slide.schoolName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div>
              <h2 className="font-semibold truncate">{slide.schoolName}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">
                {slide.motto}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => startEdit(slide)}
              >
                <Pencil className="w-4 h-4 mr-1" /> Update
              </button>
              <button
                type="button"
                className="btn-danger px-3"
                onClick={() => handleDelete(slide.id)}
                aria-label="Delete Hero"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-4xl">
        <h2 className="font-semibold">
          {editingId ? "Update Hero Slide" : "Add New Hero Slide"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">School Name *</label>
            <input
              name="schoolName"
              className="input"
              value={form.schoolName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="label">Years of Excellence *</label>
            <input
              name="yearsOfExcellence"
              className="input"
              value={form.yearsOfExcellence}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Motto *</label>
          <input
            name="motto"
            className="input"
            value={form.motto}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Introduction *</label>
          <textarea
            name="intro"
            className="input"
            rows="3"
            value={form.intro}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Hero Photo</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="input mb-2"
            onChange={(event) => setHeroFile(event.target.files[0] || null)}
          />
          <input
            name="heroImage"
            className="input"
            value={
              form.heroImage && form.heroImage.startsWith("data:")
                ? ""
                : form.heroImage || ""
            }
            onChange={handleChange}
            placeholder="Optional external URL (or pick a file above)"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={startAdd}>
            Clear
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? "Saving..." : editingId ? "Update Hero" : "Add Hero"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
