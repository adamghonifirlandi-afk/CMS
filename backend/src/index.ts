import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import collaboratorRoutes from "./routes/collaborator.routes";
import projectRoutes from "./routes/project.routes";
import projectCollaboratorRoutes from "./routes/projectCollaborator.routes";
import planRoutes from "./routes/plan.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import billingAddressRoutes from "./routes/billingAddress.routes";
import paymentMethodRoutes from "./routes/paymentMethod.routes";
import billingHistoryRoutes from "./routes/billingHistory.routes";
import usageRoutes from "./routes/usage.routes";
import webhookRoutes from "./routes/webhook.routes";
import contentBuilderRoutes from "./routes/contentBuilder.routes";
import contentManagementRoutes from "./routes/contentManagement.routes";
import mediaManagementRoutes from "./routes/mediaManagement.routes";
import mediaAssetRoutes from "./routes/mediaAsset.routes";
import mediaFolderRoutes from "./routes/mediaFolder.routes";
import apiTokenRoutes from "./routes/apiToken.routes";
import workflowRoutes from "./routes/workflow.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const defaultOrigins = ["http://localhost:3000"];
const allowedOrigins = (process.env.FRONTEND_URL || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/collaborators", collaboratorRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/project-collaborators", projectCollaboratorRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/billing-addresses", billingAddressRoutes);
app.use("/api/v1/payment-methods", paymentMethodRoutes);
app.use("/api/v1/billing-history", billingHistoryRoutes);
app.use("/api/v1/usage", usageRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/content-builder", contentBuilderRoutes);
app.use("/api/v1/content-management", contentManagementRoutes);
app.use("/api/v1/media-management", mediaManagementRoutes);
app.use("/api/v1/media-assets", mediaAssetRoutes);
app.use("/api/v1/media-folders", mediaFolderRoutes);
app.use("/api/v1/api-tokens", apiTokenRoutes);
app.use("/api/v1/workflow", workflowRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
