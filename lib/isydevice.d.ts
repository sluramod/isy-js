import { ISYRestCommandSender } from "./index";
import { ISYCallback, ISYDeviceInfo, ISYNode, ISYNodeProperties } from "./isynode";
export declare const ISYDeviceTypes: Map<string, any>;
export declare type ISYDeviceType = "lock" | "secureLock" | "light" | "dimmableLight" | "outlet" | "fan" | "unknown" | "doorWindowSensor" | "alarmDoorWindowSensor" | "coSensor" | "alarmPanel" | "motionSensor" | "leakSensor" | "remote" | "scene" | "thermostat" | "nodeServerNode";
export declare type ISYType = string;
export declare type ISYConnectionType = string;
export declare class ISYBaseDevice implements ISYNode {
    isy: ISYRestCommandSender;
    name: string;
    address: string;
    isyType: ISYType;
    deviceType: ISYDeviceType;
    batteryOperated: boolean;
    connectionType: ISYConnectionType;
    deviceFriendlyName: string;
    lastChanged: Date;
    updateType: string | null;
    updatedProperty: string | null;
    properties: ISYNodeProperties;
    currentState: number;
    currentState_f: number | string;
    constructor(isy: ISYRestCommandSender, name: string, address: string, isyType: ISYType, deviceType: ISYDeviceType, deviceFamily: ISYConnectionType);
    handleIsyUpdate(actionValue: string | number, formatted?: string | number | undefined): boolean;
    handleIsyGenericPropertyUpdate(actionValue: string | number, prop: string, formatted?: string | number | undefined): boolean;
    getGenericProperty(prop: string): any;
}
export declare class ISYLightDevice extends ISYBaseDevice {
    isDimmable: boolean;
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getCurrentLightState(): boolean;
    getCurrentLightDimState(): number;
    sendLightCommand(command: string | boolean | number, resultHandler: ISYCallback): void;
    sendLightDimCommand(dimLevel: number, resultHandler: ISYCallback): void;
}
export declare class ISYLockDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    sendLockCommand(lockState: boolean, resultHandler: ISYCallback): void;
    getCurrentLockState(): boolean | undefined;
    getCurrentNonSecureLockState(): boolean;
    getCurrentSecureLockState(): boolean;
    sendNonSecureLockCommand(lockState: boolean, resultHandler: ISYCallback): void;
    sendSecureLockCommand(lockState: boolean, resultHandler: ISYCallback): void;
}
export declare class ISYDoorWindowDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getCurrentDoorWindowState(): boolean;
}
export declare class ISYMotionSensorDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getCurrentMotionSensorState(): boolean;
}
export declare class ISYLeakSensorDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
}
export declare class ISYRemoteDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
}
export declare class ISYOutletDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getCurrentOutletState(): boolean;
    sendOutletCommand(command: boolean | string, resultHandler: ISYCallback): void;
}
export declare enum ISYFanDeviceState {
    OFF = "off",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export declare class ISYFanDevice extends ISYBaseDevice {
    deviceType: "fan";
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getCurrentFanState(): ISYFanDeviceState;
    sendFanCommand(fanState: ISYFanDeviceState, resultHandler: ISYCallback): void;
}
interface ISYThermostatDeviceResponse {
    currTemp: number;
    currentStatus?: number | string | null;
    humidity?: number;
    coolSetPoint?: number;
    heatSetPoint?: number;
    fanSetting?: number | string | null;
    mode?: number | string | null;
}
export declare class ISYThermostatDevice extends ISYBaseDevice {
    constructor(isy: ISYRestCommandSender, name: string, address: string, deviceTypeInfo: ISYDeviceInfo);
    getFormattedStatus(): ISYThermostatDeviceResponse;
}
export {};
