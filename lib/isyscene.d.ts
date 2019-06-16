import { ISYBaseDevice, ISYConnectionType, ISYDeviceType, ISYType } from "./isydevice";
import { ISYRestCommandSender } from "./isy";
import { ISYCallback, ISYNode } from "./isynode";
export declare class ISYScene implements ISYNode {
    isy: ISYRestCommandSender;
    name: string;
    address: string;
    deviceType: ISYDeviceType;
    isyType: ISYType;
    connectionType: ISYConnectionType;
    batteryOperated: boolean;
    deviceFriendlyName: string;
    childDevices: ISYBaseDevice[];
    lastChanged: Date;
    constructor(isy: ISYRestCommandSender, name: string, address: string, childDevices: ISYBaseDevice[]);
    getCurrentLightState(): boolean;
    getCurrentLightDimState(): number;
    reclalculateState(): boolean;
    markAsChanged(): void;
    getAreAllLightsInSpecifiedState(state: boolean): boolean;
    isDeviceIncluded(device: ISYBaseDevice): boolean;
    sendLightCommand(lightState: boolean, resultHandler: ISYCallback): void;
}
