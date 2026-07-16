/**
 * Calls the Flask backend's combined analysis endpoint. The resume file and JD
 * text are sent as multipart/form-data; the backend handles text extraction and
 * a single Gemini API call server-side (the API key never touches the browser).
 *
 * @param {File} resumeFile
 * @param {string} jdText
 * @returns {Promise<object>}
 */
export async function analyzeAll(resumeFile, jdText) {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jd", jdText);

  const response = await fetch("/api/analyze-all", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }

  return data;
}
