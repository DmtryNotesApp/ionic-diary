export class DiaryEvent {
    constructor(public id: number, public eventDate: Date, public isDone: boolean, public description?: string) {

    }
}