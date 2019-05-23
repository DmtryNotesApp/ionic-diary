export class Case {
    constructor(
      public id: number,
      public caseDate: Date,
      public isFinished: boolean,
      public description?: string,
      public caseDateTime?: Date
    ) {}
}