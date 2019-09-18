import {ISYConnectionType, ISYDeviceType, ISYType} from "./isydevice";
import {HasISYAddress} from "./index";

export type ISYCallback = (status: boolean) => void

export interface ISYDeviceInfo {
    type: ISYType
    deviceType: ISYDeviceType
    connectionType: ISYConnectionType
}

export interface ISYNodeProperties {
    [idx: string]: any
}

export interface ISYNode {

    isy: HasISYAddress

    name: string
    address: string
    isyType?: ISYType
    deviceType: ISYDeviceType
    batteryOperated: boolean
    connectionType?: ISYConnectionType
    deviceFriendlyName: string
    lastChanged: Date

    properties?: ISYNodeProperties
}