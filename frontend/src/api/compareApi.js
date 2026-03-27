import axios from "axios";

export async function compareImages(baseline, current) {
  const formData = new FormData();
  formData.append("baseline", baseline);
  formData.append("current", current);

  const res = await axios.post("http://localhost:8080/compare-ai", formData);
  return res.data;
}
