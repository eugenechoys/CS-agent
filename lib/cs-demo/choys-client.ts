import fs from "node:fs";
import { CURATED_CS_ENDPOINTS } from "@/lib/cs-demo/manifest";
import { getMockTenants, getMockUserById, getMockUsersByTenant } from "@/lib/data/cs-employee-data";
import type {
  CsApiEnv,
  CsBehaviorSummary,
  CsDemoContextResponse,
  CsLiveUserProfile,
  CsSourceSummary,
  CsTenantSummary,
  CsUserSummary,
} from "@/lib/schemas/cs-schemas";

type ChoysSession = {
  accessToken?: string;
  refreshToken?: string;
  authMode: CsDemoContextResponse["authMode"];
  apiEnv: CsApiEnv;
};

function parseEnvLine(raw: string) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) return undefined;
  const separator = line.indexOf("=");
  if (separator === -1) return undefined;
  return {
    key: line.slice(0, separator).trim(),
    value: line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ""),
  };
}

function readEnvValue(name: string) {
  if (process.env[name]) return process.env[name];

  const cwd = /* turbopackIgnore: true */ process.cwd();
  for (const filePath of [`${cwd}/.env.local`, `${cwd}/.env.example`]) {
    if (!fs.existsSync(filePath)) continue;
    const contents = fs.readFileSync(filePath, "utf8");
    const entry = contents
      .split(/\r?\n/)
      .map(parseEnvLine)
      .find((item): item is { key: string; value: string } => Boolean(item) && item.key === name);
    if (entry?.value) return entry.value;
  }

  return undefined;
}

export function getDefaultCsApiEnv(): CsApiEnv {
  const env = readEnvValue("CHOYS_API_ENV");
  return env === "prod" ? "prod" : "dev";
}

function getChoysBaseUrl(apiEnv: CsApiEnv = getDefaultCsApiEnv()) {
  const envSpecific =
    apiEnv === "prod"
      ? readEnvValue("CHOYS_API_BASE_URL_PROD")
      : readEnvValue("CHOYS_API_BASE_URL_DEV");
  if (envSpecific) return envSpecific;

  const explicit = readEnvValue("CHOYS_API_BASE_URL");
  if (explicit && !readEnvValue("CHOYS_API_ENV")) return explicit;
  return apiEnv === "prod" ? "https://prodapi.choysapp.com" : "https://api.dev.choysapp.com";
}

function getEnvDemoToken() {
  return readEnvValue("CHOYS_DEMO_ACCESS_TOKEN");
}

function getAppPlatform() {
  return readEnvValue("CHOYS_APP_PLATFORM") || "choys-web-app";
}

function appendTenantId(url: string, tenantId?: string) {
  if (!tenantId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tenantId=${encodeURIComponent(tenantId)}`;
}

async function requestChoys<T>({
  accessToken,
  method,
  path,
  tenantId,
  body,
  apiEnv,
}: {
  accessToken?: string;
  method: "GET" | "POST";
  path: string;
  tenantId?: string;
  body?: Record<string, unknown>;
  apiEnv?: CsApiEnv;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "app-platform": getAppPlatform(),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (tenantId) {
    headers["tenant-id"] = tenantId;
    headers["x-tenant-id"] = tenantId;
  }

  const response = await fetch(appendTenantId(`${getChoysBaseUrl(apiEnv)}${path}`, tenantId), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: any = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Choys API request failed for ${path}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function sendChoysOtp(emailAddress: string, apiEnv: CsApiEnv) {
  return requestChoys<{ statusCode?: number; message?: string }>({
    accessToken: getEnvDemoToken() || "",
    method: "POST",
    path: "/auth/login/send-otp",
    body: { emailAddress },
    apiEnv,
  });
}

export async function verifyChoysOtp(emailAddress: string, otp: string, apiEnv: CsApiEnv) {
  return requestChoys<{ data?: { accessToken?: string; refreshToken?: string } }>({
    accessToken: getEnvDemoToken() || "",
    method: "POST",
    path: "/auth/login/verify-otp",
    body: { emailAddress, otp },
    apiEnv,
  });
}

export function resolveChoysSession(accessToken?: string, refreshToken?: string, apiEnv?: CsApiEnv): ChoysSession {
  const resolvedEnv = apiEnv ?? getDefaultCsApiEnv();
  if (accessToken) {
    return { accessToken, refreshToken, authMode: "session", apiEnv: resolvedEnv };
  }

  const envToken = getEnvDemoToken();
  if (envToken) {
    return { accessToken: envToken, authMode: "env", apiEnv: resolvedEnv };
  }

  return { authMode: "none", apiEnv: resolvedEnv };
}

function normalizeTenants(payload: any, authTenantName?: string): CsTenantSummary[] {
  const raw = Array.isArray(payload) ? payload : payload?.tenants || payload?.data || [];
  return raw.map((tenant: any) => {
    const name = tenant.companyName || tenant.name || "Unknown Tenant";
    const id = tenant.id || tenant.tenantId || name;
    return {
      id,
      name,
      isCurrent: Boolean(authTenantName && name === authTenantName),
      isExpired: tenant.isExpired,
      sourceType: "live" as const,
    };
  });
}

function normalizeUsers(payload: any, tenantId: string): CsUserSummary[] {
  const raw = Array.isArray(payload) ? payload : payload?.users || payload?.data || [];
  return raw.map((user: any) => ({
    id: user.userId || user.id || user.emailAddress || user.fullName,
    tenantId,
    name: user.fullName || user.name || "Unknown User",
    email: user.emailAddress || user.email,
    role: user.role,
    status: user.accountStatus || user.status,
    jobTitle: user.jobTitle ?? null,
    sourceType: "live" as const,
  }));
}

function dedupeUsers(users: CsUserSummary[]) {
  const seen = new Map<string, CsUserSummary>();
  for (const user of users) {
    if (!seen.has(user.id)) {
      seen.set(user.id, user);
    }
  }
  return [...seen.values()];
}

function extractPagination(payload: any) {
  const source = payload?.meta || payload?.pagination || payload?.data?.meta || payload?.data?.pagination || payload;
  const pageNumber = Number(source?.pageNumber ?? source?.page ?? source?.currentPage ?? 1);
  const pageSize = Number(source?.pageSize ?? source?.limit ?? source?.perPage ?? 0);
  const totalPages = Number(source?.totalPages ?? source?.lastPage ?? 0);
  const totalCount = Number(source?.totalCount ?? source?.total ?? source?.count ?? 0);
  const hasNext = Boolean(
    source?.hasNext
    ?? source?.hasNextPage
    ?? (totalPages > 0 ? pageNumber < totalPages : undefined),
  );

  return { pageNumber, pageSize, totalPages, totalCount, hasNext };
}

async function fetchTenantUsers({
  accessToken,
  tenantId,
  apiEnv,
}: {
  accessToken: string;
  tenantId: string;
  apiEnv: CsApiEnv;
}) {
  const endpoint = CURATED_CS_ENDPOINTS.find((entry) => entry.id === "tenant-users")!.path.replace(":tenantId", tenantId);
  const pageSize = 250;
  const maxPages = 8;

  const collected: CsUserSummary[] = [];
  let firstPayload: any = null;

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const path = `${endpoint}${separator}pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const payload = await requestChoys<any>({
      accessToken,
      method: "GET",
      path,
      tenantId,
      apiEnv,
    });

    if (!firstPayload) firstPayload = payload;

    const pageUsers = normalizeUsers(payload, tenantId);
    collected.push(...pageUsers);

    const pagination = extractPagination(payload);
    const reachedKnownTotal = pagination.totalCount > 0 && collected.length >= pagination.totalCount;
    const shortPage = pageUsers.length < pageSize;
    const noNext = !pagination.hasNext && pagination.totalPages > 0;

    if (pageUsers.length === 0 || reachedKnownTotal || noNext || shortPage) {
      break;
    }
  }

  return {
    payload: firstPayload,
    users: dedupeUsers(collected),
  };
}

function getPayloadItems(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
}

function getPayloadObject(payload: any) {
  if (!payload) return undefined;
  if (typeof payload?.data === "object" && payload.data && !Array.isArray(payload.data)) return payload.data;
  if (typeof payload === "object" && !Array.isArray(payload)) return payload;
  return undefined;
}

function collectPreviewPairs(value: any, prefix = "", acc: string[] = []) {
  if (acc.length >= 8 || value == null) return acc;

  if (Array.isArray(value)) {
    if (value.length === 0) return acc;
    if (typeof value[0] !== "object") {
      acc.push(`${prefix || "items"}: ${value.slice(0, 3).join(", ")}`);
      return acc;
    }
    collectPreviewPairs(value[0], prefix ? `${prefix}[0]` : "item", acc);
    return acc;
  }

  if (typeof value !== "object") {
    acc.push(`${prefix || "value"}: ${String(value)}`);
    return acc;
  }

  for (const [key, next] of Object.entries(value)) {
    if (acc.length >= 8) break;
    if (next == null || next === "") continue;

    const label = prefix ? `${prefix}.${key}` : key;
    if (typeof next === "string" || typeof next === "number" || typeof next === "boolean") {
      acc.push(`${label}: ${String(next)}`);
      continue;
    }

    if (Array.isArray(next) && next.length > 0 && typeof next[0] !== "object") {
      acc.push(`${label}: ${next.slice(0, 3).join(", ")}`);
      continue;
    }

    collectPreviewPairs(next, label, acc);
  }

  return acc;
}

function buildPreview(payload: any, preferredFields: string[]) {
  const items = getPayloadItems(payload);
  const object = getPayloadObject(payload);
  const preview: string[] = [];
  const candidate = items[0] ?? object;

  if (candidate && preferredFields.length > 0) {
    for (const field of preferredFields) {
      const value = field.split(".").reduce<any>((current, part) => current?.[part], candidate);
      if (value == null || value === "" || typeof value === "object") continue;
      preview.push(`${field}: ${String(value)}`);
      if (preview.length >= 6) return preview;
    }
  }

  return collectPreviewPairs(candidate ?? payload).slice(0, 6);
}

function isPayloadEmpty(payload: any) {
  if (!payload) return true;
  if (Array.isArray(payload)) return payload.length === 0;
  if (Array.isArray(payload?.data)) return payload.data.length === 0;
  if (Array.isArray(payload?.data?.items)) return payload.data.items.length === 0;
  if (Array.isArray(payload?.items)) return payload.items.length === 0;
  if (typeof payload?.data === "object" && payload.data) return Object.keys(payload.data).length === 0;
  if (typeof payload === "object") return Object.keys(payload).length === 0;
  return false;
}

async function getAuthTenantName(accessToken: string, apiEnv: CsApiEnv) {
  const payload = await requestChoys<any>({
    accessToken,
    method: "GET",
    path: "/v2/web/tenants",
    apiEnv,
  });
  const tenant = payload?.data?.tenant || payload?.data || {};
  return tenant.companyName || tenant.name || "Your Tenant";
}

export async function loadCsDemoContext({
  accessToken,
  tenantId,
  apiEnv,
}: {
  accessToken?: string;
  tenantId?: string;
  apiEnv?: CsApiEnv;
}): Promise<CsDemoContextResponse> {
  const session = resolveChoysSession(accessToken, undefined, apiEnv);
  if (!session.accessToken) {
    return {
      authenticated: false,
      authMode: "none",
      apiEnv: session.apiEnv,
      authTenantName: undefined,
      sourceType: "mock",
      tenants: [],
      users: [],
    };
  }

  const authTenantName = await getAuthTenantName(session.accessToken, session.apiEnv);
  const tenantPayload = await requestChoys<any>({
    accessToken: session.accessToken,
    method: "GET",
    path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "tenant-list")!.path,
    apiEnv: session.apiEnv,
  });
  const tenants = normalizeTenants(tenantPayload, authTenantName);
  const selectedTenantId = tenantId || tenants.find((entry) => entry.isCurrent)?.id || tenants[0]?.id;

  let users: CsUserSummary[] = [];
  if (selectedTenantId) {
    const userResult = await fetchTenantUsers({
      accessToken: session.accessToken,
      tenantId: selectedTenantId,
      apiEnv: session.apiEnv,
    });
    users = userResult.users;
  }

  return {
    authenticated: true,
    authMode: session.authMode,
    apiEnv: session.apiEnv,
    authTenantName,
    sourceType: "live",
    tenants,
    users,
  };
}

function buildMockSourceSummary(
  sourceId: string,
  label: string,
  endpointGroup: string,
  tenantId: string,
  userId: string | undefined,
  fields: string[],
  note: string,
): CsSourceSummary {
  return {
    sourceId,
    label,
    endpointGroup,
    scope: userId ? "user" : "tenant",
    tenantId,
    userId,
    fields,
    sourceType: "mock",
    status: "success",
    preview: [],
    note,
  };
}

function summarizeTenantActivity(payload: any): Pick<CsBehaviorSummary, "monthlyActivities" | "lastActiveDate"> {
  const series = Array.isArray(payload?.data?.series) ? payload.data.series : payload?.series;
  const xCategory = Array.isArray(payload?.data?.xCategory) ? payload.data.xCategory : payload?.xCategory;
  if (!Array.isArray(series)) return {};

  const numericSeries = series.map((value: unknown) => Number(value) || 0);
  const lastActiveIndex = numericSeries.reduce((best, value, index) => (value > 0 ? index : best), -1);
  return {
    monthlyActivities: numericSeries.reduce((sum, value) => sum + value, 0),
    lastActiveDate: lastActiveIndex >= 0 && Array.isArray(xCategory) ? xCategory[lastActiveIndex] : undefined,
  };
}

function normalizeInsurance(payload: any, fallbackProfile?: CsLiveUserProfile) {
  if (!payload) return fallbackProfile?.insurance;
  const directObject = getPayloadObject(payload);
  const items = getPayloadItems(payload).length > 0
    ? getPayloadItems(payload)
    : directObject?.planName || directObject?.providerName || directObject?.provider || directObject?.planBenefits
      ? [directObject]
      : [];
  if (!Array.isArray(items) || items.length === 0) return fallbackProfile?.insurance;

  const byKind: Record<"medical" | "dental" | "outpatient", any | undefined> = {
    medical: undefined,
    dental: undefined,
    outpatient: undefined,
  };

  for (const item of items) {
    const text = JSON.stringify(item).toLowerCase();
    if (!byKind.dental && text.includes("dental")) {
      byKind.dental = item;
      continue;
    }
    if (!byKind.outpatient && (text.includes("outpatient") || text.includes("general practitioner") || text.includes("gp benefit"))) {
      byKind.outpatient = item;
      continue;
    }
    if (!byKind.medical) {
      byKind.medical = item;
    }
  }

  return {
    medical: byKind.medical
      ? {
          provider: byKind.medical.provider || byKind.medical.providerName || fallbackProfile?.insurance?.medical?.provider || "Unknown",
          planName: byKind.medical.plan_name || byKind.medical.planName || fallbackProfile?.insurance?.medical?.planName || "Medical Plan",
          coverageAmount: Number(byKind.medical.coverage_amount || byKind.medical.coverageAmount || byKind.medical.coverage || fallbackProfile?.insurance?.medical?.coverageAmount),
          copay: Number(byKind.medical.copay || fallbackProfile?.insurance?.medical?.copay),
          notes: byKind.medical.note || byKind.medical.desc || fallbackProfile?.insurance?.medical?.notes,
        }
      : fallbackProfile?.insurance?.medical,
    dental: byKind.dental
      ? {
          provider: byKind.dental.provider || byKind.dental.providerName || fallbackProfile?.insurance?.dental?.provider || "Unknown",
          planName: byKind.dental.plan_name || byKind.dental.planName || fallbackProfile?.insurance?.dental?.planName || "Dental Plan",
          coverageAmount: Number(byKind.dental.coverage_amount || byKind.dental.coverageAmount || byKind.dental.coverage || fallbackProfile?.insurance?.dental?.coverageAmount),
          copay: Number(byKind.dental.copay || fallbackProfile?.insurance?.dental?.copay),
          notes: byKind.dental.note || byKind.dental.desc || fallbackProfile?.insurance?.dental?.notes,
        }
      : fallbackProfile?.insurance?.dental,
    outpatient: byKind.outpatient
      ? {
          provider: byKind.outpatient.provider || byKind.outpatient.providerName || fallbackProfile?.insurance?.outpatient?.provider || "Unknown",
          planName: byKind.outpatient.plan_name || byKind.outpatient.planName || fallbackProfile?.insurance?.outpatient?.planName || "Outpatient Plan",
          coverageAmount: Number(byKind.outpatient.coverage_amount || byKind.outpatient.coverageAmount || byKind.outpatient.coverage || fallbackProfile?.insurance?.outpatient?.coverageAmount),
          copay: Number(byKind.outpatient.copay || fallbackProfile?.insurance?.outpatient?.copay),
          notes: byKind.outpatient.note || byKind.outpatient.desc || fallbackProfile?.insurance?.outpatient?.notes,
        }
      : fallbackProfile?.insurance?.outpatient,
  };
}

function normalizeProfileFromCoworker(payload: any) {
  const object = getPayloadObject(payload);
  if (!object) return undefined;

  const user = object.user || object.profile || object;
  return {
    id: user.userId || user.id || user.employeeId,
    name: user.fullName || user.name,
    email: user.emailAddress || user.email,
    department: user.department || user.teamName,
    role: user.role,
    jobTitle: user.jobTitle || user.title,
    accountStatus: user.accountStatus || user.status,
    dateJoined: user.dateJoined || user.joinDate,
  };
}

function normalizeCoinsSummary(payload: any, fallbackBehavior?: CsBehaviorSummary) {
  const items = getPayloadItems(payload);
  const object = getPayloadObject(payload);
  const behavior: CsBehaviorSummary = { ...(fallbackBehavior || {}) };

  const directBalance = object?.balance ?? object?.coinBalance ?? object?.coinsBalance;
  if (directBalance != null) {
    behavior.coinsBalance = Number(directBalance) || behavior.coinsBalance;
  }

  if (items.length > 0) {
    const total = items.reduce((sum, item) => {
      const value = Number(item.coins ?? item.amount ?? item.value ?? 0);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
    if (total > 0) {
      behavior.coinsBalance = behavior.coinsBalance ?? total;
    }
  }

  return behavior;
}

export async function lookupEmployeeSupportSnapshot(input: {
  accessToken?: string;
  tenantId: string;
  userId: string;
  focus: string;
  apiEnv?: CsApiEnv;
  sourceCollector?: CsSourceSummary[];
}) {
  const mockUser = getMockUserById(input.tenantId, input.userId);
  const session = resolveChoysSession(input.accessToken, undefined, input.apiEnv);

  let profile: CsLiveUserProfile | undefined = mockUser?.profile;
  let behavior: CsBehaviorSummary | undefined = mockUser?.behavior;
  const sourceSummaries: CsSourceSummary[] = [];

  if (session.accessToken) {
    const [tenantUsers, coworkerProfile, insurance, userCoins, activity, moodRecord, recognition, coins, surveys] =
      await Promise.allSettled([
        fetchTenantUsers({
          accessToken: session.accessToken,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "user-coworker-profile")!.path.replace(":userId", input.userId),
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "user-insurance")!.path.replace(":userId", input.userId),
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "POST",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "user-earned-coins")!.path.replace(":userId", input.userId),
          tenantId: input.tenantId,
          body: { page: "0" },
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "tenant-activity")!.path,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "tenant-mood-record")!.path,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "recognition-recent")!.path,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "coin-insights")!.path,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
        requestChoys<any>({
          accessToken: session.accessToken,
          method: "GET",
          path: CURATED_CS_ENDPOINTS.find((entry) => entry.id === "tenant-surveys")!.path,
          tenantId: input.tenantId,
          apiEnv: session.apiEnv,
        }),
      ]);

    if (tenantUsers.status === "fulfilled") {
      const liveUser = tenantUsers.value.users.find((entry) => entry.id === input.userId);
      if (liveUser) {
        profile = {
          ...profile,
          id: liveUser.id,
          tenantId: input.tenantId,
          name: liveUser.name,
          email: liveUser.email,
          role: liveUser.role,
          jobTitle: liveUser.jobTitle,
          accountStatus: liveUser.status,
        };
        sourceSummaries.push({
          sourceId: "tenant-users",
          label: "Tenant Users",
          endpointGroup: "users",
          scope: "user",
          tenantId: input.tenantId,
          userId: input.userId,
          fields: ["fullName", "emailAddress", "role", "accountStatus", "jobTitle"],
          sourceType: mockUser ? "hybrid" : "live",
          status: tenantUsers.value.users.length === 0 ? "empty" : "success",
          preview: buildPreview(tenantUsers.value.payload ?? tenantUsers.value.users, ["fullName", "emailAddress", "role", "accountStatus", "jobTitle"]),
          note: "Used tenant user directory to resolve the selected member profile.",
        });
      }
    }

    if (coworkerProfile.status === "fulfilled") {
      const profilePatch = normalizeProfileFromCoworker(coworkerProfile.value);
      if (profilePatch) {
        profile = {
          ...profile,
          id: profilePatch.id || profile?.id || input.userId,
          tenantId: input.tenantId,
          name: profilePatch.name || profile?.name || mockUser?.summary.name || "Selected User",
          email: profilePatch.email || profile?.email,
          department: profilePatch.department || profile?.department,
          role: profilePatch.role || profile?.role,
          jobTitle: profilePatch.jobTitle || profile?.jobTitle,
          accountStatus: profilePatch.accountStatus || profile?.accountStatus,
          dateJoined: profilePatch.dateJoined || profile?.dateJoined,
        };
      }

      sourceSummaries.push({
        sourceId: "user-coworker-profile",
        label: "User Profile",
        endpointGroup: "profile",
        scope: "user",
        tenantId: input.tenantId,
        userId: input.userId,
        fields: ["fullName", "emailAddress", "department", "jobTitle", "role", "employeeId"],
        sourceType: mockUser ? "hybrid" : "live",
        status: isPayloadEmpty(coworkerProfile.value) ? "empty" : "success",
        preview: buildPreview(coworkerProfile.value, ["fullName", "emailAddress", "department", "jobTitle", "role", "employeeId"]),
        note: "Used selected employee profile details from the coworker profile service.",
      });
    }

    if (insurance.status === "fulfilled") {
      profile = {
        ...profile,
        id: profile?.id || input.userId,
        tenantId: input.tenantId,
        name: profile?.name || mockUser?.summary.name || "Selected User",
        insurance: normalizeInsurance(insurance.value, profile),
      };
      sourceSummaries.push({
        sourceId: "user-insurance",
        label: "User Insurance",
        endpointGroup: "insurance",
        scope: "user",
        tenantId: input.tenantId,
        userId: input.userId,
        fields: ["provider", "plan_name", "coverage_amount", "copay"],
        sourceType: mockUser ? "hybrid" : "live",
        status: isPayloadEmpty(insurance.value) ? "empty" : "success",
        preview: buildPreview(insurance.value, ["providerName", "provider", "planName", "plan_name", "coverage", "coverage_amount", "copay"]),
        note: "Used curated insurance lookup for the selected employee.",
      });
    }

    if (userCoins.status === "fulfilled") {
      behavior = normalizeCoinsSummary(userCoins.value, behavior);
      sourceSummaries.push({
        sourceId: "user-earned-coins",
        label: "User Earned Coins",
        endpointGroup: "coins",
        scope: "user",
        tenantId: input.tenantId,
        userId: input.userId,
        fields: ["coins", "amount", "transactionType", "status", "createdAt"],
        sourceType: mockUser ? "hybrid" : "live",
        status: isPayloadEmpty(userCoins.value) ? "empty" : "success",
        preview: buildPreview(userCoins.value, ["coins", "amount", "transactionType", "status", "createdAt"]),
        note: "Used user-level coin earning records for selected employee credit context.",
      });
    }

    if (activity.status === "fulfilled") {
      behavior = {
        ...behavior,
        ...summarizeTenantActivity(activity.value),
      };
      sourceSummaries.push({
        sourceId: "tenant-activity",
        label: "Tenant Activity",
        endpointGroup: "activity",
        scope: "tenant",
        tenantId: input.tenantId,
        fields: ["activityData", "series", "xCategory"],
        sourceType: mockUser ? "hybrid" : "live",
        status: isPayloadEmpty(activity.value) ? "empty" : "success",
        preview: buildPreview(activity.value, ["series", "xCategory"]),
        note: "Used tenant activity trends to add broader engagement context.",
      });
    }

    if (moodRecord.status === "fulfilled") {
      sourceSummaries.push({
        sourceId: "tenant-mood-record",
        label: "Tenant Mood Record",
        endpointGroup: "mood",
        scope: "tenant",
        tenantId: input.tenantId,
        fields: ["data", "series", "xCategory"],
        sourceType: "live",
        status: isPayloadEmpty(moodRecord.value) ? "empty" : "success",
        preview: buildPreview(moodRecord.value, ["series", "xCategory"]),
        note: "Used tenant mood trends to contextualize wellbeing support answers.",
      });
    }

    if (recognition.status === "fulfilled") {
      sourceSummaries.push({
        sourceId: "recognition-recent",
        label: "Recent Recognition",
        endpointGroup: "recognition",
        scope: "tenant",
        tenantId: input.tenantId,
        fields: ["recentRecognitions", "totalGiven"],
        sourceType: "live",
        status: isPayloadEmpty(recognition.value) ? "empty" : "success",
        preview: buildPreview(recognition.value, ["totalGiven", "recentRecognitions"]),
        note: "Used recent recognition activity to support broader engagement context.",
      });
    }

    if (coins.status === "fulfilled") {
      sourceSummaries.push({
        sourceId: "coin-insights",
        label: "Coin Insights",
        endpointGroup: "coins",
        scope: "tenant",
        tenantId: input.tenantId,
        fields: ["earned", "redeemed", "balance"],
        sourceType: "live",
        status: isPayloadEmpty(coins.value) ? "empty" : "success",
        preview: buildPreview(coins.value, ["balance", "earned", "redeemed"]),
        note: "Used tenant rewards activity for coin and credit context.",
      });
    }

    if (surveys.status === "fulfilled") {
      sourceSummaries.push({
        sourceId: "tenant-surveys",
        label: "Tenant Surveys",
        endpointGroup: "surveys",
        scope: "tenant",
        tenantId: input.tenantId,
        fields: ["id", "title", "status", "endDate"],
        sourceType: "live",
        status: isPayloadEmpty(surveys.value) ? "empty" : "success",
        preview: buildPreview(surveys.value, ["id", "title", "status", "endDate"]),
        note: "Used current surveys to explain participation or pending survey questions.",
      });
    }
  }

  if (!profile || !behavior) {
    if (!mockUser) {
      throw new Error("No support profile was found for the selected user.");
    }
    profile = mockUser.profile;
    behavior = mockUser.behavior;
  }

  if (sourceSummaries.length === 0 && mockUser) {
    sourceSummaries.push(
      buildMockSourceSummary(
        "mock-profile",
        "Mock Demo Profile",
        "profile",
        input.tenantId,
        input.userId,
        ["department", "role", "benefits", "insurance"],
        "Used internal demo data because live tenant lookups were unavailable.",
      ),
      buildMockSourceSummary(
        "mock-behavior",
        "Mock Demo Behavior",
        "behavior",
        input.tenantId,
        input.userId,
        ["monthlyActivities", "activityStreakDays", "moodTrend", "coinsBalance"],
        "Used internal demo behavior signals to answer employee-specific questions.",
      ),
    );
  }

  input.sourceCollector?.push(...sourceSummaries);

  return {
    profile,
    behavior,
    focus: input.focus,
    sourceSummaries,
  };
}

export function getMockDemoContext(tenantId?: string, apiEnv: CsApiEnv = getDefaultCsApiEnv()): CsDemoContextResponse {
  const tenants = getMockTenants();
  const selectedTenantId = tenantId || tenants[0]?.id;
  const users = selectedTenantId ? getMockUsersByTenant(selectedTenantId) : [];
  return {
    authenticated: true,
    authMode: "mock",
    apiEnv,
    authTenantName: tenants.find((entry) => entry.isCurrent)?.name,
    sourceType: "mock",
    tenants,
    users,
  };
}

export function getStaticDemoTenantOptions(): CsTenantSummary[] {
  return getMockTenants();
}

export function getStaticDemoUsers(tenantId: string): CsUserSummary[] {
  return getMockUsersByTenant(tenantId);
}
