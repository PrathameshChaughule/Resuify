import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from '../controllers/resumeController.js'
import upload from '../configs/multer.js'
import { generalLimiter } from '../middlewares/rateLimitMiddleware.js'

const resumeRouter = express.Router()

resumeRouter.post('/create', protect, generalLimiter, createResume)
resumeRouter.put('/update', upload.single('image'), protect, generalLimiter, updateResume)
resumeRouter.delete('/delete/:resumeId', protect, generalLimiter, deleteResume) ;
resumeRouter.get('/get/:resumeId', protect, generalLimiter, getResumeById);
resumeRouter.get('/public/:resumeId', protect, generalLimiter, getPublicResumeById);

export default resumeRouter

