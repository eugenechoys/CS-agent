import type { Dataset } from "@/lib/schemas/bokchoys";

export type SampleDatasetDefinition = {
  key: string;
  name: string;
  description: string;
  columns: string[];
  rows: Dataset["rows"];
};

/*
 * These datasets simulate a company ("Choys Corp") that has been using Bokchoys
 * for ~6 months with 20 employees across 4 departments.
 * Think of it as a real product database snapshot.
 */

export const SAMPLE_DATASETS: SampleDatasetDefinition[] = [

  /* ═══════════════════════════════════════════════
     1. EMPLOYEES — company directory
     ═══════════════════════════════════════════════ */
  {
    key: "employees",
    name: "Employees",
    description: "Company directory: 20 employees, 4 departments, roles, locations, work modes, and tenure.",
    columns: ["employee_id", "name", "department", "role", "location", "work_mode", "tenure_months", "manager"],
    rows: [
      { employee_id: "E001", name: "Alice Tan", department: "Engineering", role: "Senior Engineer", location: "Singapore", work_mode: "remote", tenure_months: "36", manager: "Bob Lim" },
      { employee_id: "E002", name: "Carlos Rivera", department: "Sales", role: "Account Executive", location: "Manila", work_mode: "onsite", tenure_months: "18", manager: "Dana Cruz" },
      { employee_id: "E003", name: "Fatima Al-Rashid", department: "People", role: "HR Business Partner", location: "Dubai", work_mode: "hybrid", tenure_months: "24", manager: "Grace Ong" },
      { employee_id: "E004", name: "James Park", department: "Operations", role: "Operations Lead", location: "Seoul", work_mode: "onsite", tenure_months: "42", manager: "Grace Ong" },
      { employee_id: "E005", name: "Mei Chen", department: "Engineering", role: "Junior Engineer", location: "Singapore", work_mode: "remote", tenure_months: "6", manager: "Bob Lim" },
      { employee_id: "E006", name: "Raj Patel", department: "Sales", role: "Sales Manager", location: "Mumbai", work_mode: "hybrid", tenure_months: "30", manager: "Dana Cruz" },
      { employee_id: "E007", name: "Sophie Laurent", department: "People", role: "People Ops Specialist", location: "Singapore", work_mode: "hybrid", tenure_months: "14", manager: "Grace Ong" },
      { employee_id: "E008", name: "Tom Nakamura", department: "Engineering", role: "Staff Engineer", location: "Tokyo", work_mode: "remote", tenure_months: "48", manager: "Bob Lim" },
      { employee_id: "E009", name: "Lina Johansson", department: "Operations", role: "Logistics Coordinator", location: "Stockholm", work_mode: "onsite", tenure_months: "12", manager: "James Park" },
      { employee_id: "E010", name: "Ahmed Hassan", department: "Sales", role: "Business Development Rep", location: "Dubai", work_mode: "onsite", tenure_months: "8", manager: "Raj Patel" },
      { employee_id: "E011", name: "Bob Lim", department: "Engineering", role: "Engineering Manager", location: "Singapore", work_mode: "hybrid", tenure_months: "60", manager: "CEO" },
      { employee_id: "E012", name: "Dana Cruz", department: "Sales", role: "Head of Sales", location: "Manila", work_mode: "onsite", tenure_months: "36", manager: "CEO" },
      { employee_id: "E013", name: "Grace Ong", department: "People", role: "Head of People", location: "Singapore", work_mode: "hybrid", tenure_months: "40", manager: "CEO" },
      { employee_id: "E014", name: "Priya Sharma", department: "Engineering", role: "Backend Engineer", location: "Bangalore", work_mode: "remote", tenure_months: "20", manager: "Bob Lim" },
      { employee_id: "E015", name: "Kevin Wu", department: "Operations", role: "Supply Chain Analyst", location: "Taipei", work_mode: "hybrid", tenure_months: "16", manager: "James Park" },
      { employee_id: "E016", name: "Maria Santos", department: "Sales", role: "Customer Success Lead", location: "Manila", work_mode: "hybrid", tenure_months: "22", manager: "Dana Cruz" },
      { employee_id: "E017", name: "Yuki Tanaka", department: "Engineering", role: "Frontend Engineer", location: "Tokyo", work_mode: "remote", tenure_months: "10", manager: "Bob Lim" },
      { employee_id: "E018", name: "Hassan Ali", department: "Operations", role: "QA Specialist", location: "Dubai", work_mode: "onsite", tenure_months: "28", manager: "James Park" },
      { employee_id: "E019", name: "Emma Wilson", department: "People", role: "L&D Coordinator", location: "London", work_mode: "hybrid", tenure_months: "9", manager: "Grace Ong" },
      { employee_id: "E020", name: "Leo Kim", department: "Engineering", role: "DevOps Engineer", location: "Seoul", work_mode: "remote", tenure_months: "15", manager: "Bob Lim" },
    ],
  },

  /* ═══════════════════════════════════════════════
     2. PROGRAMS — all programs run in the last 6 months
     ═══════════════════════════════════════════════ */
  {
    key: "programs",
    name: "Programs",
    description: "All 8 wellbeing programs run in the last 6 months with status, dates, target audience, and participation stats.",
    columns: ["program_id", "name", "status", "start_date", "end_date", "duration_days", "target_audience", "total_enrolled", "completion_rate", "avg_satisfaction", "created_by"],
    rows: [
      { program_id: "P001", name: "Stress Reset Sprint", status: "completed", start_date: "2024-10-07", end_date: "2024-10-18", duration_days: "10", target_audience: "All employees", total_enrolled: "18", completion_rate: "78", avg_satisfaction: "4.2", created_by: "Grace Ong" },
      { program_id: "P002", name: "Gratitude Week", status: "completed", start_date: "2024-11-04", end_date: "2024-11-08", duration_days: "5", target_audience: "All employees", total_enrolled: "16", completion_rate: "81", avg_satisfaction: "4.6", created_by: "Sophie Laurent" },
      { program_id: "P003", name: "Hydration Sprint", status: "completed", start_date: "2024-11-18", end_date: "2024-11-22", duration_days: "5", target_audience: "Sales + Operations", total_enrolled: "9", completion_rate: "72", avg_satisfaction: "4.3", created_by: "Grace Ong" },
      { program_id: "P004", name: "Movement Break Challenge", status: "completed", start_date: "2024-12-02", end_date: "2024-12-13", duration_days: "10", target_audience: "Engineering + Operations", total_enrolled: "12", completion_rate: "85", avg_satisfaction: "4.5", created_by: "Emma Wilson" },
      { program_id: "P005", name: "Sleep Hygiene Week", status: "completed", start_date: "2025-01-13", end_date: "2025-01-17", duration_days: "5", target_audience: "Engineering", total_enrolled: "7", completion_rate: "64", avg_satisfaction: "3.8", created_by: "Fatima Al-Rashid" },
      { program_id: "P006", name: "Mindful Monday Series", status: "completed", start_date: "2025-02-03", end_date: "2025-03-03", duration_days: "28", target_audience: "All employees", total_enrolled: "15", completion_rate: "62", avg_satisfaction: "4.4", created_by: "Grace Ong" },
      { program_id: "P007", name: "Team Connection Sprint", status: "active", start_date: "2025-03-17", end_date: "2025-03-28", duration_days: "10", target_audience: "All employees", total_enrolled: "17", completion_rate: "45", avg_satisfaction: "4.1", created_by: "Sophie Laurent" },
      { program_id: "P008", name: "Q2 Energy Boost", status: "draft", start_date: "2025-04-14", end_date: "2025-04-25", duration_days: "10", target_audience: "All employees", total_enrolled: "0", completion_rate: "0", avg_satisfaction: "0", created_by: "Grace Ong" },
    ],
  },

  /* ═══════════════════════════════════════════════
     3. PROGRAM PARTICIPATION — who joined what, daily
     ═══════════════════════════════════════════════ */
  {
    key: "program-participation",
    name: "Program Participation",
    description: "Daily participation log: who did what activity on which day of each program.",
    columns: ["employee_id", "employee_name", "program_id", "program_name", "day", "activity_type", "activity_title", "completed", "time_spent_seconds", "date"],
    rows: [
      { employee_id: "E001", employee_name: "Alice Tan", program_id: "P001", program_name: "Stress Reset Sprint", day: "1", activity_type: "poll", activity_title: "Mood check pulse", completed: "yes", time_spent_seconds: "12", date: "2024-10-07" },
      { employee_id: "E001", employee_name: "Alice Tan", program_id: "P001", program_name: "Stress Reset Sprint", day: "3", activity_type: "game", activity_title: "Would you rather: wellness edition", completed: "yes", time_spent_seconds: "45", date: "2024-10-09" },
      { employee_id: "E001", employee_name: "Alice Tan", program_id: "P001", program_name: "Stress Reset Sprint", day: "5", activity_type: "survey", activity_title: "Wellbeing pulse", completed: "yes", time_spent_seconds: "90", date: "2024-10-11" },
      { employee_id: "E002", employee_name: "Carlos Rivera", program_id: "P001", program_name: "Stress Reset Sprint", day: "1", activity_type: "poll", activity_title: "Mood check pulse", completed: "yes", time_spent_seconds: "8", date: "2024-10-07" },
      { employee_id: "E002", employee_name: "Carlos Rivera", program_id: "P001", program_name: "Stress Reset Sprint", day: "3", activity_type: "game", activity_title: "Would you rather: wellness edition", completed: "no", time_spent_seconds: "0", date: "2024-10-09" },
      { employee_id: "E005", employee_name: "Mei Chen", program_id: "P004", program_name: "Movement Break Challenge", day: "1", activity_type: "poll", activity_title: "Energy check-in", completed: "yes", time_spent_seconds: "10", date: "2024-12-02" },
      { employee_id: "E005", employee_name: "Mei Chen", program_id: "P004", program_name: "Movement Break Challenge", day: "2", activity_type: "nudge", activity_title: "Take a 5-min walk", completed: "yes", time_spent_seconds: "300", date: "2024-12-03" },
      { employee_id: "E005", employee_name: "Mei Chen", program_id: "P004", program_name: "Movement Break Challenge", day: "5", activity_type: "game", activity_title: "Step counter this or that", completed: "yes", time_spent_seconds: "55", date: "2024-12-06" },
      { employee_id: "E008", employee_name: "Tom Nakamura", program_id: "P004", program_name: "Movement Break Challenge", day: "1", activity_type: "poll", activity_title: "Energy check-in", completed: "yes", time_spent_seconds: "15", date: "2024-12-02" },
      { employee_id: "E008", employee_name: "Tom Nakamura", program_id: "P004", program_name: "Movement Break Challenge", day: "5", activity_type: "game", activity_title: "Step counter this or that", completed: "no", time_spent_seconds: "0", date: "2024-12-06" },
      { employee_id: "E003", employee_name: "Fatima Al-Rashid", program_id: "P002", program_name: "Gratitude Week", day: "1", activity_type: "poll", activity_title: "Gratitude kick-off", completed: "yes", time_spent_seconds: "15", date: "2024-11-04" },
      { employee_id: "E003", employee_name: "Fatima Al-Rashid", program_id: "P002", program_name: "Gratitude Week", day: "3", activity_type: "game", activity_title: "Guess the fact: team edition", completed: "yes", time_spent_seconds: "60", date: "2024-11-06" },
      { employee_id: "E003", employee_name: "Fatima Al-Rashid", program_id: "P002", program_name: "Gratitude Week", day: "5", activity_type: "survey", activity_title: "Gratitude reflection", completed: "yes", time_spent_seconds: "120", date: "2024-11-08" },
      { employee_id: "E006", employee_name: "Raj Patel", program_id: "P003", program_name: "Hydration Sprint", day: "1", activity_type: "poll", activity_title: "Water intake baseline", completed: "yes", time_spent_seconds: "10", date: "2024-11-18" },
      { employee_id: "E006", employee_name: "Raj Patel", program_id: "P003", program_name: "Hydration Sprint", day: "3", activity_type: "game", activity_title: "Hydration this or that", completed: "yes", time_spent_seconds: "40", date: "2024-11-20" },
      { employee_id: "E014", employee_name: "Priya Sharma", program_id: "P007", program_name: "Team Connection Sprint", day: "1", activity_type: "poll", activity_title: "How connected do you feel?", completed: "yes", time_spent_seconds: "12", date: "2025-03-17" },
      { employee_id: "E014", employee_name: "Priya Sharma", program_id: "P007", program_name: "Team Connection Sprint", day: "3", activity_type: "game", activity_title: "Team trivia", completed: "yes", time_spent_seconds: "90", date: "2025-03-19" },
      { employee_id: "E017", employee_name: "Yuki Tanaka", program_id: "P007", program_name: "Team Connection Sprint", day: "1", activity_type: "poll", activity_title: "How connected do you feel?", completed: "yes", time_spent_seconds: "8", date: "2025-03-17" },
      { employee_id: "E017", employee_name: "Yuki Tanaka", program_id: "P007", program_name: "Team Connection Sprint", day: "2", activity_type: "nudge", activity_title: "Schedule a virtual coffee", completed: "no", time_spent_seconds: "0", date: "2025-03-18" },
    ],
  },

  /* ═══════════════════════════════════════════════
     4. POLL RESPONSES — raw mood/pulse poll data
     ═══════════════════════════════════════════════ */
  {
    key: "poll-responses",
    name: "Poll Responses",
    description: "Raw poll responses with mood scores (1-5), selected options, and timestamps from all programs.",
    columns: ["poll_id", "employee_id", "employee_name", "program_name", "question", "selected_option", "mood_score", "date"],
    rows: [
      { poll_id: "PL001", employee_id: "E001", employee_name: "Alice Tan", program_name: "Stress Reset Sprint", question: "How are you feeling right now?", selected_option: "Okay, could be better", mood_score: "3", date: "2024-10-07" },
      { poll_id: "PL002", employee_id: "E002", employee_name: "Carlos Rivera", program_name: "Stress Reset Sprint", question: "How are you feeling right now?", selected_option: "Running low today", mood_score: "2", date: "2024-10-07" },
      { poll_id: "PL003", employee_id: "E005", employee_name: "Mei Chen", program_name: "Stress Reset Sprint", question: "How are you feeling right now?", selected_option: "Great, full of energy", mood_score: "5", date: "2024-10-07" },
      { poll_id: "PL004", employee_id: "E008", employee_name: "Tom Nakamura", program_name: "Stress Reset Sprint", question: "How are you feeling right now?", selected_option: "Struggling a bit", mood_score: "2", date: "2024-10-07" },
      { poll_id: "PL005", employee_id: "E003", employee_name: "Fatima Al-Rashid", program_name: "Gratitude Week", question: "What are you grateful for today?", selected_option: "My team", mood_score: "5", date: "2024-11-04" },
      { poll_id: "PL006", employee_id: "E007", employee_name: "Sophie Laurent", program_name: "Gratitude Week", question: "What are you grateful for today?", selected_option: "Flexible work", mood_score: "4", date: "2024-11-04" },
      { poll_id: "PL007", employee_id: "E006", employee_name: "Raj Patel", program_name: "Hydration Sprint", question: "How many glasses of water today?", selected_option: "4-6 glasses", mood_score: "4", date: "2024-11-18" },
      { poll_id: "PL008", employee_id: "E004", employee_name: "James Park", program_name: "Hydration Sprint", question: "How many glasses of water today?", selected_option: "1-3 glasses", mood_score: "2", date: "2024-11-18" },
      { poll_id: "PL009", employee_id: "E005", employee_name: "Mei Chen", program_name: "Movement Break Challenge", question: "Did you take a movement break today?", selected_option: "Yes, 2+ breaks", mood_score: "5", date: "2024-12-02" },
      { poll_id: "PL010", employee_id: "E008", employee_name: "Tom Nakamura", program_name: "Movement Break Challenge", question: "Did you take a movement break today?", selected_option: "No, too busy", mood_score: "2", date: "2024-12-02" },
      { poll_id: "PL011", employee_id: "E014", employee_name: "Priya Sharma", program_name: "Team Connection Sprint", question: "How connected do you feel to your team?", selected_option: "Somewhat connected", mood_score: "3", date: "2025-03-17" },
      { poll_id: "PL012", employee_id: "E017", employee_name: "Yuki Tanaka", program_name: "Team Connection Sprint", question: "How connected do you feel to your team?", selected_option: "Very connected", mood_score: "4", date: "2025-03-17" },
      { poll_id: "PL013", employee_id: "E001", employee_name: "Alice Tan", program_name: "Mindful Monday Series", question: "How stressed are you today?", selected_option: "Moderate stress", mood_score: "3", date: "2025-02-03" },
      { poll_id: "PL014", employee_id: "E011", employee_name: "Bob Lim", program_name: "Mindful Monday Series", question: "How stressed are you today?", selected_option: "Low stress", mood_score: "4", date: "2025-02-03" },
      { poll_id: "PL015", employee_id: "E001", employee_name: "Alice Tan", program_name: "Mindful Monday Series", question: "How stressed are you today?", selected_option: "Low stress", mood_score: "4", date: "2025-02-10" },
    ],
  },

  /* ═══════════════════════════════════════════════
     5. SURVEY RESPONSES — detailed survey answers
     ═══════════════════════════════════════════════ */
  {
    key: "survey-responses",
    name: "Survey Responses",
    description: "Full survey answers with Likert scores, multiple choice selections, and open-text feedback across all programs.",
    columns: ["response_id", "employee_id", "employee_name", "program_name", "survey_name", "question", "question_type", "score", "selected_option", "open_feedback", "date"],
    rows: [
      { response_id: "SR01", employee_id: "E001", employee_name: "Alice Tan", program_name: "Stress Reset Sprint", survey_name: "Post-program reflection", question: "Did this program help you manage stress?", question_type: "likert", score: "4", selected_option: "", open_feedback: "The breathing exercises were surprisingly useful.", date: "2024-10-18" },
      { response_id: "SR02", employee_id: "E002", employee_name: "Carlos Rivera", program_name: "Stress Reset Sprint", survey_name: "Post-program reflection", question: "Did this program help you manage stress?", question_type: "likert", score: "3", selected_option: "", open_feedback: "It was okay but didn't fit my schedule well.", date: "2024-10-18" },
      { response_id: "SR03", employee_id: "E003", employee_name: "Fatima Al-Rashid", program_name: "Gratitude Week", survey_name: "Gratitude reflection", question: "Which part did you enjoy most?", question_type: "multiple_choice", score: "5", selected_option: "Team shout-outs", open_feedback: "Loved seeing recognition across departments.", date: "2024-11-08" },
      { response_id: "SR04", employee_id: "E005", employee_name: "Mei Chen", program_name: "Movement Break Challenge", survey_name: "Movement feedback", question: "Did you form a new habit?", question_type: "likert", score: "4", selected_option: "", open_feedback: "I actually take walks now during lunch. Game changer.", date: "2024-12-13" },
      { response_id: "SR05", employee_id: "E008", employee_name: "Tom Nakamura", program_name: "Movement Break Challenge", survey_name: "Movement feedback", question: "What would you improve?", question_type: "open_text", score: "3", selected_option: "", open_feedback: "The reminders were too frequent. 3x/day is enough.", date: "2024-12-13" },
      { response_id: "SR06", employee_id: "E006", employee_name: "Raj Patel", program_name: "Hydration Sprint", survey_name: "Hydration wrap-up", question: "Did the team leaderboard motivate you?", question_type: "likert", score: "5", selected_option: "", open_feedback: "Having a team leaderboard made it fun and competitive.", date: "2024-11-22" },
      { response_id: "SR07", employee_id: "E014", employee_name: "Priya Sharma", program_name: "Sleep Hygiene Week", survey_name: "Sleep habits check", question: "Did your sleep improve?", question_type: "likert", score: "3", selected_option: "", open_feedback: "Hard to change sleep habits in just 5 days.", date: "2025-01-17" },
      { response_id: "SR08", employee_id: "E001", employee_name: "Alice Tan", program_name: "Mindful Monday Series", survey_name: "Mindfulness reflection", question: "How often did you practice mindfulness?", question_type: "multiple_choice", score: "4", selected_option: "2-3 times per week", open_feedback: "The Monday prompts became part of my routine.", date: "2025-03-03" },
      { response_id: "SR09", employee_id: "E013", employee_name: "Grace Ong", program_name: "Mindful Monday Series", survey_name: "Mindfulness reflection", question: "Would you recommend this to colleagues?", question_type: "likert", score: "5", selected_option: "", open_feedback: "Best program we've run. Everyone should try this.", date: "2025-03-03" },
      { response_id: "SR10", employee_id: "E004", employee_name: "James Park", program_name: "Stress Reset Sprint", survey_name: "Post-program reflection", question: "What would make this program better?", question_type: "open_text", score: "3", selected_option: "", open_feedback: "Need more options for onsite workers. Most activities assumed remote.", date: "2024-10-18" },
    ],
  },

  /* ═══════════════════════════════════════════════
     6. GAME SESSIONS — game completions and scores
     ═══════════════════════════════════════════════ */
  {
    key: "game-sessions",
    name: "Game Sessions",
    description: "Game activity log: which games employees played, scores, completion status, and time spent.",
    columns: ["session_id", "employee_id", "employee_name", "program_name", "game_type", "game_title", "score", "max_score", "completed", "time_spent_seconds", "date"],
    rows: [
      { session_id: "GS01", employee_id: "E001", employee_name: "Alice Tan", program_name: "Stress Reset Sprint", game_type: "would_you_rather", game_title: "Would you rather: wellness edition", score: "8", max_score: "10", completed: "yes", time_spent_seconds: "45", date: "2024-10-09" },
      { session_id: "GS02", employee_id: "E005", employee_name: "Mei Chen", program_name: "Stress Reset Sprint", game_type: "would_you_rather", game_title: "Would you rather: wellness edition", score: "9", max_score: "10", completed: "yes", time_spent_seconds: "38", date: "2024-10-09" },
      { session_id: "GS03", employee_id: "E003", employee_name: "Fatima Al-Rashid", program_name: "Gratitude Week", game_type: "guess_the_fact", game_title: "Guess the fact: team edition", score: "6", max_score: "8", completed: "yes", time_spent_seconds: "65", date: "2024-11-06" },
      { session_id: "GS04", employee_id: "E007", employee_name: "Sophie Laurent", program_name: "Gratitude Week", game_type: "guess_the_fact", game_title: "Guess the fact: team edition", score: "7", max_score: "8", completed: "yes", time_spent_seconds: "58", date: "2024-11-06" },
      { session_id: "GS05", employee_id: "E006", employee_name: "Raj Patel", program_name: "Hydration Sprint", game_type: "this_or_that", game_title: "Hydration this or that", score: "5", max_score: "6", completed: "yes", time_spent_seconds: "30", date: "2024-11-20" },
      { session_id: "GS06", employee_id: "E005", employee_name: "Mei Chen", program_name: "Movement Break Challenge", game_type: "tap_challenge", game_title: "Step counter tap challenge", score: "142", max_score: "200", completed: "yes", time_spent_seconds: "55", date: "2024-12-06" },
      { session_id: "GS07", employee_id: "E008", employee_name: "Tom Nakamura", program_name: "Movement Break Challenge", game_type: "tap_challenge", game_title: "Step counter tap challenge", score: "0", max_score: "200", completed: "no", time_spent_seconds: "0", date: "2024-12-06" },
      { session_id: "GS08", employee_id: "E014", employee_name: "Priya Sharma", program_name: "Team Connection Sprint", game_type: "trivia", game_title: "Team trivia", score: "12", max_score: "15", completed: "yes", time_spent_seconds: "90", date: "2025-03-19" },
      { session_id: "GS09", employee_id: "E017", employee_name: "Yuki Tanaka", program_name: "Team Connection Sprint", game_type: "trivia", game_title: "Team trivia", score: "10", max_score: "15", completed: "yes", time_spent_seconds: "85", date: "2025-03-19" },
      { session_id: "GS10", employee_id: "E001", employee_name: "Alice Tan", program_name: "Team Connection Sprint", game_type: "trivia", game_title: "Team trivia", score: "14", max_score: "15", completed: "yes", time_spent_seconds: "72", date: "2025-03-19" },
    ],
  },

  /* ═══════════════════════════════════════════════
     7. DAILY ACTIVITY — per-employee daily engagement
     ═══════════════════════════════════════════════ */
  {
    key: "daily-activity",
    name: "Daily Activity",
    description: "Daily engagement metrics per employee: activities completed, time spent, nudges received, and streak count.",
    columns: ["employee_id", "employee_name", "date", "activities_completed", "time_spent_minutes", "nudges_received", "nudges_acted_on", "streak_days", "active_program"],
    rows: [
      { employee_id: "E001", employee_name: "Alice Tan", date: "2025-03-17", activities_completed: "2", time_spent_minutes: "8", nudges_received: "3", nudges_acted_on: "2", streak_days: "5", active_program: "Team Connection Sprint" },
      { employee_id: "E001", employee_name: "Alice Tan", date: "2025-03-18", activities_completed: "1", time_spent_minutes: "3", nudges_received: "2", nudges_acted_on: "1", streak_days: "6", active_program: "Team Connection Sprint" },
      { employee_id: "E001", employee_name: "Alice Tan", date: "2025-03-19", activities_completed: "2", time_spent_minutes: "12", nudges_received: "2", nudges_acted_on: "2", streak_days: "7", active_program: "Team Connection Sprint" },
      { employee_id: "E005", employee_name: "Mei Chen", date: "2025-03-17", activities_completed: "1", time_spent_minutes: "5", nudges_received: "3", nudges_acted_on: "1", streak_days: "3", active_program: "Team Connection Sprint" },
      { employee_id: "E005", employee_name: "Mei Chen", date: "2025-03-18", activities_completed: "0", time_spent_minutes: "0", nudges_received: "2", nudges_acted_on: "0", streak_days: "0", active_program: "Team Connection Sprint" },
      { employee_id: "E014", employee_name: "Priya Sharma", date: "2025-03-17", activities_completed: "1", time_spent_minutes: "4", nudges_received: "2", nudges_acted_on: "2", streak_days: "1", active_program: "Team Connection Sprint" },
      { employee_id: "E014", employee_name: "Priya Sharma", date: "2025-03-18", activities_completed: "1", time_spent_minutes: "6", nudges_received: "3", nudges_acted_on: "2", streak_days: "2", active_program: "Team Connection Sprint" },
      { employee_id: "E014", employee_name: "Priya Sharma", date: "2025-03-19", activities_completed: "2", time_spent_minutes: "15", nudges_received: "2", nudges_acted_on: "2", streak_days: "3", active_program: "Team Connection Sprint" },
      { employee_id: "E008", employee_name: "Tom Nakamura", date: "2025-03-17", activities_completed: "1", time_spent_minutes: "3", nudges_received: "3", nudges_acted_on: "0", streak_days: "1", active_program: "Team Connection Sprint" },
      { employee_id: "E008", employee_name: "Tom Nakamura", date: "2025-03-18", activities_completed: "0", time_spent_minutes: "0", nudges_received: "2", nudges_acted_on: "0", streak_days: "0", active_program: "Team Connection Sprint" },
      { employee_id: "E002", employee_name: "Carlos Rivera", date: "2025-03-17", activities_completed: "1", time_spent_minutes: "2", nudges_received: "2", nudges_acted_on: "1", streak_days: "1", active_program: "Team Connection Sprint" },
      { employee_id: "E002", employee_name: "Carlos Rivera", date: "2025-03-19", activities_completed: "1", time_spent_minutes: "8", nudges_received: "3", nudges_acted_on: "2", streak_days: "1", active_program: "Team Connection Sprint" },
    ],
  },

  /* ═══════════════════════════════════════════════
     8. COMMS SENT — actual messages sent with performance
     ═══════════════════════════════════════════════ */
  {
    key: "comms-sent",
    name: "Comms Sent",
    description: "All communications sent for programs: channel, timing, open/click rates, and actual message copy.",
    columns: ["comms_id", "program_name", "phase", "channel", "send_date", "send_time", "subject", "recipients", "open_rate", "click_rate", "purpose"],
    rows: [
      { comms_id: "CM01", program_name: "Stress Reset Sprint", phase: "before", channel: "email", send_date: "2024-10-04", send_time: "09:00", subject: "Your Stress Reset Sprint starts Monday", recipients: "20", open_rate: "85", click_rate: "42", purpose: "launch framing" },
      { comms_id: "CM02", program_name: "Stress Reset Sprint", phase: "before", channel: "whatsapp", send_date: "2024-10-06", send_time: "10:00", subject: "Quick pulse before we start", recipients: "20", open_rate: "96", click_rate: "71", purpose: "pre-program survey invite" },
      { comms_id: "CM03", program_name: "Stress Reset Sprint", phase: "during", channel: "slack", send_date: "2024-10-09", send_time: "09:30", subject: "Midweek check-in: how's the sprint?", recipients: "18", open_rate: "89", click_rate: "38", purpose: "midweek nudge" },
      { comms_id: "CM04", program_name: "Stress Reset Sprint", phase: "during", channel: "browser_extension", send_date: "2024-10-11", send_time: "14:00", subject: "Time for a 2-min breathing break", recipients: "18", open_rate: "68", click_rate: "29", purpose: "ambient reminder" },
      { comms_id: "CM05", program_name: "Stress Reset Sprint", phase: "after", channel: "email", send_date: "2024-10-19", send_time: "10:00", subject: "Stress Reset Sprint wrap-up", recipients: "18", open_rate: "78", click_rate: "31", purpose: "wrap-up summary" },
      { comms_id: "CM06", program_name: "Gratitude Week", phase: "before", channel: "email", send_date: "2024-11-01", send_time: "09:00", subject: "Gratitude Week starts Monday!", recipients: "20", open_rate: "82", click_rate: "45", purpose: "launch framing" },
      { comms_id: "CM07", program_name: "Gratitude Week", phase: "during", channel: "slack", send_date: "2024-11-06", send_time: "09:00", subject: "Who are you grateful for today?", recipients: "16", open_rate: "92", click_rate: "55", purpose: "engagement prompt" },
      { comms_id: "CM08", program_name: "Gratitude Week", phase: "after", channel: "whatsapp", send_date: "2024-11-09", send_time: "11:00", subject: "Thanks for a great Gratitude Week!", recipients: "16", open_rate: "97", click_rate: "48", purpose: "thank you + highlights" },
      { comms_id: "CM09", program_name: "Movement Break Challenge", phase: "before", channel: "email", send_date: "2024-11-29", send_time: "09:00", subject: "Movement Break Challenge starts Dec 2", recipients: "14", open_rate: "80", click_rate: "38", purpose: "launch framing" },
      { comms_id: "CM10", program_name: "Movement Break Challenge", phase: "during", channel: "browser_extension", send_date: "2024-12-05", send_time: "14:30", subject: "Stand up and stretch for 2 minutes", recipients: "12", open_rate: "71", click_rate: "34", purpose: "ambient nudge" },
      { comms_id: "CM11", program_name: "Team Connection Sprint", phase: "before", channel: "email", send_date: "2024-03-14", send_time: "09:00", subject: "Team Connection Sprint kicks off Monday", recipients: "20", open_rate: "84", click_rate: "40", purpose: "launch framing" },
      { comms_id: "CM12", program_name: "Team Connection Sprint", phase: "during", channel: "slack", send_date: "2025-03-19", send_time: "09:30", subject: "Time for team trivia! Join now", recipients: "17", open_rate: "91", click_rate: "62", purpose: "game participation prompt" },
    ],
  },

  /* ═══════════════════════════════════════════════
     9. CHANNEL EFFECTIVENESS — aggregated channel metrics
     ═══════════════════════════════════════════════ */
  {
    key: "channel-effectiveness",
    name: "Channel Effectiveness",
    description: "Aggregated message performance by channel, phase, and objective across 6 months of HR campaigns.",
    columns: ["phase", "channel", "objective", "total_sent", "avg_open_rate", "avg_click_rate", "avg_response_rate"],
    rows: [
      { phase: "before", channel: "email", objective: "launch framing", total_sent: "8", avg_open_rate: "83", avg_click_rate: "41", avg_response_rate: "0" },
      { phase: "before", channel: "whatsapp", objective: "survey invite", total_sent: "4", avg_open_rate: "96", avg_click_rate: "69", avg_response_rate: "54" },
      { phase: "before", channel: "slack", objective: "teaser nudge", total_sent: "3", avg_open_rate: "90", avg_click_rate: "44", avg_response_rate: "12" },
      { phase: "during", channel: "slack", objective: "midweek nudge", total_sent: "12", avg_open_rate: "88", avg_click_rate: "42", avg_response_rate: "32" },
      { phase: "during", channel: "browser_extension", objective: "ambient reminder", total_sent: "8", avg_open_rate: "70", avg_click_rate: "30", avg_response_rate: "8" },
      { phase: "during", channel: "whatsapp", objective: "participation prompt", total_sent: "5", avg_open_rate: "95", avg_click_rate: "61", avg_response_rate: "48" },
      { phase: "during", channel: "teams", objective: "live poll", total_sent: "4", avg_open_rate: "82", avg_click_rate: "56", avg_response_rate: "51" },
      { phase: "after", channel: "email", objective: "wrap-up summary", total_sent: "7", avg_open_rate: "78", avg_click_rate: "30", avg_response_rate: "18" },
      { phase: "after", channel: "whatsapp", objective: "thank you + highlights", total_sent: "4", avg_open_rate: "95", avg_click_rate: "43", avg_response_rate: "28" },
      { phase: "after", channel: "slack", objective: "highlight reel", total_sent: "5", avg_open_rate: "86", avg_click_rate: "35", avg_response_rate: "15" },
    ],
  },

  /* ═══════════════════════════════════════════════
     10. EMPLOYEE ENGAGEMENT — quarterly department scores
     ═══════════════════════════════════════════════ */
  {
    key: "employee-engagement",
    name: "Employee Engagement",
    description: "3 quarters of engagement scores by department: satisfaction, motivation, retention risk, and eNPS trend.",
    columns: ["quarter", "department", "headcount", "satisfaction_score", "motivation_score", "retention_risk", "eNPS", "response_rate", "programs_participated"],
    rows: [
      { quarter: "Q1 2025", department: "Engineering", headcount: "7", satisfaction_score: "3.9", motivation_score: "4.1", retention_risk: "low", eNPS: "42", response_rate: "88", programs_participated: "6" },
      { quarter: "Q1 2025", department: "Sales", headcount: "5", satisfaction_score: "3.5", motivation_score: "3.7", retention_risk: "medium", eNPS: "28", response_rate: "76", programs_participated: "4" },
      { quarter: "Q1 2025", department: "People", headcount: "4", satisfaction_score: "4.3", motivation_score: "4.4", retention_risk: "low", eNPS: "56", response_rate: "95", programs_participated: "7" },
      { quarter: "Q1 2025", department: "Operations", headcount: "4", satisfaction_score: "3.7", motivation_score: "3.8", retention_risk: "medium", eNPS: "32", response_rate: "82", programs_participated: "5" },
      { quarter: "Q4 2024", department: "Engineering", headcount: "6", satisfaction_score: "3.6", motivation_score: "3.8", retention_risk: "medium", eNPS: "35", response_rate: "85", programs_participated: "4" },
      { quarter: "Q4 2024", department: "Sales", headcount: "4", satisfaction_score: "3.3", motivation_score: "3.5", retention_risk: "high", eNPS: "18", response_rate: "71", programs_participated: "3" },
      { quarter: "Q4 2024", department: "People", headcount: "3", satisfaction_score: "4.1", motivation_score: "4.2", retention_risk: "low", eNPS: "52", response_rate: "92", programs_participated: "5" },
      { quarter: "Q4 2024", department: "Operations", headcount: "3", satisfaction_score: "3.5", motivation_score: "3.6", retention_risk: "medium", eNPS: "25", response_rate: "78", programs_participated: "3" },
      { quarter: "Q3 2024", department: "Engineering", headcount: "5", satisfaction_score: "3.4", motivation_score: "3.5", retention_risk: "high", eNPS: "22", response_rate: "80", programs_participated: "2" },
      { quarter: "Q3 2024", department: "Sales", headcount: "4", satisfaction_score: "3.1", motivation_score: "3.3", retention_risk: "high", eNPS: "12", response_rate: "68", programs_participated: "1" },
      { quarter: "Q3 2024", department: "People", headcount: "3", satisfaction_score: "3.9", motivation_score: "4.0", retention_risk: "low", eNPS: "48", response_rate: "90", programs_participated: "3" },
      { quarter: "Q3 2024", department: "Operations", headcount: "3", satisfaction_score: "3.3", motivation_score: "3.4", retention_risk: "high", eNPS: "18", response_rate: "72", programs_participated: "1" },
    ],
  },

  /* ═══════════════════════════════════════════════
     11. FEATURE USAGE — product analytics
     ═══════════════════════════════════════════════ */
  {
    key: "feature-usage",
    name: "Feature Usage",
    description: "Product analytics: which Bokchoys features employees use, completion rates, time spent, and satisfaction.",
    columns: ["feature", "department", "monthly_active_users", "avg_completions_per_user", "avg_time_seconds", "satisfaction_rating", "month"],
    rows: [
      { feature: "polls", department: "Engineering", monthly_active_users: "45", avg_completions_per_user: "3.2", avg_time_seconds: "15", satisfaction_rating: "4.1", month: "2025-03" },
      { feature: "surveys", department: "Engineering", monthly_active_users: "38", avg_completions_per_user: "1.8", avg_time_seconds: "120", satisfaction_rating: "3.6", month: "2025-03" },
      { feature: "games", department: "Engineering", monthly_active_users: "32", avg_completions_per_user: "2.1", avg_time_seconds: "60", satisfaction_rating: "4.3", month: "2025-03" },
      { feature: "polls", department: "Sales", monthly_active_users: "41", avg_completions_per_user: "2.8", avg_time_seconds: "12", satisfaction_rating: "4.0", month: "2025-03" },
      { feature: "games", department: "Sales", monthly_active_users: "52", avg_completions_per_user: "4.5", avg_time_seconds: "45", satisfaction_rating: "4.5", month: "2025-03" },
      { feature: "nudges", department: "People", monthly_active_users: "28", avg_completions_per_user: "6.1", avg_time_seconds: "8", satisfaction_rating: "3.9", month: "2025-03" },
      { feature: "browser_extension", department: "Operations", monthly_active_users: "15", avg_completions_per_user: "2.3", avg_time_seconds: "10", satisfaction_rating: "3.4", month: "2025-03" },
      { feature: "polls", department: "Engineering", monthly_active_users: "40", avg_completions_per_user: "2.9", avg_time_seconds: "14", satisfaction_rating: "4.0", month: "2025-02" },
      { feature: "games", department: "Sales", monthly_active_users: "48", avg_completions_per_user: "4.1", avg_time_seconds: "42", satisfaction_rating: "4.4", month: "2025-02" },
      { feature: "surveys", department: "People", monthly_active_users: "22", avg_completions_per_user: "2.0", avg_time_seconds: "130", satisfaction_rating: "3.8", month: "2025-02" },
    ],
  },

  /* ═══════════════════════════════════════════════
     12. WELLBEING PULSE — quarterly pulse survey
     ═══════════════════════════════════════════════ */
  {
    key: "wellbeing-pulse",
    name: "Wellbeing Pulse",
    description: "Quarterly pulse survey scores across 4 teams over 3 quarters: stress, energy, belonging, manager support.",
    columns: ["quarter", "team", "stress_score", "energy_score", "belonging_score", "manager_support_score", "response_count", "top_concern"],
    rows: [
      { quarter: "Q1 2025", team: "People", stress_score: "3.1", energy_score: "4.2", belonging_score: "4.5", manager_support_score: "4.6", response_count: "22", top_concern: "Workload balance" },
      { quarter: "Q1 2025", team: "Engineering", stress_score: "3.7", energy_score: "3.8", belonging_score: "4.0", manager_support_score: "4.1", response_count: "57", top_concern: "Sprint deadline pressure" },
      { quarter: "Q1 2025", team: "Sales", stress_score: "3.9", energy_score: "3.9", belonging_score: "4.1", manager_support_score: "4.0", response_count: "31", top_concern: "Target pressure" },
      { quarter: "Q1 2025", team: "Operations", stress_score: "3.4", energy_score: "4.1", belonging_score: "4.3", manager_support_score: "4.4", response_count: "28", top_concern: "Process bottlenecks" },
      { quarter: "Q4 2024", team: "People", stress_score: "3.3", energy_score: "4.0", belonging_score: "4.3", manager_support_score: "4.5", response_count: "20", top_concern: "Year-end fatigue" },
      { quarter: "Q4 2024", team: "Engineering", stress_score: "3.9", energy_score: "3.5", belonging_score: "3.8", manager_support_score: "3.9", response_count: "52", top_concern: "Remote isolation" },
      { quarter: "Q4 2024", team: "Sales", stress_score: "4.1", energy_score: "3.6", belonging_score: "3.9", manager_support_score: "3.7", response_count: "29", top_concern: "Quarter-end crunch" },
      { quarter: "Q4 2024", team: "Operations", stress_score: "3.6", energy_score: "3.9", belonging_score: "4.1", manager_support_score: "4.2", response_count: "26", top_concern: "Understaffing" },
      { quarter: "Q3 2024", team: "People", stress_score: "3.5", energy_score: "3.8", belonging_score: "4.1", manager_support_score: "4.3", response_count: "19", top_concern: "Role clarity" },
      { quarter: "Q3 2024", team: "Engineering", stress_score: "4.0", energy_score: "3.4", belonging_score: "3.6", manager_support_score: "3.7", response_count: "48", top_concern: "Burnout risk" },
      { quarter: "Q3 2024", team: "Sales", stress_score: "4.2", energy_score: "3.5", belonging_score: "3.7", manager_support_score: "3.5", response_count: "27", top_concern: "Team turnover" },
      { quarter: "Q3 2024", team: "Operations", stress_score: "3.8", energy_score: "3.7", belonging_score: "4.0", manager_support_score: "4.0", response_count: "24", top_concern: "Cross-team coordination" },
    ],
  },
];

export function getSampleDatasetDefinition(key: string) {
  return SAMPLE_DATASETS.find((dataset) => dataset.key === key);
}
