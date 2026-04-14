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





// checkAts functions

const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
  "by", "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each",
  "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here",
  "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it",
  "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now",
  "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out",
  "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the",
  "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
  "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
  "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would",
  "you", "your", "yours", "yourself", "yourselves"
]);

const WEAK_WORDS = new Set([
  "build", "builds", "building", "create", "creates", "created",
  "work", "worked", "working", "use", "using", "used",
  "good", "great", "high", "low", "best", "better",
  "responsible", "responsibilities", "role", "job",
  "ensure", "ensuring", "help", "helped", "support", "supported",
  "knowledge", "understanding", "familiar", "ability"
]);

const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractKeywords = (jd) => {
  const cleaned = cleanText(jd);

  const words = cleaned.split(" ");

  const filtered = words.filter(word =>
    word.length > 3 &&
    !STOPWORDS.has(word) &&
    !WEAK_WORDS.has(word) &&
    isNaN(word)
  );

  // remove duplicates
  return [...new Set(filtered)];
};

const getResumeText = (resume) => {
  return cleanText(`
    ${resume.summary || ""}
    ${resume.experience || ""}
    ${resume.projects || ""}
    ${resume.skills || ""}
    ${resume.education || ""}
  `);
};

const matchKeywords = (resumeText, keywords) => {
  const matched = [];
  const missing = [];

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i"); // exact match
    if (regex.test(resumeText)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  return { matched, missing };
};

const calculateATSScore = (resume, matchedSkills, totalSkills) => {

  // 🔹 Skill Score (40%)
  const skillScore = totalSkills > 0
    ? (matchedSkills.length / totalSkills) * 40
    : 0;

  // 🔹 Section Score (15%)
  let sectionScore = 0;
  if (resume.summary) sectionScore += 5;
  if (resume.experience) sectionScore += 5;
  if (resume.projects) sectionScore += 5;

  // 🔹 Content Score (25%)
  const contentLength = JSON.stringify(resume).length;
  let contentScore = 10;
  if (contentLength > 800) contentScore = 25;
  else if (contentLength > 400) contentScore = 18;

  // 🔹 General Keyword Score (10%)
  const keywordScore = 10; // keep simple or optional

  // 🔹 Formatting Score (10%)
  const formattingScore = 10;

  const totalScore =
    skillScore +
    sectionScore +
    contentScore +
    keywordScore +
    formattingScore;

  return Math.round(totalScore);
};

export const IMPORTANT_SKILLS = [
  // frontend
  "react", "nextjs", "vue", "angular", "svelte", "html", "css", "scss", "sass", "tailwind", "bootstrap", "javascript", "typescript", "redux", "zustand", "vite", "webpack",

  // backend
  "node", "express", "nestjs", "django", "flask", "spring", "springboot", "php", "laravel", "ruby", "rails", "dotnet", "fastapi",

  // database
  "mongodb", "mysql", "postgresql", "sqlite", "redis", "cassandra", "dynamodb", "firebase", "supabase", "oracle",

  // devops
  "aws", "azure", "gcp", "docker", "kubernetes", "nginx", "ci", "cd", "githubactions", "gitlabci", "jenkins", "terraform", "ansible", "cloudflare",

  // api
  "api", "rest", "graphql", "grpc", "websocket", "oauth", "jwt",

  // testing
  "jest", "mocha", "chai", "cypress", "playwright", "selenium",

  // tools
  "git", "github", "gitlab", "bitbucket", "postman", "swagger", "jira", "figma", "notion",

  // mobile
  "reactnative", "flutter", "android", "ios", "swift", "kotlin",

  // ai/data
  "python", "pandas", "numpy", "tensorflow", "pytorch", "machinelearning", "deeplearning", "nlp", "opencv",

  // security
  "authentication", "authorization", "bcrypt", "ssl", "https",

  // architecture
  "microservices", "monolith", "restful", "scalable", "performance", "optimization", "caching", "loadbalancing"
];

const normalize = (word) => {
  const map = {
    html5: "html",
    css3: "css",
    js: "javascript",
    ts: "typescript"
  };
  return map[word] || word;
};

const getSkillKeywords = (words) => {
  return words
    .map(normalize)
    .filter(word => IMPORTANT_SKILLS.includes(word));
};

const rankKeywords = (keywords) => {
  return keywords.map(word => {
    let score = 1;

    // skills already filtered → boost more
    if (IMPORTANT_SKILLS.includes(word)) score += 5;

    // boost important tech patterns
    if (["api", "rest", "graphql"].includes(word)) score += 2;

    return { word, score };
  });
};

const getTopKeywords = (keywords) => {
  return rankKeywords(keywords)
    .sort((a, b) => b.score - a.score)
    .map(item => item.word)
    .slice(0, 10);
};

const processKeywords = (matched, missing) => {
  const matchedSkills = getSkillKeywords(matched);
  const missingSkills = getSkillKeywords(missing);

  return {
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,

    topMatched: getTopKeywords(matchedSkills),
    topMissing: getTopKeywords(missingSkills)
  };
};

const generateSuggestions = (missing) => {
  const suggestions = [];

  if (missing.length > 0) {
    suggestions.push(
      `Add relevant keywords such as: ${missing.slice(0, 5).join(", ")}`
    );
  }

  suggestions.push("Ensure all key sections are properly filled.");
  suggestions.push("Use strong action verbs and measurable achievements.");

  return suggestions;
};




// reusable function for ats check
export const getATSAnalysis = (resumeData, jobDescription) => {
  const keywords = extractKeywords(jobDescription);
  const jdSkills = getSkillKeywords(keywords);

  const resumeText = getResumeText(resumeData);

  const { matched, missing } = matchKeywords(resumeText, jdSkills);

  const score = calculateATSScore(
    resumeData,
    matched,
    jdSkills.length
  );

  return {
    score,

    allMatchedSkills: matched,
    allMissingSkills: missing,

    topMatched: matched.slice(0, 10),
    topMissing: missing.slice(0, 10),

    matchedCount: matched.length,
    missingCount: missing.length,

    suggestions: generateSuggestions(missing.slice(0, 10))
  };
};


// ats score check
// POST: api/ai/ats-score-checker
export const checkATS = (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    const result = getATSAnalysis(resumeData, jobDescription);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "ATS check failed",
      error: error.message
    });
  }
};




const rankSkills = (skills) => {
  return skills.map(skill => {
    let score = 1;

    if (["react", "node", "mongodb", "express"].includes(skill)) score += 5;
    if (["aws", "docker", "kubernetes"].includes(skill)) score += 4;
    if (["webpack", "sass", "redux"].includes(skill)) score += 3;
    if (["api", "rest", "graphql"].includes(skill)) score += 2;

    return { skill, score };
  });
};

const getTopSkillsForAI = (skills) => {
  return rankSkills(skills)
    .sort((a, b) => b.score - a.score)
    .map(item => item.skill)
    .slice(0, 20);
};

// controller for uploading a resume to the database
// POST: /api/ai/ats-resume
export const uploadAtsJobDescription = async (req, res) => {
  try {
    const { data, description } = req.body
    if (!data || !description) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const beforeATS = getATSAnalysis(data, description);

    const missingSkills = getTopSkillsForAI(beforeATS.allMissingSkills)

    const systemPrompt = `
              You are an expert AI assistant for optimizing resumes based on ATS (Applicant Tracking System) analysis.

              Your role is NOT to rewrite the entire resume blindly.
              Your goal is to improve the resume by addressing specific missing skills and keywords.

              STRICT RULES:

              1. Do NOT invent any experience, projects, tools, or skills that are not realistic.
              2. Only enhance or slightly modify existing content.
              3. Integrate missing skills naturally into:
                - professional_summary
                - skills
                - experience descriptions
                - project descriptions
              4. Do NOT force all missing skills if they do not logically fit.
              5. Keep all dates unchanged and in ISO format.
              6. Maintain original structure of JSON strictly (no adding/removing fields).
              7. Keep content concise, professional, and action-oriented.
              8. Prefer strong action verbs and measurable outcomes where possible.
              9. Prioritize technical skills over generic wording.
              10. Do NOT add explanations, comments, or extra text.

              IMPORTANT:
              - This is NOT content generation.
              - This is targeted optimization based on ATS gaps.

              Return ONLY valid JSON.
              `;

    const userPrompt = `
                Task:
                Improve the resume based on missing ATS keywords.

                Rules:
                - Only improve content using provided missing skills
                - Do NOT add fake experience
                - Keep content realistic and concise

                Focus:

                1. professional_summary:
                - Include missing skills naturally

                2. skills:
                - Add missing technical skills (only relevant ones)

                3. experience & projects:
                - Integrate missing skills naturally into descriptions
                - Use measurable achievements where possible

                Input:
                Resume:
                ${JSON.stringify(data)}

                Missing Skills:
                ${JSON.stringify(missingSkills)}

                Job Description:
                ${JSON.stringify(description)}

                Output:
                Return ONLY updated resume JSON
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
    const updatedResume = JSON.parse(extractedData)
    const afterATS = getATSAnalysis(updatedResume, description);
    res.json({
      updatedResume,

      before: {
        score: beforeATS.score,
        matchedSkills: beforeATS.topMatched,
        missingSkills: beforeATS.topMissing
      },

      after: {
        score: afterATS.score,
        matchedSkills: afterATS.topMatched,
        missingSkills: afterATS.topMissing
      }
    });
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

