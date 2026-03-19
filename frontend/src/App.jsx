import { useState } from "react";
import { compareImages } from "./api/compareApi";

export default function App() {
  const [baseline, setBaseline] = useState(null);
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async () => {
    if (!baseline || !current) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const data = await compareImages(baseline, current);
      setResult(data.new_items);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#2f2f2f] rounded-2xl shadow-lg p-6 space-y-6">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center">
          AI Room Compare Application
        </h1>

        {/* Upload */}
        <div className="space-y-4">

          {/* Before */}
          <div>
            <label className="block text-sm mb-1 text-gray-400">
              Before Image
            </label>

            <label className="block w-full bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg p-2 cursor-pointer text-sm text-gray-300">
              {baseline ? baseline.name : "Upload image"}
              <input
                type="file"
                onChange={(e) => setBaseline(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* After */}
          <div>
            <label className="block text-sm mb-1 text-gray-400">
              After Image
            </label>

            <label className="block w-full bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg p-2 cursor-pointer text-sm text-gray-300">
              {current ? current.name : "Upload image"}
              <input
                type="file"
                onChange={(e) => setCurrent(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !baseline || !current}
          className={`w-full py-2 rounded-lg font-medium transition ${
            loading || !baseline || !current
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {loading ? "Comparing..." : "Compare"}
        </button>

        {/* Spinner */}
        {loading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Result */}
        {hasSearched && !loading && (
          <div>
            <h2 className="text-lg mb-2">New Items:</h2>

            {result.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No new items found
              </p>
            ) : (
              <ul className="space-y-2">
                {result.map((item, i) => (
                  <li
                    key={i}
                    className="bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg px-3 py-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </div>
  );
}