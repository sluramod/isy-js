"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ELKAlarmPanelDevice {
    constructor(isy, area) {
        this.isy = isy;
        this.area = area;
        this.alarmTripState = 0 /* ALARM_TRIP_STATE_DISARMED */;
        this.alarmState = 0 /* ALARM_STATE_NOT_READY_TO_ARM */;
        this.alarmMode = 0 /* ALARM_MODE_DISARMED */;
        this.name = "Elk Alarm Panel " + area;
        this.address = "ElkPanel" + area;
        this.deviceFriendlyName = "Elk Main Alarm Panel";
        this.deviceType = "alarmPanel";
        this.connectionType = "Elk Network Module";
        this.batteryOperated = false;
        this.voltage = 71;
        this.lastChanged = new Date();
    }
    sendSetAlarmModeCommand(alarmState, handleResult) {
        if (alarmState == 0 /* ALARM_MODE_DISARMED */) {
            this.isy.sendISYCommand('elk/area/' + this.area + '/cmd/disarm', handleResult);
        }
        else {
            this.isy.sendISYCommand('elk/area/' + this.area + '/cmd/arm?armType=' + alarmState, handleResult);
        }
    }
    clearAllBypasses(handleResult) {
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
    setFromAreaUpdate(areaUpdate) {
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
            }
            else if (updateType == 2) {
                if (this.alarmState != valueToSet) {
                    this.alarmState = valueToSet;
                    valueChanged = true;
                }
            }
            else if (updateType == 3) {
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
exports.ELKAlarmPanelDevice = ELKAlarmPanelDevice;
class ElkAlarmSensor {
    constructor(isy, name, area, zone, deviceType) {
        this.isy = isy;
        this.area = area;
        this.zone = zone;
        this.name = name;
        this.address = "ElkZone" + zone;
        this.deviceFriendlyName = "Elk Connected Sensor";
        this.deviceType = deviceType;
        this.connectionType = "Elk Network";
        this.batteryOperated = false;
        this.physicalState = 0 /* SENSOR_STATE_PHYSICAL_NOT_CONFIGURED */;
        this.logicalState = 0 /* SENSOR_STATE_LOGICAL_NORMAL */;
        this.lastChanged = new Date();
    }
    sendBypassToggleCommand(handleResult) {
        this.isy.sendISYCommand('elk/zone/' + this.zone + '/cmd/toggle/bypass', handleResult);
    }
    getPhysicalState() {
        return this.physicalState;
    }
    getLogicalState() {
        return this.logicalState;
    }
    isBypassed() {
        return (this.logicalState == 3 /* SENSOR_STATE_LOGICAL_BYPASSED */);
    }
    getCurrentDoorWindowState() {
        return (this.physicalState == 1 /* SENSOR_STATE_PHYSICAL_OPEN */ || this.logicalState == 2 /* SENSOR_STATE_LOGICAL_VIOLATED */);
    }
    getSensorStatus() {
        return "PS [" + this.physicalState + "] LS [" + this.logicalState + "]";
    }
    isPresent() {
        return !!(this.voltage && (this.voltage < 65 || this.voltage > 80));
    }
    setFromZoneUpdate(zoneUpdate) {
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
            }
            else if (updateType == 52) {
                if (this.physicalState != valueToSet) {
                    this.physicalState = valueToSet;
                    valueChanged = true;
                }
            }
            else if (updateType == 53) {
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
exports.ElkAlarmSensor = ElkAlarmSensor;
//# sourceMappingURL=elkdevice.js.map