import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body

        if (!userContent) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume.The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives.Make it compelling and ATS-friendly. and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });

        const enhancedContent = response.choices[0].message.content
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}



// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body

        if (!userContent) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Enhance the job description into 2–3 concise lines, each on a new line (no bullet symbols), highlighting key responsibilities and measurable achievements. Use strong action verbs, quantify impact where possible, and ensure ATS-friendly language. Return only the text."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });

        const enhancedContent = response.choices[0].message.content
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}



// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body
        const userId = req.userId

        if (!resumeText) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional
        text before or after **All dates should be converted to ISO 8601 timestamp format (YYYY-MM-DDTHH:mm:ss.sssZ):**:

        {
            professional_summary: { type: String, default: '' },
            skills: [{ type: String }],
            personal_info: {
                image: {type: String, default: '' },
                full_name: {type: String, default: '' },
                profession: {type: String, default: ''},
                email: {type: String, default: ''},
                phone: {type: String, default: ''},
                location: {type: String, default: ''},
                linkedin: {type: String, default: '' },
                website: {type: String, default: '' },
            },
            experience: [
                {
                    company: { type: String },
                    position: { type: String },
                    start_date: { type: String, description: "ISO 8601 timestamp"  },
                    end_date: { type: String, description: "ISO 8601 timestamp"  },
                    description: { type: String },
                    is_current: { type: Boolean },
                }
            ],
            project: [
                {
                    name: { type: String },
                    type: { type: String },
                    description: { type: String },
                }
            ],
            education: [
                {
                    institution: { type: String },
                    degree: { type: String },
                    field: { type: String },
                    graduation_date: { type: String, description: "ISO 8601 timestamp"  },
                    gpa: { type: String },
                }
            ]
        }
        `

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: 'json_object' }
        });

        const extractedData = response.choices[0].message.content
        const parsedData = JSON.parse(extractedData)
        const newResume = await Resume.create({ userId, title, ...parsedData })

        res.json({ resumeId: newResume._id })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


// controller for uploading a resume to the database
// POST: /api/ai/ats-resume
export const uploadAtsJobDescription = async (req, res) => {
    try {
        const { data, description } = req.body
        if (!data || !description) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const systemPrompt = `You are an expert AI assistant for generating ATS-optimized resumes. 
                Your goal is to enhance resumes based on a given job description.
                Follow these rules strictly:

                1. Be factual: do NOT invent experience, skills, projects, or education.
                2. Focus on ATS optimization: match keywords from the job description in all relevant sections.
                3. Keep all dates in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                4. Make the content concise, professional, and action-oriented.
                5. Only return the requested JSON structure; do NOT add extra text.
                6. Highlight measurable impact in experience and project descriptions wherever possible.
                7. Ensure the "profession" field matches the job title in the job description.
                8. Prioritize technical skills and tools from the job description in the "skills" array.
                9. Soft skills are optional but keep technical keywords prominent for ATS.
                10. Do not change the structure of arrays or objects.`

        const userPrompt = `Task:
            - Take the user's resume JSON and the job description.
            - Enhance all relevant sections for ATS-friendliness.
            - Focus on these specific improvements:

            1. professional_summary:
            - Include role title exactly as in job description.
            - Add relevant technical keywords from the job description (e.g., React.js, Redux Toolkit, REST APIs).
            - Keep it concise (3-4 sentences), action-oriented, and recruiter-friendly.

            2. skills:
            - Ensure all technical skills mentioned in the job description are included.
            - Prioritize hard skills over soft skills.
            - Remove duplicates or vague skills; keep them ATS-readable.

            3. personal_info.profession:
            - Match the exact job title from the job description.

            4. experience & project:
            - Add keywords from the job description naturally in descriptions.
            - Emphasize achievements and measurable results.
            - Ensure all dates remain in ISO 8601 format.
            - Keep descriptions concise but impactful.

            Input:
            Resume JSON:
            ${JSON.stringify(data)}

            Job Description:
            ${JSON.stringify(description)}

            Output:
            Return ONLY a JSON object in the same format as the input resume. 
            Do NOT add or remove top-level keys or array structure.
        `

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: 'json_object' }
        });

        const extractedData = response.choices[0].message.content
        const parsedData = JSON.parse(extractedData)
        res.json({ data: {...parsedData} })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}