import { ISYSetVariableSender } from "./isy";
import { ISYCallback } from "./isynode";
export declare type ISYGetVariableCallback = (value: number | undefined, init: number | undefined) => void;
export declare class ISYVariable {
    isy: ISYSetVariableSender;
    id: string;
    name: string;
    type: string;
    init: number | undefined;
    value: number | undefined;
    lastChanged: Date;
    constructor(isy: ISYSetVariableSender, id: string, name: string, type: string);
    markAsChanged(): void;
    sendSetValue(value: string, onComplete: ISYCallback): void;
}
