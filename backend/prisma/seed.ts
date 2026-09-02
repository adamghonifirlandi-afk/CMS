import dotenv from "dotenv";
import {
  PrismaClient,
  ProjectRole,
  ProjectStatus,
  Role,
  Status,
} from "../src/generated";
import bcrypt from "bcrypt";

dotenv.config();

const prisma = new PrismaClient();

const DEMO_ORG_ID = "org_demo_portfolio";
const DEMO_PROJECT_ID = "project_demo_portfolio";
const DEMO_SINGLE_PAGE_ID = "sp_demo_homepage";
const DEMO_MULTIPLE_PAGE_ID = "mp_demo_blog";
const DEMO_WORKFLOW_ID = "wf_demo_approval";

async function seedPlans() {
  console.log("Seeding plans...");

  const plans = [
    {
      id: "plan_free_demo",
      name: "Free / Demo",
      description: "Suitable for individuals to demo and explore cmlabs CMS",
      price: 0,
      billingCycle: "MONTHLY" as const,
      features: {
        users: 1,
        personalProjects: 5,
        apiCalls: "500K / month",
        mediaAssets: "100 file",
        seoIntegrated: true,
      },
      limits: {
        users: 1,
        projects: 5,
        apiCalls: 500000,
        mediaAssets: 100,
        bandwidth: 1,
        collaborators: 0,
        webhooks: 0,
        models: 3,
        locales: 1,
        records: 100,
      },
    },
    {
      id: "plan_professional",
      name: "Professional",
      description: "Ideal for growing teams with full access only granted to pro users.",
      price: 100000,
      billingCycle: "MONTHLY" as const,
      features: {
        users: "10 User for organization (must Pro)",
        personalProjects: "50 Personal Projects",
        organizations: "10 Organization (20 Projects)",
        apiCalls: "5 Million / month",
        mediaAssets: "5000 file",
        seoIntegrated: true,
        aiAssistance: true,
        customDomain: true,
      },
      limits: {
        users: 10,
        projects: 50,
        organizations: 10,
        projectsPerOrganization: 20,
        apiCalls: 5000000,
        mediaAssets: 5000,
        bandwidth: 10,
        collaborators: 10,
        webhooks: 5,
        models: 20,
        locales: 5,
        records: 5000,
      },
    },
    {
      id: "plan_enterprise",
      name: "Enterprise",
      description: "Suitable for companies needing scalability, advanced features, and smooth collaboration.",
      price: 500000,
      billingCycle: "MONTHLY" as const,
      features: {
        users: "50 User for organization (all users)",
        personalProjects: "Unlimited Personal Projects",
        organizations: "50 Organization (100 Projects)",
        apiCalls: "10 Million / month",
        mediaAssets: "unlimited file",
        seoIntegrated: true,
        aiAssistance: true,
        customDomain: true,
      },
      limits: {
        users: 50,
        projects: -1,
        organizations: 50,
        projectsPerOrganization: 100,
        apiCalls: 10000000,
        mediaAssets: -1,
        bandwidth: 100,
        collaborators: 50,
        webhooks: 20,
        models: -1,
        locales: -1,
        records: -1,
      },
    },
    {
      id: "plan_white_label",
      name: "White Label",
      description: "Take full ownership of the CMS platform, deploy it under your infrastructure, with your own branding and configurations.",
      price: 2000000,
      billingCycle: "YEARLY" as const,
      features: {
        fullSourceCodeAccess: true,
        fullyConfigurableModules: true,
        customBrand: true,
        cmsOwnership: true,
        lifetimeLicence: true,
      },
      limits: {
        users: -1,
        projects: -1,
        organizations: -1,
        projectsPerOrganization: -1,
        apiCalls: -1,
        mediaAssets: -1,
        bandwidth: -1,
        collaborators: -1,
        webhooks: -1,
        models: -1,
        locales: -1,
        records: -1,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      create: { ...plan, isActive: true },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features,
        limits: plan.limits,
        isActive: true,
      },
    });
    console.log(`Plan ready: ${plan.name}`);
  }
}

async function seedDemoData() {
  const demoEmail = process.env.DEMO_USER_EMAIL || "demo@example.com";
  const demoPassword = process.env.DEMO_USER_PASSWORD;

  if (!demoPassword) {
    console.log(
      "Skipping demo user seed — set DEMO_USER_PASSWORD to create demo account."
    );
    return;
  }

  console.log("Seeding demo account and sample CMS data...");

  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      fullName: "Demo User",
      email: demoEmail,
      company: "Demo Company",
      job: "Content Manager",
      country: "Indonesia",
      password: hashedPassword,
    },
    update: {
      fullName: "Demo User",
      company: "Demo Company",
      job: "Content Manager",
      country: "Indonesia",
      password: hashedPassword,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    create: {
      id: DEMO_ORG_ID,
      name: "Demo Organization",
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: Role.OWNER,
          status: Status.ACTIVE,
          joinedAt: new Date(),
        },
      },
    },
    update: {
      name: "Demo Organization",
      ownerId: demoUser.id,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: demoUser.id,
      },
    },
    create: {
      organizationId: organization.id,
      userId: demoUser.id,
      role: Role.OWNER,
      status: Status.ACTIVE,
      joinedAt: new Date(),
    },
    update: {
      role: Role.OWNER,
      status: Status.ACTIVE,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: DEMO_PROJECT_ID },
    create: {
      id: DEMO_PROJECT_ID,
      name: "Portfolio Demo Site",
      description: "Sample project with homepage and blog content for live demo.",
      organizationId: organization.id,
      createdBy: demoUser.id,
      status: ProjectStatus.ACTIVE,
      collaborators: {
        create: {
          userId: demoUser.id,
          role: ProjectRole.OWNER,
          status: Status.ACTIVE,
          addedAt: new Date(),
        },
      },
    },
    update: {
      name: "Portfolio Demo Site",
      description: "Sample project with homepage and blog content for live demo.",
      organizationId: organization.id,
      createdBy: demoUser.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  await prisma.projectCollaborator.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: demoUser.id,
      },
    },
    create: {
      projectId: project.id,
      userId: demoUser.id,
      role: ProjectRole.OWNER,
      status: Status.ACTIVE,
      addedAt: new Date(),
    },
    update: {
      role: ProjectRole.OWNER,
      status: Status.ACTIVE,
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { id: "sub_demo_portfolio" },
    create: {
      id: "sub_demo_portfolio",
      organizationId: organization.id,
      planId: "plan_free_demo",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: null,
      autoRenew: true,
    },
    update: {
      planId: "plan_free_demo",
      status: "ACTIVE",
    },
  });

  await prisma.usageTracking.upsert({
    where: { id: "usage_demo_portfolio" },
    create: {
      id: "usage_demo_portfolio",
      subscriptionId: subscription.id,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      projectsUsed: 1,
      mediaAssetsUsed: 0,
      apiCallsUsed: 0,
    },
    update: {
      projectsUsed: 1,
    },
  });

  const singlePage = await prisma.singlePage.upsert({
    where: { id: DEMO_SINGLE_PAGE_ID },
    create: {
      id: DEMO_SINGLE_PAGE_ID,
      projectId: project.id,
      name: "Homepage",
      apiId: "homepage",
      seoEnabled: true,
      workflowEnabled: true,
      published: true,
    },
    update: {
      name: "Homepage",
      published: true,
    },
  });

  await prisma.singlePageContent.upsert({
    where: { singlePageId: singlePage.id },
    create: {
      singlePageId: singlePage.id,
      locale: "en",
      data: {
        title: "Welcome to CMS Demo",
        subtitle: "Explore content management, workflows, and projects.",
        cta: "Get Started",
      },
    },
    update: {
      data: {
        title: "Welcome to CMS Demo",
        subtitle: "Explore content management, workflows, and projects.",
        cta: "Get Started",
      },
    },
  });

  const multiplePage = await prisma.multiplePage.upsert({
    where: { id: DEMO_MULTIPLE_PAGE_ID },
    create: {
      id: DEMO_MULTIPLE_PAGE_ID,
      projectId: project.id,
      name: "Blog Posts",
      apiId: "blog-posts",
      seoEnabled: true,
      workflowEnabled: true,
      published: true,
    },
    update: {
      name: "Blog Posts",
      published: true,
    },
  });

  const existingEntry = await prisma.multiplePageEntry.findFirst({
    where: { multiplePageId: multiplePage.id },
  });

  if (!existingEntry) {
    await prisma.multiplePageEntry.create({
      data: {
        multiplePageId: multiplePage.id,
        locale: "en",
        published: true,
        data: {
          title: "Hello from the Live Demo",
          excerpt: "This is sample blog content seeded for portfolio visitors.",
          body: "Recruiters can browse organizations, projects, and content models without local setup.",
        },
      },
    });
  }

  await prisma.workflow.upsert({
    where: { id: DEMO_WORKFLOW_ID },
    create: {
      id: DEMO_WORKFLOW_ID,
      organizationId: organization.id,
      name: "Content Approval",
      relatedTo: "Content Management",
      keyApprovalStage: "Review",
      stages: {
        create: [
          { name: "Draft", order: 0, highlightColor: "#9E9E9E", rolesAllowed: ["OWNER", "EDITOR"] },
          { name: "Review", order: 1, highlightColor: "#FF9800", rolesAllowed: ["OWNER", "EDITOR"] },
          { name: "Published", order: 2, highlightColor: "#4CAF50", rolesAllowed: ["OWNER"] },
        ],
      },
    },
    update: {
      name: "Content Approval",
      relatedTo: "Content Management",
      keyApprovalStage: "Review",
    },
  });

  console.log(`Demo user ready: ${demoEmail}`);
  console.log(`Demo organization: ${organization.name}`);
  console.log(`Demo project: ${project.name}`);
}

async function main() {
  await seedPlans();
  await seedDemoData();
  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
