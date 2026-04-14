import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import { checkATS, enhanceJobDescription, enhanceProfessionalSummary, uploadAtsJobDescription, uploadResume } from '../controllers/aiController.js'
import { aiLimiter } from '../middlewares/rateLimitMiddleware.js'

const aiRouter = express.Router()

aiRouter.use(protect)
aiRouter.use(aiLimiter)

aiRouter.post('/enhance-pro-sum', enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', enhanceJobDescription)
aiRouter.post('/upload-resume', uploadResume)
aiRouter.post('/ats-resume', uploadAtsJobDescription)
aiRouter.post('/ats-score-checker', checkATS)

export default aiRouter