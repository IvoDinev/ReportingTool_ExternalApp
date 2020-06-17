import { ProjectOverview } from './project-overview';

export interface ProjectDetailedReport {
    overview: ProjectOverview;
    members: number;
    createdTasks: number;
    finishedTasks: number;
    inProgressTasks: number;
    avgDaysPerTask: number;
    avgCompletedSprintTasks: number;
    completedPlannedTasksSprint: number;
}
