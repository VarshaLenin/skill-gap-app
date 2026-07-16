import io
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app as backend_app


class AnalyzeAllRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = backend_app.app.test_client()

    @patch("app.call_gemini_json")
    @patch("app.extract_text")
    def test_analyze_all_uses_one_gemini_call_and_returns_both_results(self, mock_extract_text, mock_call_gemini_json):
        mock_extract_text.return_value = "Resume text"
        mock_call_gemini_json.return_value = {
            "skillGap": {
                "matchedSkills": [{"skill": "Python", "requirement": "Required"}],
                "missingSkills": [],
                "jdSkills": [{"skill": "Python", "requirement": "Required"}],
                "resumeSkills": ["Python"],
                "transferableNotes": [],
            },
            "fitVerdict": {
                "verdict": "Qualified",
                "reasons": ["Strong Python background."],
                "resumeSkills": ["Python"],
                "jdSkills": [{"skill": "Python", "requirement": "Required"}],
            },
        }

        response = self.client.post(
            "/api/analyze-all",
            data={
                "jd": "Python developer",
                "resume": (io.BytesIO(b"resume content"), "resume.txt"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_call_gemini_json.call_count, 1)

        payload = response.get_json()
        self.assertIn("skillGap", payload)
        self.assertIn("fitVerdict", payload)
        self.assertEqual(payload["skillGap"]["matchedSkills"][0]["skill"], "Python")
        self.assertEqual(payload["fitVerdict"]["verdict"], "Qualified")


if __name__ == "__main__":
    unittest.main()
