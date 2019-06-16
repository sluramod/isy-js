import * as ISYDefs from './isydefs.json'
import {ISYBaseDevice, ISYConnectionType, ISYDeviceType, ISYLightDevice, ISYType} from "./isydevice";
import {ISYRestCommandSender} from "./isy";
import {ISYCallback, ISYNode} from "./isynode";

export class ISYScene implements ISYNode {
    isy: ISYRestCommandSender
    name: string
    address: string
    deviceType: ISYDeviceType

    isyType: ISYType
    connectionType: ISYConnectionType
    batteryOperated: boolean
    deviceFriendlyName: string

    childDevices: ISYBaseDevice[]

    lastChanged: Date

    constructor(isy: ISYRestCommandSender, name:string, address:string, childDevices: ISYBaseDevice[]) {

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
            if (device instanceof ISYLightDevice) {
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
            if (device instanceof ISYLightDevice) {
                calculatedDimLevel += device.getCurrentLightDimState();
                lightDeviceCount++;
            }
        }
        if (lightDeviceCount > 0) {
            return (calculatedDimLevel / lightDeviceCount);
        } else {
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

    getAreAllLightsInSpecifiedState(state:boolean) {
        for (var i = 0; i < this.childDevices.length; i++) {
            var device = this.childDevices[i];
            if (device instanceof ISYLightDevice) {
                if (device.getCurrentLightState() != state) {
                    return false;
                }
            }
        }
        return true;
    }

    isDeviceIncluded(device:ISYBaseDevice) {
        for (var i = 0; i < this.childDevices.length; i++) {
            if (this.childDevices[i].address == device.address) {
                return true;
            }
        }
        return false;
    }

    sendLightCommand(lightState:boolean, resultHandler:ISYCallback) {
        this.isy.sendRestCommand(this.address, (lightState) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff, null, resultHandler);
    }
}
