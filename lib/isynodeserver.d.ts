import { ISYNode, ISYNodeProperties } from "./isynode";
import { ISYConnectionType, ISYDeviceType } from "./isydevice";
export declare class ISYNodeServerNode implements ISYNode {
    isy: object;
    name: string;
    address: string;
    deviceType: ISYDeviceType;
    deviceFriendlyName: string;
    currentState: number;
    currentState_f: string | number;
    batteryOperated: boolean;
    connectionType: ISYConnectionType;
    nodeSlot: string;
    parentNode: ISYNode;
    nodeDefId: string;
    updatedProperty: string | undefined;
    properties: ISYNodeProperties;
    lastChanged: Date;
    constructor(isy: object, name: string, address: string, deviceType: ISYDeviceType, nodeSlot: string, parentNode: ISYNode, nodeDefId: string);
    handleIsyUpdate(actionValue: string | number, formatted?: string | number | undefined): boolean;
    handleIsyGenericPropertyUpdate(actionValue: string | number, prop: string, formatted?: string | number | undefined): boolean;
    getGenericProperty(prop: string): any;
    markAsChanged(): void;
    getFormattedStatus(): string;
}
