import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

/**
 * Middleware untuk mengautentikasi request menggunakan API Token statis.
 * 
 * Client mengirimkan token melalui header:
 *   Authorization: Bearer <raw_api_token>
 * 
 * Middleware ini akan:
 * 1. Membaca token dari header Authorization.
 * 2. Mencari semua API Token ACTIVE yang belum expired.
 * 3. Membandingkan raw token dengan hash yang tersimpan di database (bcrypt).
 * 4. Jika cocok, meng-attach data token ke `req.apiToken` lalu lanjut ke next().
 * 5. Jika tidak cocok atau expired/revoked, mengembalikan 401/403.
 */

// Extend Express Request untuk menambahkan properti apiToken
declare global {
    namespace Express {
        interface Request {
            apiToken?: {
                id: string;
                organizationId: string;
                name: string;
                accessScope: string;
            };
        }
    }
}

export async function apiTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'API Token is required. Use header: Authorization: Bearer <your_token>',
            });
        }

        const rawToken = authHeader.split(' ')[1];

        if (!rawToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use: Bearer <your_token>',
            });
        }

        // Ambil semua token yang masih ACTIVE dan belum expired
        const activeTokens = await prisma.apiToken.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
            },
            include: {
                permissions: true,
            },
        });

        // Cari token yang cocok dengan bcrypt compare
        let matchedToken = null;
        for (const token of activeTokens) {
            const isMatch = await bcrypt.compare(rawToken, token.token);
            if (isMatch) {
                matchedToken = token;
                break;
            }
        }

        if (!matchedToken) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired API token',
            });
        }

        // Update lastUsedAt
        await prisma.apiToken.update({
            where: { id: matchedToken.id },
            data: { lastUsedAt: new Date() },
        });

        // Attach token data ke request
        req.apiToken = {
            id: matchedToken.id,
            organizationId: matchedToken.organizationId,
            name: matchedToken.name,
            accessScope: matchedToken.accessScope,
        };

        next();
    } catch (error) {
        console.error('API Token auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during API token authentication',
        });
    }
}