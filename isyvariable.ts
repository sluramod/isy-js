import {ISYSetVariableSender} from "./index";
import {ISYCallback} from "./isynode";

export type ISYGetVariableCallback = (value: number|undefined, init: number|undefined) => void

export class ISYVariable {
    isy: ISYSetVariableSender
    id: string
    name: string
    type: string
    init: number|undefined
    value: number|undefined
    lastChanged: Date

    constructor(isy: ISYSetVariableSender, id:string, name:string, type:string) {
        this.isy = isy;
        this.id = id;
        this.name = name;
        this.value = undefined;
        this.init = undefined;
        this.type = type;
        this.lastChanged = new Date();

        this.markAsChanged = this.markAsChanged.bind(this);
    }

    markAsChanged() {
        this.lastChanged = new Date();
    }

    sendSetValue(value:string, onComplete:ISYCallback) {
        this.isy.sendSetVariable(this.id, this.type, value, (success) => {
            onComplete(success);
        });
    }
}
