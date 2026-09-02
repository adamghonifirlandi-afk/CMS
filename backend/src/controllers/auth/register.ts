import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";

export async function register(req: Request, res: Response) {
    const { fullName, email, company, job, country, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Full name, email, and password are required",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                company: company || "",
                job: job || "",
                country: country || "",
                password: hashedPassword,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                job: true,
                country: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: user,
        });
    } catch {
        res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }
}
