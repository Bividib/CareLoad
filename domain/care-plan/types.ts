export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type Frequency = "DAILY" | "TWICE_DAILY" | "SELECTED_WEEKDAYS" | "WEEKLY" | "ONE_OFF" | "DATE_LIMITED";

export type PlannerTask = {
  id: string; title: string; frequency: Frequency; weekdays?: Weekday[];
  startDate?: string; endDate?: string; windowStart: string; windowEnd: string;
  fixedTime?: string; durationMinutes: number; mayMove: boolean; mayDelegate: boolean;
  requiredLocation?: string; requiredEquipment?: string; bundleGroup?: string;
};
export type PlannerAnchor = { id: string; title: string; date?: string; weekdays: Weekday[]; startTime: string; endTime: string; protected: boolean; location?: string };
export type PlannerSupport = { id: string; name: string; mayCollectPrescription: boolean; availability: string };
export type PlannerInput = { rangeStart: string; rangeEnd: string; tasks: PlannerTask[]; anchors: PlannerAnchor[]; preferences: string[]; frictions: string[]; supportPeople: PlannerSupport[]; appointments?: PlannerTask[] };
export type Occurrence = { id: string; task: PlannerTask; date: string; ordinal: number };
export type ScheduledOccurrence = { id: string; taskId: string; title: string; date: string; startTime: string; endTime: string; momentId: string; momentTitle: string; explanation: string; delegatedTo?: string };
export type UnplacedOccurrence = { taskId: string; occurrenceDate: string; status: "NEEDS_CLARIFICATION"; reason: string; violatedConstraints: string[]; suggestedClarification: string };
export type PlannerConflict = { taskId: string; date: string; type: "PROTECTED_ANCHOR_OVERLAP" | "LOCATION_CONFLICT"; explanation: string };
export type PlannerMetrics = { totalActions: number; totalCareMinutes: number; totalCareMoments: number; separateInterruptions: number; tasksOverlappingWork: number; familyConflicts: number; locationConflicts: number; bundledTaskCount: number; delegatedTaskCount: number; unplacedTaskCount: number };
export type PlannerResult = { scheduled: ScheduledOccurrence[]; unplaced: UnplacedOccurrence[]; conflicts: PlannerConflict[]; metrics: PlannerMetrics; explanations: string[] };
