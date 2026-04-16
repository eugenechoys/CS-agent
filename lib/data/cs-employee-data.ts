import type {
  CsBehaviorSummary,
  CsLiveUserProfile,
  CsTenantSummary,
  CsUserSummary,
} from "@/lib/schemas/cs-schemas";

type MockUserRecord = {
  summary: CsUserSummary;
  profile: CsLiveUserProfile;
  behavior: CsBehaviorSummary;
};

type MockTenantRecord = {
  tenant: CsTenantSummary;
  users: MockUserRecord[];
};

export const CS_DEMO_TENANTS: MockTenantRecord[] = [
  {
    tenant: { id: "TPNO4T3EJL9O", name: "Choys Internal", isCurrent: true, sourceType: "mock" },
    users: [
      buildUser({
        tenantId: "TPNO4T3EJL9O",
        id: "U-A1",
        name: "Alice Tan",
        email: "alice.tan@choys.com",
        department: "Engineering",
        role: "member",
        jobTitle: "Senior Engineer",
        accountStatus: "Active",
        dateJoined: "2023-02-10",
        dependentsCount: 2,
        enrollmentStatus: "active",
        gymMembership: "ActiveSG",
        wellnessCreditsBalance: 350,
        mentalHealthSessionsRemaining: 6,
        annualHealthScreening: "completed",
        eapEnrolled: true,
        medicalProvider: "AIA",
        medicalPlanName: "Shield Plus",
        medicalCoverageAmount: 500000,
        medicalCopay: 20,
        dentalProvider: "AIA",
        dentalPlanName: "Dental Basic",
        dentalCoverageAmount: 2000,
        dentalCopay: 10,
        outpatientProvider: "AIA",
        outpatientPlanName: "Outpatient A",
        outpatientCoverageAmount: 15000,
        outpatientCopay: 30,
        monthlyActivities: 18,
        activityStreakDays: 7,
        lastActiveDate: "2026-04-14",
        moodTrend: "stable and positive",
        recognitionsSent: 3,
        recognitionsReceived: 4,
        coinsBalance: 520,
        surveyParticipationRate: 88,
        openSurveys: 1,
      }),
      buildUser({
        tenantId: "TPNO4T3EJL9O",
        id: "U-C2",
        name: "Carlos Rivera",
        email: "carlos.rivera@choys.com",
        department: "Sales",
        role: "admin",
        jobTitle: "Account Executive",
        accountStatus: "Active",
        dateJoined: "2024-05-01",
        dependentsCount: 3,
        enrollmentStatus: "active",
        gymMembership: "Anytime Fitness",
        wellnessCreditsBalance: 200,
        mentalHealthSessionsRemaining: 4,
        annualHealthScreening: "scheduled",
        eapEnrolled: true,
        medicalProvider: "Prudential",
        medicalPlanName: "PRUShield Premier",
        medicalCoverageAmount: 750000,
        medicalCopay: 15,
        dentalProvider: "Prudential",
        dentalPlanName: "Dental Plus",
        dentalCoverageAmount: 3000,
        dentalCopay: 10,
        outpatientProvider: "Prudential",
        outpatientPlanName: "Outpatient B",
        outpatientCoverageAmount: 20000,
        outpatientCopay: 25,
        monthlyActivities: 11,
        activityStreakDays: 2,
        lastActiveDate: "2026-04-12",
        moodTrend: "slightly down this week",
        recognitionsSent: 1,
        recognitionsReceived: 2,
        coinsBalance: 310,
        surveyParticipationRate: 63,
        openSurveys: 2,
      }),
      buildUser({
        tenantId: "TPNO4T3EJL9O",
        id: "U-F3",
        name: "Fatima Al-Rashid",
        email: "fatima.alrashid@choys.com",
        department: "People",
        role: "member",
        jobTitle: "HR Business Partner",
        accountStatus: "Active",
        dateJoined: "2024-01-18",
        dependentsCount: 1,
        enrollmentStatus: "active",
        gymMembership: "Virgin Active",
        wellnessCreditsBalance: 500,
        mentalHealthSessionsRemaining: 8,
        annualHealthScreening: "completed",
        eapEnrolled: true,
        medicalProvider: "Great Eastern",
        medicalPlanName: "SupremeHealth B Plus",
        medicalCoverageAmount: 600000,
        medicalCopay: 20,
        dentalProvider: "Great Eastern",
        dentalPlanName: "Dental Essential",
        dentalCoverageAmount: 2500,
        dentalCopay: 15,
        outpatientProvider: "Great Eastern",
        outpatientPlanName: "Outpatient Standard",
        outpatientCoverageAmount: 12000,
        outpatientCopay: 30,
        monthlyActivities: 16,
        activityStreakDays: 5,
        lastActiveDate: "2026-04-13",
        moodTrend: "improving",
        recognitionsSent: 4,
        recognitionsReceived: 5,
        coinsBalance: 640,
        surveyParticipationRate: 92,
        openSurveys: 0,
      }),
    ],
  },
  {
    tenant: { id: "T-ANTLER", name: "Antler SEA", isCurrent: false, sourceType: "mock" },
    users: [
      buildUser({
        tenantId: "T-ANTLER",
        id: "U-M1",
        name: "Mei Chen",
        email: "mei.chen@antler-demo.com",
        department: "Product",
        role: "member",
        jobTitle: "Product Manager",
        accountStatus: "Active",
        dateJoined: "2025-01-09",
        dependentsCount: 0,
        enrollmentStatus: "active",
        gymMembership: "ClassPass",
        wellnessCreditsBalance: 480,
        mentalHealthSessionsRemaining: 8,
        annualHealthScreening: "scheduled",
        eapEnrolled: true,
        medicalProvider: "Prudential",
        medicalPlanName: "PRUShield Standard",
        medicalCoverageAmount: 300000,
        medicalCopay: 25,
        dentalProvider: "Prudential",
        dentalPlanName: "Dental Basic",
        dentalCoverageAmount: 1500,
        dentalCopay: 15,
        outpatientProvider: "Prudential",
        outpatientPlanName: "Outpatient A",
        outpatientCoverageAmount: 10000,
        outpatientCopay: 35,
        monthlyActivities: 22,
        activityStreakDays: 9,
        lastActiveDate: "2026-04-14",
        moodTrend: "highly engaged",
        recognitionsSent: 5,
        recognitionsReceived: 6,
        coinsBalance: 810,
        surveyParticipationRate: 94,
        openSurveys: 0,
      }),
      buildUser({
        tenantId: "T-ANTLER",
        id: "U-T2",
        name: "Tom Nakamura",
        email: "tom.nakamura@antler-demo.com",
        department: "Engineering",
        role: "member",
        jobTitle: "Staff Engineer",
        accountStatus: "Active",
        dateJoined: "2024-11-22",
        dependentsCount: 2,
        enrollmentStatus: "active",
        gymMembership: "Anytime Fitness",
        wellnessCreditsBalance: 275,
        mentalHealthSessionsRemaining: 5,
        annualHealthScreening: "completed",
        eapEnrolled: true,
        medicalProvider: "Prudential",
        medicalPlanName: "PRUShield Premier",
        medicalCoverageAmount: 750000,
        medicalCopay: 15,
        dentalProvider: "Prudential",
        dentalPlanName: "Dental Plus",
        dentalCoverageAmount: 3500,
        dentalCopay: 10,
        outpatientProvider: "Prudential",
        outpatientPlanName: "Outpatient Premium",
        outpatientCoverageAmount: 30000,
        outpatientCopay: 20,
        monthlyActivities: 9,
        activityStreakDays: 1,
        lastActiveDate: "2026-04-08",
        moodTrend: "needs a re-engagement nudge",
        recognitionsSent: 0,
        recognitionsReceived: 1,
        coinsBalance: 190,
        surveyParticipationRate: 41,
        openSurveys: 2,
      }),
    ],
  },
  {
    tenant: { id: "T-KITABISA", name: "Kitabisa Demo", isCurrent: false, sourceType: "mock" },
    users: [
      buildUser({
        tenantId: "T-KITABISA",
        id: "U-R1",
        name: "Raj Patel",
        email: "raj.patel@kitabisa-demo.com",
        department: "Operations",
        role: "member",
        jobTitle: "Operations Lead",
        accountStatus: "Active",
        dateJoined: "2023-07-30",
        dependentsCount: 4,
        enrollmentStatus: "active",
        gymMembership: "Gold's Gym",
        wellnessCreditsBalance: 100,
        mentalHealthSessionsRemaining: 2,
        annualHealthScreening: "completed",
        eapEnrolled: true,
        medicalProvider: "Great Eastern",
        medicalPlanName: "SupremeHealth A Plus",
        medicalCoverageAmount: 400000,
        medicalCopay: 20,
        dentalProvider: "Great Eastern",
        dentalPlanName: "Dental Plus",
        dentalCoverageAmount: 3000,
        dentalCopay: 10,
        outpatientProvider: "Great Eastern",
        outpatientPlanName: "Outpatient Premium",
        outpatientCoverageAmount: 25000,
        outpatientCopay: 20,
        monthlyActivities: 7,
        activityStreakDays: 0,
        lastActiveDate: "2026-04-05",
        moodTrend: "fatigued after a busy sprint",
        recognitionsSent: 2,
        recognitionsReceived: 1,
        coinsBalance: 140,
        surveyParticipationRate: 58,
        openSurveys: 1,
      }),
    ],
  },
];

type BuildUserInput = {
  tenantId: string;
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  jobTitle: string;
  accountStatus: string;
  dateJoined: string;
  dependentsCount: number;
  enrollmentStatus: string;
  gymMembership: string;
  wellnessCreditsBalance: number;
  mentalHealthSessionsRemaining: number;
  annualHealthScreening: string;
  eapEnrolled: boolean;
  medicalProvider: string;
  medicalPlanName: string;
  medicalCoverageAmount: number;
  medicalCopay: number;
  dentalProvider: string;
  dentalPlanName: string;
  dentalCoverageAmount: number;
  dentalCopay: number;
  outpatientProvider: string;
  outpatientPlanName: string;
  outpatientCoverageAmount: number;
  outpatientCopay: number;
  monthlyActivities: number;
  activityStreakDays: number;
  lastActiveDate: string;
  moodTrend: string;
  recognitionsSent: number;
  recognitionsReceived: number;
  coinsBalance: number;
  surveyParticipationRate: number;
  openSurveys: number;
};

function buildUser(input: BuildUserInput): MockUserRecord {
  return {
    summary: {
      id: input.id,
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.accountStatus,
      jobTitle: input.jobTitle,
      sourceType: "mock",
    },
    profile: {
      id: input.id,
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      department: input.department,
      role: input.role,
      jobTitle: input.jobTitle,
      accountStatus: input.accountStatus,
      dateJoined: input.dateJoined,
      dependentsCount: input.dependentsCount,
      enrollmentStatus: input.enrollmentStatus,
      insurance: {
        medical: {
          provider: input.medicalProvider,
          planName: input.medicalPlanName,
          coverageAmount: input.medicalCoverageAmount,
          copay: input.medicalCopay,
        },
        dental: {
          provider: input.dentalProvider,
          planName: input.dentalPlanName,
          coverageAmount: input.dentalCoverageAmount,
          copay: input.dentalCopay,
        },
        outpatient: {
          provider: input.outpatientProvider,
          planName: input.outpatientPlanName,
          coverageAmount: input.outpatientCoverageAmount,
          copay: input.outpatientCopay,
        },
      },
      benefits: {
        eapEnrolled: input.eapEnrolled,
        wellnessCreditsBalance: input.wellnessCreditsBalance,
        gymMembership: input.gymMembership,
        mentalHealthSessionsRemaining: input.mentalHealthSessionsRemaining,
        annualHealthScreening: input.annualHealthScreening,
      },
    },
    behavior: {
      monthlyActivities: input.monthlyActivities,
      activityStreakDays: input.activityStreakDays,
      lastActiveDate: input.lastActiveDate,
      moodTrend: input.moodTrend,
      recognitionsSent: input.recognitionsSent,
      recognitionsReceived: input.recognitionsReceived,
      coinsBalance: input.coinsBalance,
      surveyParticipationRate: input.surveyParticipationRate,
      openSurveys: input.openSurveys,
    },
  };
}

export function getMockTenants(): CsTenantSummary[] {
  return CS_DEMO_TENANTS.map((entry) => entry.tenant);
}

export function getMockUsersByTenant(tenantId: string): CsUserSummary[] {
  return CS_DEMO_TENANTS.find((entry) => entry.tenant.id === tenantId)?.users.map((user) => user.summary) ?? [];
}

export function getMockUserById(tenantId: string, userId: string): MockUserRecord | undefined {
  return CS_DEMO_TENANTS.find((entry) => entry.tenant.id === tenantId)?.users.find((user) => user.summary.id === userId);
}
