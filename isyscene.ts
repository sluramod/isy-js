import * as ISYDefs from './isydefs.json'
import {ISYBaseDevice, ISYConnectionType, ISYDeviceType, ISYLightDevice, ISYType} from "./isydevice";
import {ISYRestCommandSender} from "./index";
import {ISYCallback, ISYNode} from "./isynode";

export class ISYScene implements ISYNode {
    deviceType: ISYDeviceType

    isyType: ISYType
    connectionType: ISYConnectionType
    batteryOperated: boolean
    deviceFriendlyName: string

    lastChanged: Date

    constructor(public isy: ISYRestCommandSender, public name:string, public address:string, public childDevices: ISYBaseDevice[]) {
        this.isyType = '';
        this.connectionType = 'Insteon Wired';
        this.batteryOperated = false;
        this.deviceType = "scene";
        this.deviceFriendlyName = "Insteon Scene";
        this.lastChanged = new Date();

        this.reclalculateState();
    }

    // Get the current light state
    getCurrentLightState() {
        for (let i = 0; i < this.childDevices.length; i++) {
            let device = this.childDevices[i];
            if (device instanceof ISYLightDevice) {
                if (device.getCurrentLightState()) {
                    return true;
                }
            }
        }
        return false;
    }

    getCurrentLightDimState() {
        let lightDeviceCount = 0;
        let calculatedDimLevel = 0;
        for (let i = 0; i < this.childDevices.length; i++) {
            let device = this.childDevices[i];
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
        for (let i = 0; i < this.childDevices.length; i++) {
            let device = this.childDevices[i];
            if (device instanceof ISYLightDevice) {
                if (device.getCurrentLightState() != state) {
                    return false;
                }
            }
        }
        return true;
    }

    isDeviceIncluded(device:ISYBaseDevice) {
        for (let i = 0; i < this.childDevices.length; i++) {
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
