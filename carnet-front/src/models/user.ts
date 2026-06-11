import type { Entry } from "./carnet";

export class User {
    id: number = 0;
    username: string = '';
    carnets: Entry[] = []
}
