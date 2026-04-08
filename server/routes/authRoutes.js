import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import protect from '../middlewares/authMiddleware.js'
import User from "../models/User.js"

const authRouter = express.Router()

//Step-1: Redirect to Google login
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

authRouter.get("/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        try {
            const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
            res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`)
        } catch (error) {
            console.error("Google login error:", error)
            res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`)
        }
    }
)

authRouter.get("/me", protect, async (req, res) => {
    try {
            const userId = req.user;
            console.log(userId)
            // user exists
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ success: true, message: "User not found" })
            }
    
            user.password = undefined
            return res.status(200).json({ success: true, user: user })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
})

export default authRouter