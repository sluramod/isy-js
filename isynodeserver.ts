import {ISYNode, ISYNodeProperties} from "./isynode";
import {ISYConnectionType, ISYDeviceType} from "./isydevice";

export class ISYNodeServerNode implements ISYNode {

    isy: object

    name: string
    address: string
    deviceType: ISYDeviceType
    deviceFriendlyName: string
    currentState: number
    currentState_f: string | number

    batteryOperated: boolean
    connectionType: ISYConnectionType

    nodeSlot: string
    parentNode: ISYNode
    nodeDefId: string

    updatedProperty: string | undefined

    properties: ISYNodeProperties

    lastChanged: Date


    constructor(isy: object, name: string, address: string, deviceType: ISYDeviceType, nodeSlot: string, parentNode: ISYNode, nodeDefId: string) {
        this.isy = isy;
        this.name = name;
        this.address = address;
        this.deviceType = deviceType;
        this.nodeSlot = nodeSlot;
        this.parentNode = parentNode;
        this.nodeDefId = nodeDefId;
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
            this.lastChanged = new Date();
            return true;
        } else {
            return false;
        }
    }

    handleIsyGenericPropertyUpdate(actionValue: string | number, prop: string, formatted: string | number | undefined = undefined) {
        if (Number(actionValue) != this.properties[prop]) {
            this.properties[prop] = isNaN(Number(actionValue)) ? actionValue : Number(actionValue);
            this.properties[prop + "_f"] = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.lastChanged = new Date();
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

    getFormattedStatus() {
        let responseRaw = this;
        delete responseRaw.isy;
        return JSON.stringify(responseRaw, undefined, 3);
    }
}
