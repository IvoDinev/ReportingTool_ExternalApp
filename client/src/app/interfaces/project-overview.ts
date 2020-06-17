export interface ProjectOverview {
    name: string;
    fixVersion: string;
    completedEpics: number;
    start: Date;
    plannedEnd: Date;
    estimatedEnd: Date;
    scheduleVariance: string;
    bugsRatio: number;
    status: string;
}
