import { ISYNode, ISYNodeProperties } from "./isynode";
import { ISYConnectionType, ISYDeviceType } from "./isydevice";
import { ISYRestCommandSender } from "./index";
export declare class ISYNodeServerNode implements ISYNode {
    isy: ISYRestCommandSender;
    name: string;
    address: string;
    deviceType: ISYDeviceType;
    nodeSlot: string;
    parentNode: ISYNode;
    nodeDefId: string;
    deviceFriendlyName: string;
    batteryOperated: boolean;
    connectionType: ISYConnectionType;
    updatedProperty?: string;
    properties: ISYNodeProperties;
    lastChanged: Date;
    currentState: number;
    currentState_f: number | string;
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceType: ISYDeviceType, nodeSlot: string, parentNode: ISYNode, nodeDefId: string);
    handleIsyUpdate(actionValue: string | number, formatted?: string | number | undefined): boolean;
    handleIsyGenericPropertyUpdate(actionValue: string | number, prop: string, formatted?: string | number | undefined): boolean;
    getGenericProperty(prop: string): any;
    markAsChanged(): void;
}
