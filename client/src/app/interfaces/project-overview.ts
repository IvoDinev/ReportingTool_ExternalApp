export class ProjectOverview {
    constructor(
        public name: string,
        public fixVersion: string,
        public completedEpics: number,
        public start: Date,
        public plannedEnd: Date,
        public estimatedEnd: Date,
        public bugsRatio: string,
        public status: string
    ) {}
}
