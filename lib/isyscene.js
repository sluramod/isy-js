"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ISYDefs = require("./isydefs.json");
const isydevice_1 = require("./isydevice");
class ISYScene {
    constructor(isy, name, address, childDevices) {
        this.isy = isy;
        this.name = name;
        this.address = address;
        this.isyType = '';
        this.connectionType = 'Insteon Wired';
        this.batteryOperated = false;
        this.childDevices = childDevices;
        this.deviceType = "scene";
        this.deviceFriendlyName = "Insteon Scene";
        this.lastChanged = new Date();
        this.reclalculateState();
    }
    // Get the current light state
    getCurrentLightState() {
        for (var i = 0; i < this.childDevices.length; i++) {
            var device = this.childDevices[i];
            if (device instanceof isydevice_1.ISYLightDevice) {
                if (device.getCurrentLightState()) {
                    return true;
                }
            }
        }
        return false;
    }
    getCurrentLightDimState() {
        var lightDeviceCount = 0;
        var calculatedDimLevel = 0;
        for (var i = 0; i < this.childDevices.length; i++) {
            var device = this.childDevices[i];
            if (device instanceof isydevice_1.ISYLightDevice) {
                calculatedDimLevel += device.getCurrentLightDimState();
                lightDeviceCount++;
            }
        }
        if (lightDeviceCount > 0) {
            return (calculatedDimLevel / lightDeviceCount);
        }
        else {
            return 0;
        }
    }
    reclalculateState() {
        this.markAsChanged();
        return true;
    }
    markAsChanged() {
        this.lastChanged = new Date();
    }
    getAreAllLightsInSpecifiedState(state) {
        for (var i = 0; i < this.childDevices.length; i++) {
            var device = this.childDevices[i];
            if (device instanceof isydevice_1.ISYLightDevice) {
                if (device.getCurrentLightState() != state) {
                    return false;
                }
            }
        }
        return true;
    }
    isDeviceIncluded(device) {
        for (var i = 0; i < this.childDevices.length; i++) {
            if (this.childDevices[i].address == device.address) {
                return true;
            }
        }
        return false;
    }
    sendLightCommand(lightState, resultHandler) {
        this.isy.sendRestCommand(this.address, (lightState) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff, null, resultHandler);
    }
}
exports.ISYScene = ISYScene;
//# sourceMappingURL=isyscene.js.map