import {ISYNode, ISYNodeProperties} from "./isynode";
import {ISYConnectionType, ISYDeviceType} from "./isydevice";
import {ISYRestCommandSender} from "./index";

export class ISYNodeServerNode implements ISYNode {

    deviceFriendlyName: string

    batteryOperated: boolean
    connectionType: ISYConnectionType

    updatedProperty?: string

    properties: ISYNodeProperties

    lastChanged: Date

    get currentState(): number {
        return this.properties['currentState']
    }

    set currentState(value: number) {
        this.properties['currentState'] = value;
    }

    get currentState_f(): number | string {
        return this.properties['currentState_f']
    }

    set currentState_f(value: number | string) {
        this.properties['currentState_f'] = value;
    }

    constructor(public isy: ISYRestCommandSender, public name: string, public address: string, public deviceType: ISYDeviceType, public nodeSlot: string, public parentNode: ISYNode, public nodeDefId: string) {
        this.deviceFriendlyName = 'ISYv5 Node Server Device';
        this.batteryOperated = false;
        this.connectionType = 'ISYv5 Node Server';
        this.currentState = 0;
        this.currentState_f = 0;
        this.properties = {}
        this.lastChanged = new Date();
    }

    handleIsyUpdate(actionValue: string | number, formatted: string | number | undefined = undefined) {
        if (Number(actionValue) != this.currentState) {
            this.currentState = Number(actionValue);
            this.currentState_f = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.markAsChanged();
            return true;
        } else {
            return false;
        }
    }

    handleIsyGenericPropertyUpdate(actionValue: string | number, prop: string, formatted: string | number | undefined = undefined) {
        if (Number(actionValue) != this.properties[prop]) {
            this.properties[prop] = isNaN(Number(actionValue)) ? actionValue : Number(actionValue);
            this.properties[prop + "_f"] = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.markAsChanged();
            this.updatedProperty = prop;
            return true;
        } else {
            return false;
        }
    }

    getGenericProperty(prop: string) {
        return (this.properties[prop]);
    }

    markAsChanged() {
        this.lastChanged = new Date();
    }

    /*
        getFormattedStatus() {
            let responseRaw = this;
            delete responseRaw.isy;
            return JSON.stringify(responseRaw, undefined, 3);
        }
    */
}
