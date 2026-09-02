import { Router } from "express";
import { 
    register, 
    login, 
    profile, 
    forgotPassword, 
    verifyResetToken, 
    resetPassword 
} from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth";
import { getCountries } from "../controllers/auth/country";
import multer from "multer";


const upload = multer();
const router = Router();

// auth routes
router.post("/register", upload.none(), register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);

// forgot password routes
router.post("/forgot-password", upload.none(), forgotPassword);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", upload.none(), resetPassword);

// utility routes
router.get("/", getCountries);

export default router;