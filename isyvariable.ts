import {ISYSetVariableSender} from "./index";
import {ISYCallback} from "./isynode";

export type ISYGetVariableCallback = (value: number|undefined, init: number|undefined) => void

export class ISYVariable {
    init: number|undefined
    value: number|undefined
    lastChanged: Date

    constructor(public isy: ISYSetVariableSender, public id:string, public name:string, public type:string) {
        this.value = undefined;
        this.init = undefined;
        this.lastChanged = new Date();
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
