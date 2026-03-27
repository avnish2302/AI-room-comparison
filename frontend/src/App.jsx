import { useState } from "react";
import { compareImages } from "./api/compareApi";

export default function App() {
  const [baseline, setBaseline] = useState(null)                           // stores "Before image" file
  const [current, setCurrent] = useState(null)                             // stores "After image" file
  const [result, setResult] = useState([])                                 // stores output from backend. Expected : array(data.new_items)
  const [loading, setLoading] = useState(false)                            // controls spinner + button state
  const [hasSearched, setHasSearched] = useState(false)                    // tracks if user clicked "Compare"
  const [error, setError] = useState(null)                                 // stores error message if API fails

  const handleSubmit = async () => {
    if (!baseline || !current) return                                      // STEP 1 : validation. If either image is missing -> stop execution. This prevents unnecessary API calls
    try {
      setLoading(true)                                                     // STEP 2 : show spinner and disable button
      setHasSearched(true)                                                 //          mark that user performed a search
      setError(null)                                                       //          clear previous error

      const data = await compareImages(baseline, current)                  // STEP 3 : sends both images to backend. await pauses execution until response comes
      setResult(data.new_items)                                            // STEP 4 : Store result. Extract new_items from API response. Saves in result state.
    } catch (err) {                                                        // If API fails -> catch error
      console.log(err)
      const message = err.response?.data?.error || "Something went wrong"  // safe access using optional chaining : err.response?.data?.error    if not available : fallback message
      setError(message)                                                    // show error. Clear previous result
      setResult([]);
    } finally {                                                            // always runs (success or error). And stops loading spinner
      setLoading(false);
    }
  }

  const renderResult = () => {
    if (error) {
      return <p classame="text-red-400 text-sm">{error}</p>
    }
    if (result.length === 0) {
      return <p className="text-gray-500 text-sm">No new items found</p>
    }
    return (
      <ul className="space-y-2">
        {result.map((item, i) => (
          <li key={i} className="bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg px-3 py-2">{item}</li>
        ))}
      </ul>
    )
  }

  return (                                                                 // what gets rendered on screen
    <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#2f2f2f] rounded-2xl shadow-lg p-6 space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center">
          Compare Application (Gemini - Text Result)
        </h1>

        {/* Upload */}
        <div className="space-y-4">
        {/* Before */}
          <div>
            <label className="block text-sm mb-1 text-gray-400">
              Before Image
            </label>

            <label className="block w-full bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg p-2 cursor-pointer text-sm text-gray-300">
              {baseline ? baseline.name : "Upload image"}                                         {/* if file selected -> show filename*/}
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
        {hasSearched && !loading && (                                         // show result only if user clicked compare and loading finished
          <div>
            <h2 className="text-lg mb-2">Result:</h2>
            {renderResult()}
          </div>
        )}
      </div>
    </div>
  )
}


