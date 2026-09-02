import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// create workflow
export async function createWorkflow(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const organizationId = req.params.organizationId;
        const { name, relatedTo, keyApprovalStage, stages } = req.body;

        if (!organizationId || !name || !relatedTo || !keyApprovalStage || !stages) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID, name, relatedTo, keyApprovalStage, and stages are required',
            });
        }

        // validasi akses organisasi
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

        // mengecek akses -> hanya owner dan member aktif yang boleh
        const isOwner = organization.ownerId === userId;
        const isMember = organization.members.length > 0;

        if (!isOwner && !isMember) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this organization',
            });
        }

        // mengecek apakah nama workflow sudah ada atau belum
        const existingWorkflow = await prisma.workflow.findUnique({
            where: {
                organizationId_name: {
                    organizationId,
                    name,
                },
            },
        });

        if (existingWorkflow) {
            return res.status(400).json({
                success: false,
                message: 'Workflow with this name already exists',
            });
        }

        // validasi keyApprovalStage
        const stageNames = stages.map((s: any) => s.name);
        if (!stageNames.includes(keyApprovalStage)) {
            return res.status(400).json({
                success: false,
                message: 'Key Approval Stage must be one of the defined stages',
            });
        }

        // create workflow with stages
        const workflow = await prisma.workflow.create({
            data: {
                organizationId,
                name,
                relatedTo,
                keyApprovalStage,
                stages: {
                    create: stages.map((stage: any, index: number) => ({
                        name: stage.name,
                        order: stage.order !== undefined ? stage.order : index,
                        highlightColor: stage.highlightColor || '#E91E63',
                        rolesAllowed: stage.rolesAllowed || [],
                    })),
                },
            },
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Workflow created successfully',
            data: workflow,
        });
    } catch (error) {
        console.error('Create workflow error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create workflow',
        });
    }
}