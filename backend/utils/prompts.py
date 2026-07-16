"""Prompt templates for Assignment 1 (Skill Gap) and Assignment 2 (Fit Verdict)."""


def build_combined_analysis_prompt(resume_text: str, jd_text: str) -> str:
    """Return both skill-gap and fit-verdict analyses in one Gemini response."""
    return f"""You are an expert technical recruiter. Analyze the RESUME against the JOB DESCRIPTION and return BOTH analyses in one JSON object.

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no extra commentary:

{{
  "skillGap": {{
    "resumeSkills": string[],
    "jdSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
    "matchedSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
    "missingSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
    "transferableNotes": string[]
  }},
  "fitVerdict": {{
    "verdict": "Qualified" | "Almost There" | "Not Yet",
    "reasons": [string, string, string],
    "resumeSkills": string[],
    "jdSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ]
  }}
}}

Rules:
- For skillGap, extract distinct technical/professional skills, tools, languages, and frameworks from the resume and JD, then compare them.
- For fitVerdict, choose exactly one verdict and provide exactly 3 concise reasons that mention specific matched strengths and/or specific gaps by name.
- For both analyses, use the same normalized skill names across resumeSkills/jdSkills/matchedSkills/missingSkills.
- Use requirement values of "Required" or "Preferred" based on JD phrasing; default to "Required" if unclear.

RESUME:
\"\"\"
{resume_text}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{jd_text}
\"\"\"
"""


def build_skill_gap_prompt(resume_text: str, jd_text: str) -> str:
    """
    Design choice (Option C, hybrid): the model extracts skills and determines
    matchedSkills / missingSkills, but the headline matchPercentage is computed
    deterministically in Python (matched / total JD skills) so the number is
    auditable and reproducible. Every JD skill (and by extension every matched/
    missing skill) carries a "requirement" tag of Required or Preferred, based
    on how it's phrased in the JD itself -- this is the single source of truth
    for prioritization; there is no separate model-inferred importance tier.
    """
    return f"""You are an expert technical recruiter. Extract skills/technologies from the RESUME and JOB DESCRIPTION below, then compare them.

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no extra commentary:

{{
  "resumeSkills": string[],
  "jdSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
  "matchedSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
  "missingSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ],
  "transferableNotes": string[]
}}

Rules:
- "resumeSkills": distinct technical/professional skills, tools, languages, and frameworks found in the resume.
- "jdSkills": distinct technical/professional skills, tools, languages, and frameworks mentioned in the job description. For EACH one, set "requirement" based on how it is phrased in the JD text: language like "required", "must-have", "must have experience with", or skills listed under a "Requirements" heading -> "Required". Language like "preferred", "nice to have", "bonus", "a plus", or skills listed under a "Preferred"/"Nice to Have" heading -> "Preferred". If the JD gives no signal either way, default to "Required" (most unqualified JD bullet points describe core expectations).
- "matchedSkills": every entry from jdSkills that also appears in resumeSkills (treat clear synonyms as a match, e.g. "JS" matches "JavaScript"), carrying the same "requirement" value it had in jdSkills.
- "missingSkills": every entry from jdSkills NOT present (and with no clear synonym) in resumeSkills, carrying the same "requirement" value it had in jdSkills.
- "transferableNotes": 0 to 3 short notes about resume skills that are related/adjacent to a missing JD skill (e.g. "Candidate has Vue.js experience, which offers some transferable value toward the missing React requirement."). Leave empty array if none apply. Do NOT invent connections that aren't reasonably justified.
- Do not include duplicate skills. Normalize casing/naming sensibly (e.g. "react.js" and "React" should be treated as the same skill), and use the same normalized name consistently across resumeSkills, jdSkills, matchedSkills, and missingSkills so matches are easy to reconcile.

RESUME:
\"\"\"
{resume_text}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{jd_text}
\"\"\""""


def build_fit_verdict_prompt(resume_text: str, jd_text: str) -> str:
    return f"""You are an expert technical recruiter giving a hiring verdict on a candidate for a specific role.

Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no extra commentary:

{{
  "verdict": "Qualified" | "Almost There" | "Not Yet",
  "reasons": [string, string, string],
  "resumeSkills": string[],
  "jdSkills": [ {{ "skill": string, "requirement": "Required" | "Preferred" }} ]
}}

Rules:
- "verdict": choose exactly one of the three values.
  - "Qualified": candidate meets nearly all core requirements.
  - "Almost There": candidate meets most core requirements but has some meaningful gaps.
  - "Not Yet": candidate is missing multiple core requirements or lacks the primary skill set the role needs.
- "reasons": exactly 3 concise reasons (each one short sentence) supporting the verdict. Mention specific matched strengths and/or specific gaps by name (e.g. actual skill names), not generic statements. Weigh gaps in "Required" skills more heavily than gaps in "Preferred" skills when forming the verdict.
- "resumeSkills": distinct technical/professional skills, tools, languages, and frameworks found in the resume.
- "jdSkills": distinct technical/professional skills, tools, languages, and frameworks mentioned in the job description. For EACH one, set "requirement" to "Required" or "Preferred" based on how it's phrased in the JD (see rules in the skill-gap analysis); default to "Required" if unclear.

RESUME:
\"\"\"
{resume_text}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{jd_text}
\"\"\""""