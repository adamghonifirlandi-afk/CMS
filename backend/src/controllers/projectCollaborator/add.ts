import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { AddProjectCollaboratorDTO } from "../../types/project.types";
import { ProjectRole, Status } from "../../generated";

// add collaborator ke project - hanya owner project yang bisa menambahkan
export async function addProjectCollaborator(req: Request, res: Response) {
  try {
    const { projectId, userId: targetUserId, role } = req.body as AddProjectCollaboratorDTO;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (!projectId || !targetUserId || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Project ID, user ID, and role are required" 
      });
    }

    // mengecek apakah current user adalah owner
    const currentUserCollaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        userId: currentUserId,
        role: ProjectRole.OWNER,
        status: Status.ACTIVE,
      },
    });

    if (!currentUserCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Only project owners can add collaborators",
      });
    }

    // mengecek apakah target user ada
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // tidak bisa menambahkan diri sendiri
    if (targetUserId === currentUserId) {
      return res.status(400).json({ 
        success: false,
        message: "You cannot add yourself as a collaborator" 
      });
    }

    // mengecek apakah target user adalah member organisasi
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    const isOrgMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId: targetUserId,
        status: Status.ACTIVE,
      },
    });

    if (!isOrgMember) {
      return res.status(400).json({
        success: false,
        message: "User must be an active organization member first",
      });
    }

    // mengecek apakah user sudah menjadi collaborator
    const existingCollaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        userId: targetUserId,
      },
    });

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator in this project",
      });
    }

    // tambahkan collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: targetUserId,
        role,
        status: Status.ACTIVE,
        addedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            job: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Collaborator added successfully",
      data: collaborator,
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add collaborator" 
    });
  }
}