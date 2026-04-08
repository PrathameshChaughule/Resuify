import express from 'express'
import { getUserById, getUserResumes, loginUser, registerUser } from '../controllers/userController.js'
import protect from '../middlewares/authMiddleware.js'
import { authLimiter } from '../middlewares/rateLimitMiddleware.js'


const userRouter = express.Router()

userRouter.post('/register', authLimiter, registerUser)
userRouter.post('/login', authLimiter, loginUser)
userRouter.get('/data', protect, authLimiter, getUserById)
userRouter.get('/resumes', protect, authLimiter, getUserResumes)

export default userRouter