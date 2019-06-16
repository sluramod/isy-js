// File for scratch testing. Will be removed in the future at is for my own internal purposes

import {ISY} from "./isy";
import {ISYNode} from "./isynode";

function handleInitialized() {
    var deviceList = isy.getDeviceList();
    console.log("Device count: " + deviceList.length);
    if (deviceList.length == 0) {
        console.log("No device list returned!");
    } else {
        console.log("Got device list. Device count: " + deviceList.length);
        for (var index = 0; index < deviceList.length; index++) {
            console.log("Device: " + deviceList[index].name + ", " + deviceList[index].deviceType + ", " + deviceList[index].address + ", " + deviceList[index].deviceFriendlyName);
        }
    }
}

function handleChanged(isy:ISY, device:ISYNode) {
    var logMessage = 'From isy: ' + isy.address + ' device changed: ' + device.name;
    /*
    if (device.deviceType == isy.DEVICE_TYPE_FAN) {
        logMessage += ' fan state: ' + device.getCurrentFanState();
    } else if (device.deviceType == isy.DEVICE_TYPE_LIGHT) {
        logMessage += ' light state: ' + device.getCurrentLightState();
    } else if (device.deviceType == isy.DEVICE_TYPE_DIMMABLE_LIGHT) {
        logMessage += ' dimmable light state: ' + device.getCurrentLightState() + ' dimm Level: ' + device.getCurrentLightDimState();
    } else if (device.deviceType == isy.DEVICE_TYPE_LOCK || device.deviceType == isy.DEVICE_TYPE_SECURE_LOCK) {
        logMessage += ' lock state: ' + device.getCurrentLockState();
    } else if (device.deviceType == isy.DEVICE_TYPE_OUTLET) {
        logMessage += ' outlet state: ' + device.getCurrentOutletState();
    } else if (device.deviceType == isy.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR) {
        logMessage += ' door window sensor state: ' + device.getCurrentDoorWindowState() + ' logical: ' + device.getLogicalState() + ' physical: ' + device.getPhysicalState();
    } else if (device.deviceType == isy.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
        logMessage += ' door window sensor state: ' + device.getCurrentDoorWindowState();
    } else if (device.deviceType == isy.DEVICE_TYPE_ALARM_PANEL) {
        logMessage += ' alarm panel state: ' + device.getAlarmStatusAsText();
    } else if (device.deviceType == isy.DEVICE_TYPE_MOTION_SENSOR) {
        logMessage += ' motion sensor state: ' + device.getCurrentMotionSensorState();
    } else if (device.deviceType == isy.DEVICE_TYPE_SCENE) {
        logMessage += ' scene. light state: ' + device.getCurrentLightState() + ' dimm Level: ' + device.getCurrentLightDimState();
    } else if (this.isy.DEVICE_TYPE_NODE_SERVER_NODE) {
        logMessage += ' node server node. No extended information at this time (future).';
    } else if (this.isy.DEVICE_TYPE_REMOTE) {
        logMessage += ' mini remoe. Nothing to report.';
    } else if (this.isy.DEVICE_TYPE_LEAK_SENSOR) {
        logMessage += ' leak sensor. ';
    } else {
        logMessage += ' unknown device, cannot parse state';
    }
    */
    console.log(logMessage);
}

var isy = new ISY('127.0.0.1:3000', 'admin', 'password', false, handleChanged, true, true, true);
//var isy = new ISY.ISY('127.0.0.1:3000', 'admin', 'password', true, handleChanged, false, true,true);

isy.initialize(handleInitialized);
console.log('initialize completed');
