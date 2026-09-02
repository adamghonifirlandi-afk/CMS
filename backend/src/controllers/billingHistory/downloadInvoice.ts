import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const downloadInvoice = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { organizationId, invoiceId } = req.params;

        // mengecek akses ke organization
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                members: {
                    where: { userId, status: 'ACTIVE' },
                },
            },
        });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }

        const isOwner = organization.ownerId === userId;
        const isMember = organization.members.length > 0;

        if (!isOwner && !isMember) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this organization',
            });
        }

        // get billing history
        const billingHistory = await prisma.billingHistory.findUnique({
            where: { id: invoiceId },
            include: {
                subscription: {
                    include: {
                        plan: true,
                        organization: true,
                    },
                },
            },
        });

        if (!billingHistory || billingHistory.subscription.organizationId !== organizationId) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        // jika invoiceUrl sudah ada, maka redirect
        if (billingHistory.invoiceUrl) {
            return res.status(200).json({
                success: true,
                message: 'Invoice URL retrieved successfully',
                data: {
                    invoiceUrl: billingHistory.invoiceUrl,
                },
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Invoice generation in progress',
            data: {
                invoiceNumber: billingHistory.invoiceNumber,
                // invoiceUrl akan di-generate async
            },
        });
    } catch (error: any) {
        console.error('Error downloading invoice:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to download invoice',
            error: error.message,
        });
    }
};