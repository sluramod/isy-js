"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ISYDefs = require("./isydefs.json");
////////////////////////////////////////////////////////////////////////
// ISYBaseDevice
//
// Generic base class which can represent any kind of device.
//
class ISYBaseDevice {
    constructor(isy, name, address, isyType, deviceType, deviceFamily) {
        this.isy = isy;
        this.name = name;
        this.address = address;
        this.isyType = isyType;
        this.deviceType = deviceType;
        this.batteryOperated = false;
        this.connectionType = deviceFamily;
        this.deviceFriendlyName = 'Generic Device';
        this.currentState = 0;
        this.currentState_f = 0;
        this.lastChanged = new Date();
        this.updateType = null;
        this.updatedProperty = null;
        this.properties = {};
    }
    handleIsyUpdate(actionValue, formatted = undefined) {
        if (Number(actionValue) != this.currentState) {
            this.currentState = Number(actionValue);
            this.currentState_f = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.lastChanged = new Date();
            return true;
        }
        else {
            return false;
        }
    }
    handleIsyGenericPropertyUpdate(actionValue, prop, formatted = undefined) {
        if (Number(actionValue) != this.properties[prop]) {
            this.properties[prop] = Number(actionValue);
            this.properties[prop + "_f"] = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.lastChanged = new Date();
            this.updatedProperty = prop;
            return true;
        }
        else {
            return false;
        }
    }
    getGenericProperty(prop) {
        return (this.properties[prop]);
    }
    ////////////////////////////////////////////////////////////////////////
    // LIGHTS
    getCurrentLightState() {
        return this.currentState > 0;
    }
    getCurrentLightDimState() {
        return Math.floor((this.currentState * ISYDefs.props.dimLevelMaximum) / ISYDefs.props.isyDimLevelMaximum);
    }
    sendLightCommand(command, resultHandler) {
        // command can be passed as an ISY command (DON/DOF/DFOF/DFON), a number 0/100, or a boolean of the current light state to toggle a light
        var cmd = ISYDefs.cmd.lightOn;
        if (typeof command === "boolean") {
            cmd = (command) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff;
        }
        else if (typeof command === "number") {
            cmd = (command > 0) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff;
        }
        else {
            cmd = command;
        }
        this.isy.sendRestCommand(this.address, cmd, null, resultHandler);
    }
    sendLightDimCommand(dimLevel, resultHandler) {
        var isyDimLevel = Math.ceil(dimLevel * ISYDefs.props.isyDimLevelMaximum / ISYDefs.props.dimLevelMaximum);
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.lightOn, isyDimLevel, resultHandler);
    }
    ////////////////////////////////////////////////////////////////////////
    // LOCKS
    getCurrentNonSecureLockState() {
        return (this.currentState != ISYDefs.states.lockUnlocked);
    }
    getCurrentSecureLockState() {
        return (this.currentState > 0);
    }
    sendNonSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.lockLock, null, resultHandler);
        }
        else {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.lockUnlock, null, resultHandler);
        }
    }
    sendSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.secureLockBase, ISYDefs.cmd.secureLockParameterLock, resultHandler);
        }
        else {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.secureLockBase, ISYDefs.cmd.secureLockParameterUnlock, resultHandler);
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // DOOR/WINDOW SENSOR
    getCurrentDoorWindowState() {
        return this.currentState !== ISYDefs.states.doorWindowClosed;
    }
    ////////////////////////////////////////////////////////////////////////
    // OUTLETS
    getCurrentOutletState() {
        return this.currentState > 0;
    }
    sendOutletCommand(command, resultHandler) {
        // command can be passed as an ISY command (DON/DOF), or a boolean of the current light state to toggle
        var cmd = ISYDefs.cmd.outletOn;
        if (typeof command === "boolean") {
            cmd = (command) ? ISYDefs.cmd.outletOn : ISYDefs.cmd.outletOff;
        }
        else {
            cmd = command;
        }
        this.isy.sendRestCommand(this.address, cmd, null, resultHandler);
    }
    ////////////////////////////////////////////////////////////////////////
    // MOTION SENSORS
    getCurrentMotionSensorState() {
        return (this.currentState === ISYDefs.states.motionSensorOn);
    }
    ////////////////////////////////////////////////////////////////////////
    // LEAK Sensor
    // TODO: Implement Status Check for Leak Detection Device
    ////////////////////////////////////////////////////////////////////////
    // FANS MOTORS
    getCurrentFanState() {
        if (this.currentState === 0) {
            return "Off";
        }
        else if (this.currentState == ISYDefs.cmd.fanParameterLow) {
            return "Low";
        }
        else if (this.currentState == ISYDefs.cmd.fanParameterMedium) {
            return "Medium";
        }
        else if (this.currentState == ISYDefs.cmd.fanParameterHigh) {
            return "High";
        }
        else {
            assert(false, 'Unexpected fan state: ' + this.currentState);
        }
    }
    sendFanCommand(fanState, resultHandler) {
        if (fanState === "Off") {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanOff, null, resultHandler);
        }
        else if (fanState == "Low") {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterLow, resultHandler);
        }
        else if (fanState == "Medium") {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterMedium, resultHandler);
        }
        else if (fanState == "High") {
            this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterHigh, resultHandler);
        }
        else {
            assert(false, 'Unexpected fan level: ' + fanState);
        }
    }
}
exports.ISYBaseDevice = ISYBaseDevice;
////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//
class ISYLightDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
        this.isDimmable = (deviceTypeInfo.deviceType == "dimmableLight");
    }
}
exports.ISYLightDevice = ISYLightDevice;
////////////////////////////////////////////////////////////////////////
// ISYLockDevice
//
class ISYLockDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == "lock") {
            this.sendNonSecureLockCommand(lockState, resultHandler);
        }
        else if (this.deviceType == "secureLock") {
            this.sendSecureLockCommand(lockState, resultHandler);
        }
        else {
            assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
    getCurrentLockState() {
        if (this.deviceType == "lock") {
            return this.getCurrentNonSecureLockState();
        }
        else if (this.deviceType == "secureLock") {
            return this.getCurrentSecureLockState();
        }
        else {
            assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
}
exports.ISYLockDevice = ISYLockDevice;
////////////////////////////////////////////////////////////////////////
// ISYDoorWindowDevice
//
class ISYDoorWindowDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYDoorWindowDevice = ISYDoorWindowDevice;
////////////////////////////////////////////////////////////////////////
// ISYMotionSensorDevice
//
class ISYMotionSensorDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYMotionSensorDevice = ISYMotionSensorDevice;
////////////////////////////////////////////////////////////////////////
// ISYLeakSensorDevice
//
class ISYLeakSensorDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYLeakSensorDevice = ISYLeakSensorDevice;
////////////////////////////////////////////////////////////////////////
// ISYRemoteDevice
//
class ISYRemoteDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYRemoteDevice = ISYRemoteDevice;
////////////////////////////////////////////////////////////////////////
// ISYOutletDevice
//
class ISYOutletDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYOutletDevice = ISYOutletDevice;
////////////////////////////////////////////////////////////////////////
// ISYFanDevice
//
class ISYFanDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
}
exports.ISYFanDevice = ISYFanDevice;
class ISYThermostatDevice extends ISYBaseDevice {
    constructor(isy, name, address, deviceTypeInfo) {
        super(isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    }
    getFormattedStatus() {
        let response = {
            // Insteon Thermostat == Precision is 0.5deg but reported as 2x the actual value
            currTemp: Math.round(this.currentState / 2.0)
        };
        if (ISYDefs.props.climate.operatingMode + "_f" in this.properties) {
            response.currentStatus = this.properties[ISYDefs.props.climate.operatingMode + "_f"];
        }
        if (ISYDefs.props.climate.humidity in this.properties) {
            response.humidity = Number(this.properties[ISYDefs.props.climate.humidity]);
        }
        if (ISYDefs.props.climate.coolSetPoint in this.properties) {
            response.coolSetPoint = Math.round(this.properties[ISYDefs.props.climate.coolSetPoint] / 2.0);
        }
        if (ISYDefs.props.climate.heatSetPoint in this.properties) {
            response.heatSetPoint = Math.round(this.properties[ISYDefs.props.climate.heatSetPoint] / 2.0);
        }
        if (ISYDefs.props.climate.fan + "_f" in this.properties) {
            response.fanSetting = this.properties[ISYDefs.props.climate.fan + "_f"];
        }
        if (ISYDefs.props.climate.mode + "_f" in this.properties) {
            response.mode = this.properties[ISYDefs.props.climate.mode + "_f"];
        }
        return response;
    }
}
exports.ISYThermostatDevice = ISYThermostatDevice;
//# sourceMappingURL=isydevice.js.map