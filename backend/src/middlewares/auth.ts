import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../utils/jwt";

interface JwtPayload {
  id: number;
  fullName: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: "Access token required" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
    next();
    
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ 
        success: false,
        message: "Token has expired" 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
}