import {ISYCommandSender} from "./isy";
import {ISYConnectionType, ISYDeviceType} from "./isydevice";
import {ISYCallback, ISYNode} from "./isynode";

export const enum ELKAlarmPanelDeviceAlarmMode {
    ALARM_MODE_DISARMED = 0,
    ALARM_MODE_AWAY = 1,
    ALARM_MODE_STAY = 2,
    ALARM_MODE_STAY_INSTANT = 3,
    ALARM_MODE_NIGHT = 4,
    ALARM_MODE_NIGHT_INSTANT = 5,
    ALARM_MODE_VACATION = 6
}

export const enum ELKAlarmPanelDeviceAlarmTripState {
    ALARM_TRIP_STATE_DISARMED = 0,
    ALARM_TRIP_STATE_EXIT_DELAY = 1,
    ALARM_TRIP_STATE_TRIPPED = 2
}

export const enum ELKAlarmPanelDeviceAlarmState {
    ALARM_STATE_NOT_READY_TO_ARM = 0,
    ALARM_STATE_READY_TO_ARM = 1,
    ALARM_STATE_READY_TO_ARM_VIOLATION = 2,
    ALARM_STATE_ARMED_WITH_TIMER = 3,
    ALARM_STATE_ARMED_FULLY = 4,
    ALARM_STATE_FORCE_ARMED_VIOLATION = 5,
    ALARM_STATE_ARMED_WITH_BYPASS = 6
}

export interface ELKAlarmPanelDeviceAreaUpdateAttributes {
    area: string | number
    type: 1 | 2 | 3
    val: string
}

export class ELKAlarmPanelDevice implements ISYNode {
    isy: ISYCommandSender

    area: string | number
    name: string
    address: string
    deviceFriendlyName: string
    deviceType: ISYDeviceType

    connectionType: ISYConnectionType
    batteryOperated: boolean
    voltage: number

    alarmMode: ELKAlarmPanelDeviceAlarmMode
    alarmState: ELKAlarmPanelDeviceAlarmState
    alarmTripState: ELKAlarmPanelDeviceAlarmTripState

    lastChanged: Date

    constructor(isy: ISYCommandSender, area: string | number) {
        this.isy = isy;
        this.area = area;
        this.alarmTripState = ELKAlarmPanelDeviceAlarmTripState.ALARM_TRIP_STATE_DISARMED;
        this.alarmState = ELKAlarmPanelDeviceAlarmState.ALARM_STATE_NOT_READY_TO_ARM;
        this.alarmMode = ELKAlarmPanelDeviceAlarmMode.ALARM_MODE_DISARMED;
        this.name = "Elk Alarm Panel " + area;
        this.address = "ElkPanel" + area;
        this.deviceFriendlyName = "Elk Main Alarm Panel";
        this.deviceType = "alarmPanel";
        this.connectionType = "Elk Network Module";
        this.batteryOperated = false;
        this.voltage = 71;
        this.lastChanged = new Date();
    }

    sendSetAlarmModeCommand(alarmState: ELKAlarmPanelDeviceAlarmMode, handleResult: ISYCallback) {
        if (alarmState == ELKAlarmPanelDeviceAlarmMode.ALARM_MODE_DISARMED) {
            this.isy.sendISYCommand('elk/area/' + this.area + '/cmd/disarm', handleResult);
        } else {
            this.isy.sendISYCommand('elk/area/' + this.area + '/cmd/arm?armType=' + alarmState, handleResult);
        }
    }

    clearAllBypasses(handleResult: ISYCallback) {
        this.isy.sendISYCommand('elk/area/' + this.area + '/cmd/unbypass', handleResult);
    }

    getAlarmStatusAsText() {
        return "AM [" + this.alarmMode + "] AS [" + this.alarmState + "] ATS [" + this.alarmTripState + "]";
    }

    getAlarmTripState() {
        return this.alarmTripState;
    }

    getAlarmState() {
        return this.alarmState;
    }

    getAlarmMode() {
        return this.alarmMode;
    }

    setFromAreaUpdate(areaUpdate: { attr: ELKAlarmPanelDeviceAreaUpdateAttributes }) {
        var areaId = areaUpdate.attr.area;
        var updateType = areaUpdate.attr.type;
        var valueToSet = parseInt(areaUpdate.attr.val);
        var valueChanged = false;

        if (areaId == this.area) {
            if (updateType == 1) {
                if (this.alarmTripState != valueToSet) {
                    this.alarmTripState = valueToSet;
                    valueChanged = true;
                }
            } else if (updateType == 2) {
                if (this.alarmState != valueToSet) {
                    this.alarmState = valueToSet;
                    valueChanged = true;
                }
            } else if (updateType == 3) {
                if (this.alarmMode != valueToSet) {
                    this.alarmMode = valueToSet;
                    valueChanged = true;
                }
            }
        }
        if (valueChanged) {
            this.lastChanged = new Date();
        }
        return valueChanged;
    }
}

/////////////////////////////
// ELKAlarmSensor
//

export const enum ElkAlarmSensorPhysicalState {
    SENSOR_STATE_PHYSICAL_NOT_CONFIGURED = 0,
    SENSOR_STATE_PHYSICAL_OPEN = 1,
    SENSOR_STATE_PHYSICAL_EOL = 2,
    SENSOR_STATE_PHYSICAL_SHORT = 3
}

export const enum ElkAlarmSensorLogicalState {
    SENSOR_STATE_LOGICAL_NORMAL = 0,
    SENSOR_STATE_LOGICAL_TROUBLE = 1,
    SENSOR_STATE_LOGICAL_VIOLATED = 2,
    SENSOR_STATE_LOGICAL_BYPASSED = 3,
}

export class ElkAlarmSensor implements ISYNode {
    isy: ISYCommandSender

    name: string
    address: string
    deviceFriendlyName: string
    deviceType: ISYDeviceType
    connectionType: ISYConnectionType
    batteryOperated: boolean

    area: string | number
    zone: string | number

    voltage: number | undefined

    physicalState: ElkAlarmSensorPhysicalState
    logicalState: ElkAlarmSensorLogicalState

    lastChanged: Date

    constructor(isy: ISYCommandSender, name: string, area: string | number, zone: string | number, deviceType: ISYDeviceType) {
        this.isy = isy;
        this.area = area;
        this.zone = zone;
        this.name = name;
        this.address = "ElkZone" + zone;
        this.deviceFriendlyName = "Elk Connected Sensor";
        this.deviceType = deviceType;
        this.connectionType = "Elk Network";
        this.batteryOperated = false;
        this.physicalState = ElkAlarmSensorPhysicalState.SENSOR_STATE_PHYSICAL_NOT_CONFIGURED;
        this.logicalState = ElkAlarmSensorLogicalState.SENSOR_STATE_LOGICAL_NORMAL;
        this.lastChanged = new Date();
    }

    sendBypassToggleCommand(handleResult: ISYCallback) {
        this.isy.sendISYCommand('elk/zone/' + this.zone + '/cmd/toggle/bypass', handleResult);
    }

    getPhysicalState() {
        return this.physicalState;
    }

    getLogicalState() {
        return this.logicalState;
    }

    isBypassed() {
        return (this.logicalState == ElkAlarmSensorLogicalState.SENSOR_STATE_LOGICAL_BYPASSED);
    }

    getCurrentDoorWindowState() {
        return (this.physicalState == ElkAlarmSensorPhysicalState.SENSOR_STATE_PHYSICAL_OPEN || this.logicalState == ElkAlarmSensorLogicalState.SENSOR_STATE_LOGICAL_VIOLATED);
    }

    getSensorStatus() {
        return "PS [" + this.physicalState + "] LS [" + this.logicalState + "]";
    }

    isPresent() {
        return !!(this.voltage && (this.voltage < 65 || this.voltage > 80));
    }

    setFromZoneUpdate(zoneUpdate: { attr: { zone: string, type: number, val: number } }) {
        var zone = zoneUpdate.attr.zone;
        var updateType = zoneUpdate.attr.type;
        var valueToSet = zoneUpdate.attr.val;
        var valueChanged = false;

        if (zone == this.zone) {
            if (updateType == 51) {
                if (this.logicalState != valueToSet) {
                    this.logicalState = valueToSet;
                    // Not triggering change update on logical state because physical always follows and don't want double notify.
                    // valueChanged = true;
                }
            } else if (updateType == 52) {
                if (this.physicalState != valueToSet) {
                    this.physicalState = valueToSet;
                    valueChanged = true;
                }
            } else if (updateType == 53) {
                if (this.voltage != valueToSet) {
                    this.voltage = valueToSet;
                    valueChanged = true;
                }
            }
        }
        if (valueChanged) {
            this.lastChanged = new Date();
        }
        return valueChanged;
    }
}
