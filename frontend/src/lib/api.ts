import axios, { AxiosHeaders, type AxiosAdapter } from "axios";

const DEMO_TOKEN = "demo-session";
const DEMO_ORG = "org_demo_portfolio";
const DEMO_PROJECT = "project_demo_portfolio";

type DemoState = {
  organizations: Array<{ id: string; name: string; description?: string; }>
  projects: Array<{ id: string; name: string; description: string; status: string; organizationId: string; customDomain?: string | null; }>
  models: Array<{ id: string; name: string; apiId: string; type: string; description: string; _count: { fields: number; entries: number; }; published?: boolean; }>
  entries: Array<{ id: string; multiplePageId: string; data: Record<string, string>; published: boolean; }>
  media: Array<{ id: string; title: string; fileName: string; fileUrl: string; mimeType: string; size: number; }>
  tokens: Array<{ id: string; name: string; tokenPrefix: string; status: string; expiresAt: string; }>
};

const initialDemoState = (): DemoState => ({
  organizations: [{ id: DEMO_ORG, name: "Aeon Nexus", description: "Demo content workspace" }],
  projects: [{ id: DEMO_PROJECT, name: "Portfolio Demo Site", description: "A polished project for exploring the CMS workflow.", status: "ACTIVE", organizationId: DEMO_ORG, customDomain: "portfolio-demo.northstar.dev" }],
  models: [
    { id: "model_homepage", name: "Homepage", apiId: "homepage", type: "SINGLE", description: "The primary landing page.", _count: { fields: 5, entries: 1 }, published: true },
    { id: "model_blog", name: "Blog Posts", apiId: "blog-posts", type: "COLLECTION", description: "Articles and editorial stories.", _count: { fields: 6, entries: 3 }, published: true },
    { id: "model_hero", name: "Hero Section", apiId: "hero-section", type: "COMPONENT", description: "Reusable campaign hero.", _count: { fields: 4, entries: 0 } },
  ],
  entries: [{ id: "entry_welcome", multiplePageId: "model_blog", data: { title: "Hello from the Live Demo", excerpt: "A sample entry for your first workspace tour." }, published: true }],
  media: [{ id: "asset_hero", title: "Hero banner", fileName: "hero-banner.jpg", fileUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80", mimeType: "image/jpeg", size: 248000 }],
  tokens: [],
});

function demoState(): DemoState {
  if (typeof window === "undefined") return initialDemoState();
  const stored = localStorage.getItem("northstar-demo-state");
  if (!stored) return initialDemoState();
  try { return JSON.parse(stored) as DemoState; } catch { return initialDemoState(); }
}

function saveDemoState(state: DemoState) {
  if (typeof window !== "undefined") localStorage.setItem("northstar-demo-state", JSON.stringify(state));
}

function demoResponse(config: { url?: string; method?: string; data?: unknown }) {
  const state = demoState();
  const url = (config.url || "").replace(/^\//, "");
  const method = (config.method || "get").toLowerCase();
  const body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}) as Record<string, unknown>;
  const match = (pattern: RegExp) => url.match(pattern)?.[1];
  let data: unknown = [];

  if (url === "organizations") data = state.organizations;
  else if (url === "projects") data = state.projects;
  else if (match(/^projects\/([^/]+)$/)) data = state.projects.find((item) => item.id === match(/^projects\/([^/]+)$/)) || state.projects[0];
  else if (url.includes("single-pages") && url.endsWith("content")) data = { id: "content_homepage", data: { title: "Welcome to the Live Demo", content: "Explore the Northstar CMS workspace." }, published: true };
  else if (url.includes("single-pages")) data = state.models.filter((item) => item.type === "SINGLE");
  else if (url.includes("multiple-pages") && url.endsWith("entries")) data = state.entries.filter((item) => item.multiplePageId === match(/multiple-pages\/([^/]+)\/entries/));
  else if (url.includes("multiple-pages")) data = state.models.filter((item) => item.type === "COLLECTION");
  else if (url.includes("components")) data = state.models.filter((item) => item.type === "COMPONENT");
  else if (url.includes("media-assets")) data = state.media;
  else if (url.includes("api-tokens")) data = state.tokens;
  else if (url.includes("collaborators")) data = [{ id: "member_demo", name: "Demo User", email: "demo@example.com", role: "OWNER", status: "ACTIVE" }];
  else if (url.includes("workflows")) data = [{ id: "workflow_demo", name: "Content Approval", relatedTo: "Content Management", keyApprovalStage: "Review", stagesCount: 4 }];
  else if (url.includes("plans")) data = [{ id: "plan_free_demo", name: "Free / Demo", price: 0 }, { id: "plan_professional", name: "Professional", price: 100000 }, { id: "plan_enterprise", name: "Enterprise", price: 500000 }, { id: "plan_white_label", name: "White Label", price: 2000000 }];
  else if (url.includes("subscription")) data = { plan: { name: "Free / Demo" }, status: "ACTIVE" };

  if (method === "post" && url === "organizations") { const item = { id: `org_demo_${Date.now()}`, name: String(body.name || "New Organization") }; state.organizations.push(item); data = item; }
  if (method === "post" && url === "projects") { const item = { id: `project_demo_${Date.now()}`, name: String(body.name || "New Project"), description: String(body.description || ""), status: "ACTIVE", organizationId: String(body.organizationId || DEMO_ORG) }; state.projects.push(item); data = item; }
  if (method === "post" && /content-builder\/projects\/[^/]+\/(single-pages|multiple-pages|components)/.test(url)) { const type = url.includes("single-pages") ? "SINGLE" : url.includes("components") ? "COMPONENT" : "COLLECTION"; const item = { id: `model_demo_${Date.now()}`, name: String(body.name || "New Content Type"), apiId: String(body.apiId || "new-content"), type, description: String(body.description || ""), _count: { fields: 0, entries: 0 } }; state.models.push(item); data = item; }
  if (method === "post" && url.includes("/entries")) { const item = { id: `entry_demo_${Date.now()}`, multiplePageId: match(/multiple-pages\/([^/]+)\/entries/) || "model_blog", data: (body.data || {}) as Record<string, string>, published: Boolean(body.published) }; state.entries.push(item); data = item; }
  if (method === "post" && url.includes("api-tokens")) { const item = { id: `token_demo_${Date.now()}`, name: String(body.name || "Demo token"), tokenPrefix: "nst_demo", status: "ACTIVE", expiresAt: new Date(Date.now() + 2592000000).toISOString() }; state.tokens.push(item); data = { ...item, rawToken: "nst_demo_live_token_••••••••" }; }
  if (method === "put" && /organizations\/[^/]+$/.test(url)) { const item = state.organizations.find((entry) => url.endsWith(entry.id)); if (item) item.name = String(body.name || item.name); data = item; }
  if (method === "put" && url.includes("/entries/")) { const item = state.entries.find((entry) => url.endsWith(entry.id)); if (item) item.data = (body.data || item.data) as Record<string, string>; data = item; }
  if (method === "put" && url.includes("/single-pages/") && url.endsWith("content")) data = { id: "content_homepage", data: body.data || {}, published: true };
  if (method === "delete" && url.includes("/entries/")) state.entries = state.entries.filter((entry) => !url.endsWith(entry.id));
  if (method === "patch" && url.includes("/entries/")) { const item = state.entries.find((entry) => url.endsWith(entry.id)); if (item) item.published = !item.published; data = item; }
  if (["delete", "patch"].includes(method)) data = { success: true };
  saveDemoState(state);
  return data;
}

const demoAdapter: AxiosAdapter = async (config) => ({ data: { success: true, data: demoResponse(config) }, status: 200, statusText: "OK", headers: new AxiosHeaders(), config });

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: auto-attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (token === DEMO_TOKEN) config.adapter = demoAdapter;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
