import { ISYCommandSender } from "./isy";
import { ISYConnectionType, ISYDeviceType } from "./isydevice";
import { ISYCallback, ISYNode } from "./isynode";
export declare const enum ELKAlarmPanelDeviceAlarmMode {
    ALARM_MODE_DISARMED = 0,
    ALARM_MODE_AWAY = 1,
    ALARM_MODE_STAY = 2,
    ALARM_MODE_STAY_INSTANT = 3,
    ALARM_MODE_NIGHT = 4,
    ALARM_MODE_NIGHT_INSTANT = 5,
    ALARM_MODE_VACATION = 6
}
export declare const enum ELKAlarmPanelDeviceAlarmTripState {
    ALARM_TRIP_STATE_DISARMED = 0,
    ALARM_TRIP_STATE_EXIT_DELAY = 1,
    ALARM_TRIP_STATE_TRIPPED = 2
}
export declare const enum ELKAlarmPanelDeviceAlarmState {
    ALARM_STATE_NOT_READY_TO_ARM = 0,
    ALARM_STATE_READY_TO_ARM = 1,
    ALARM_STATE_READY_TO_ARM_VIOLATION = 2,
    ALARM_STATE_ARMED_WITH_TIMER = 3,
    ALARM_STATE_ARMED_FULLY = 4,
    ALARM_STATE_FORCE_ARMED_VIOLATION = 5,
    ALARM_STATE_ARMED_WITH_BYPASS = 6
}
export interface ELKAlarmPanelDeviceAreaUpdateAttributes {
    area: string | number;
    type: 1 | 2 | 3;
    val: string;
}
export declare class ELKAlarmPanelDevice implements ISYNode {
    isy: ISYCommandSender;
    area: string | number;
    name: string;
    address: string;
    deviceFriendlyName: string;
    deviceType: ISYDeviceType;
    connectionType: ISYConnectionType;
    batteryOperated: boolean;
    voltage: number;
    alarmMode: ELKAlarmPanelDeviceAlarmMode;
    alarmState: ELKAlarmPanelDeviceAlarmState;
    alarmTripState: ELKAlarmPanelDeviceAlarmTripState;
    lastChanged: Date;
    constructor(isy: ISYCommandSender, area: string | number);
    sendSetAlarmModeCommand(alarmState: ELKAlarmPanelDeviceAlarmMode, handleResult: ISYCallback): void;
    clearAllBypasses(handleResult: ISYCallback): void;
    getAlarmStatusAsText(): string;
    getAlarmTripState(): ELKAlarmPanelDeviceAlarmTripState;
    getAlarmState(): ELKAlarmPanelDeviceAlarmState;
    getAlarmMode(): ELKAlarmPanelDeviceAlarmMode;
    setFromAreaUpdate(areaUpdate: {
        attr: ELKAlarmPanelDeviceAreaUpdateAttributes;
    }): boolean;
}
export declare const enum ElkAlarmSensorPhysicalState {
    SENSOR_STATE_PHYSICAL_NOT_CONFIGURED = 0,
    SENSOR_STATE_PHYSICAL_OPEN = 1,
    SENSOR_STATE_PHYSICAL_EOL = 2,
    SENSOR_STATE_PHYSICAL_SHORT = 3
}
export declare const enum ElkAlarmSensorLogicalState {
    SENSOR_STATE_LOGICAL_NORMAL = 0,
    SENSOR_STATE_LOGICAL_TROUBLE = 1,
    SENSOR_STATE_LOGICAL_VIOLATED = 2,
    SENSOR_STATE_LOGICAL_BYPASSED = 3
}
export declare class ElkAlarmSensor implements ISYNode {
    isy: ISYCommandSender;
    name: string;
    address: string;
    deviceFriendlyName: string;
    deviceType: ISYDeviceType;
    connectionType: ISYConnectionType;
    batteryOperated: boolean;
    area: string | number;
    zone: string | number;
    voltage: number | undefined;
    physicalState: ElkAlarmSensorPhysicalState;
    logicalState: ElkAlarmSensorLogicalState;
    lastChanged: Date;
    constructor(isy: ISYCommandSender, name: string, area: string | number, zone: string | number, deviceType: ISYDeviceType);
    sendBypassToggleCommand(handleResult: ISYCallback): void;
    getPhysicalState(): ElkAlarmSensorPhysicalState;
    getLogicalState(): ElkAlarmSensorLogicalState;
    isBypassed(): boolean;
    getCurrentDoorWindowState(): boolean;
    getSensorStatus(): string;
    isPresent(): boolean;
    setFromZoneUpdate(zoneUpdate: {
        attr: {
            zone: string;
            type: number;
            val: number;
        };
    }): boolean;
}
