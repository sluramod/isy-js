"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmldoc = require("xmldoc");
const x2j = require("xml2js");
const restler = require("restler");
const WebSocket = require("ws");
const assert = require("assert");
const isyDeviceTypeList = require("./isydevicetypes.json");
const ISYDefs = require("./isydefs.json");
const isydevice_1 = require("./isydevice");
exports.ISYBaseDevice = isydevice_1.ISYBaseDevice;
exports.ISYDoorWindowDevice = isydevice_1.ISYDoorWindowDevice;
exports.ISYFanDevice = isydevice_1.ISYFanDevice;
exports.ISYLeakSensorDevice = isydevice_1.ISYLeakSensorDevice;
exports.ISYLightDevice = isydevice_1.ISYLightDevice;
exports.ISYLockDevice = isydevice_1.ISYLockDevice;
exports.ISYMotionSensorDevice = isydevice_1.ISYMotionSensorDevice;
exports.ISYOutletDevice = isydevice_1.ISYOutletDevice;
exports.ISYRemoteDevice = isydevice_1.ISYRemoteDevice;
exports.ISYThermostatDevice = isydevice_1.ISYThermostatDevice;
exports.ISYFanDeviceState = isydevice_1.ISYFanDeviceState;
const isyvariable_1 = require("./isyvariable");
exports.ISYVariable = isyvariable_1.ISYVariable;
const isyscene_1 = require("./isyscene");
const elkdevice_1 = require("./elkdevice");
exports.ELKAlarmPanelDevice = elkdevice_1.ELKAlarmPanelDevice;
exports.ElkAlarmSensor = elkdevice_1.ElkAlarmSensor;
const isynodeserver_1 = require("./isynodeserver");
exports.ISYNodeServerNode = isynodeserver_1.ISYNodeServerNode;
function convertToCelsius(value) {
    const celsius = (5 / 9 * (value - 32)).toFixed(1);
    return Number(celsius);
}
function isyTypeToTypeName(isyType, address) {
    for (let index = 0; index < isyDeviceTypeList.length; index++) {
        if (isyDeviceTypeList[index].type === isyType) {
            let addressElementValue = isyDeviceTypeList[index].address;
            if (addressElementValue !== '') {
                let lastAddressNumber = address[address.length - 1];
                if (lastAddressNumber !== addressElementValue) {
                    continue;
                }
            }
            return isyDeviceTypeList[index];
        }
    }
    return null;
}
function buildDeviceInfoRecord(isyType, deviceFamily, deviceType) {
    return {
        type: isyType,
        address: '',
        name: 'Generic Device',
        deviceType: deviceType,
        connectionType: deviceFamily,
        batteryOperated: false
    };
}
class ISY {
    constructor(isyAddress, userName, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList, enableDebugLogging, variableCallback) {
        this.isyAddress = isyAddress;
        this.userName = userName;
        this.password = password;
        this.elkEnabled = elkEnabled;
        this.changeCallback = changeCallback;
        this.variableCallback = variableCallback;
        this.deviceIndex = {};
        this.deviceList = [];
        this.variableList = [];
        this.variableIndex = {};
        this.variableCallback = variableCallback;
        this.nodesLoaded = false;
        this.protocol = (useHttps === true) ? 'https' : 'http';
        this.wsprotocol = (useHttps === true) ? 'wss' : 'ws';
        this.zoneMap = {};
        this.sceneList = [];
        this.sceneIndex = {};
        this.debugLogEnabled = enableDebugLogging || false;
        this.scenesInDeviceList = scenesInDeviceList || false;
        this.guardianTimer = null;
        if (this.elkEnabled) {
            this.elkAlarmPanel = new elkdevice_1.ELKAlarmPanelDevice(this, 1);
        }
    }
    logger(msg) {
        if (this.debugLogEnabled || (process.env.ISYJSDEBUG !== undefined && process.env.ISYJSDEBUG !== null)) {
            let timeStamp = new Date();
            console.log(timeStamp.getFullYear() + '-' + timeStamp.getMonth() + '-' + timeStamp.getDay() + '#' + timeStamp.getHours() + ':' + timeStamp.getMinutes() + ':' + timeStamp.getSeconds() + '- ' + msg);
        }
    }
    getDeviceTypeBasedOnISYTable(deviceNode) {
        let familyId = 1;
        if (typeof deviceNode.family !== "undefined") {
            familyId = Number(deviceNode.family._);
        }
        let isyType = deviceNode.type;
        let addressData = deviceNode.address;
        let addressElements = addressData.split(' ');
        let typeElements = isyType.split('.');
        let mainType = Number(typeElements[0]);
        let subType = Number(typeElements[1]);
        let subAddress = Number(addressElements[3]);
        // ZWave nodes identify themselves with devtype node
        if (typeof deviceNode.devtype !== "undefined") {
            if (typeof deviceNode.devtype.cat !== "undefined") {
                subType = Number(deviceNode.devtype.cat);
            }
        }
        // Insteon Device Family
        if (familyId === 1) {
            // Dimmable Devices
            if (mainType === 1) {
                // Special case fanlinc has a fan element
                if (subType === 46 && subAddress === 2) {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "fan");
                }
                else {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "dimmableLight");
                }
            }
            else if (mainType === 2) {
                // Special case appliance Lincs into outlets
                if (subType === 6 || subType === 9 || subType === 12 || subType === 23) {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                    // Outlet lincs
                }
                else if (subType === 8 || subType === 33) {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                    // Dual outlets
                }
                else if (subType === 57) {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                }
                else {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "light");
                }
                // Sensors
            }
            else if (mainType === 7) {
                // I/O Lincs
                if (subType === 0) {
                    if (subAddress === 1) {
                        return buildDeviceInfoRecord(isyType, 'Insteon', "doorWindowSensor");
                    }
                    else {
                        return buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                    }
                    // Other sensors. Not yet supported
                }
                else {
                    return null;
                }
                // Access controls/doors/locks
            }
            else if (mainType === 15) {
                // MorningLinc
                if (subType === 6) {
                    if (subAddress === 1) {
                        return buildDeviceInfoRecord(isyType, 'Insteon', "lock");
                        // Ignore subdevice which operates opposite for the locks
                    }
                    else {
                        return null;
                    }
                    // Other devices, going to guess they are similar to MorningLinc
                }
                else {
                    return null;
                }
            }
            else if (mainType === 16) {
                // Motion sensors
                if (subType === 1 || subType === 3) {
                    if (subAddress === 1) {
                        return buildDeviceInfoRecord(isyType, "Insteon", "motionSensor");
                        // Ignore battery level sensor and daylight sensor
                    }
                }
                else if (subType === 2 || subType === 9 || subType === 17) {
                    return buildDeviceInfoRecord(isyType, 'Insteon', "doorWindowSensor");
                    // Smoke, leak sensors, don't yet know how to support
                }
                else {
                    return null;
                }
                // No idea how to test or support
            }
            else if (mainType === 5) {
                // Thermostats
                return buildDeviceInfoRecord(isyType, "Insteon", "thermostat");
            }
            else if (mainType === 6) {
                // Leak Sensors
                return buildDeviceInfoRecord(isyType, "Insteon", "leakSensor");
            }
            else if (mainType === 0) {
                if (subType === 6 || subType === 8) {
                    // Insteon Remote
                    return buildDeviceInfoRecord(isyType, "Insteon", "remote");
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
            // Z-Wave Device Family
        }
        else if (familyId === 4) {
            // Appears to be all ZWave devices seen so far
            if (mainType === 4) {
                // Identified by user zwave on/off switch
                if (subType === 16) {
                    return buildDeviceInfoRecord(isyType, 'ZWave', "light");
                    // Identified by user door lock
                }
                else if (subType === 111) {
                    return buildDeviceInfoRecord(isyType, 'ZWave', "secureLock");
                    // This is a guess based on the naming in the ISY SDK
                }
                else if (subType === 109) {
                    return buildDeviceInfoRecord(isyType, 'ZWave', "dimmableLight");
                    // Otherwise we don't know how to handle
                }
                else {
                    return null;
                }
            }
        }
        else if (familyId === 10) {
            // Node Server Node
            if (mainType === 1 && subType === 1) { // Node Server Devices are reported as 1.1.0.0.
                return buildDeviceInfoRecord(isyType, "NodeServer", "nodeServerNode");
            }
        }
        return null;
    }
    nodeChangedHandler(node) {
        let that = this;
        if (this.nodesLoaded) {
            this.changeCallback(that, node);
        }
    }
    getElkAlarmPanel() {
        return this.elkAlarmPanel;
    }
    loadNodes(result) {
        this.loadDevices(result);
        this.loadScenes(result);
    }
    loadScenes(result) {
        for (let scene of result.nodes.group) {
            let sceneAddress = scene.address;
            let sceneName = scene.name;
            if (sceneName === "ISY") {
                continue;
            } // Skip ISY Scene
            let childDevices = [];
            if (typeof scene.members.link === "undefined") {
                continue; // Skip Empty Scene
            }
            else if (Array.isArray(scene.members.link)) {
                for (let node of scene.members.link) {
                    if ("_" in node) {
                        childDevices.push(node._);
                    }
                }
            }
            else if (typeof scene.members.link === "object") {
                childDevices.push(scene.members.link._); // Scene with 1 link returned as object.
            }
            let newScene = new isyscene_1.ISYScene(this, sceneName, sceneAddress, childDevices);
            this.sceneList.push(newScene);
            this.sceneIndex[newScene.address] = newScene;
            if (this.scenesInDeviceList) {
                this.deviceIndex[newScene.address] = newScene;
                this.deviceList.push(newScene);
            }
        }
    }
    loadDevices(result) {
        for (let node of result.nodes.node) {
            let deviceAddress = ("address" in node) ? node.address : "00 00 00 1";
            let isyDeviceType = ("type" in node) ? node.type : "unknown";
            let deviceName = ("name" in node) ? node.name : "Unnamed Device";
            let newDevice = null;
            let deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);
            let enabled = ("enabled" in node) ? node.enabled : false;
            if (enabled !== 'false') {
                // Try fallback to new generic device identification when not specifically identified.
                if (deviceTypeInfo === null) {
                    deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(node);
                }
                if (deviceTypeInfo !== null) {
                    if (deviceTypeInfo.deviceType === "dimmableLight" ||
                        deviceTypeInfo.deviceType === "light") {
                        newDevice = new isydevice_1.ISYLightDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "doorWindowSensor") {
                        newDevice = new isydevice_1.ISYDoorWindowDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "motionSensor") {
                        newDevice = new isydevice_1.ISYMotionSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "leakSensor") {
                        newDevice = new isydevice_1.ISYLeakSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "remote") {
                        newDevice = new isydevice_1.ISYRemoteDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "fan") {
                        newDevice = new isydevice_1.ISYFanDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "lock" ||
                        deviceTypeInfo.deviceType === "secureLock") {
                        newDevice = new isydevice_1.ISYLockDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "outlet") {
                        newDevice = new isydevice_1.ISYOutletDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "thermostat") {
                        newDevice = new isydevice_1.ISYThermostatDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === "nodeServerNode") {
                        newDevice = new isynodeserver_1.ISYNodeServerNode(this, deviceName, deviceAddress, "nodeServerNode", node.family.instance, // Node Server Number
                        node.pnode, // Parent Node Address
                        node.nodeDefId // Node Type
                        );
                    }
                    // Support the device with a base device object
                }
                else {
                    this.logger('Device: ' + deviceName + ' type: ' + isyDeviceType + ' is not specifically supported, returning generic device object. ');
                    newDevice = new isydevice_1.ISYBaseDevice(this, deviceName, deviceAddress, isyDeviceType, "unknown", 'Insteon');
                }
                if (newDevice !== null) {
                    let currentState = 0;
                    let currentState_f = undefined;
                    if ("property" in node && typeof node.property === "object") {
                        if (Array.isArray(node.property)) {
                            newDevice.properties = newDevice.properties || {};
                            for (let p of node.property) {
                                newDevice.properties[p.id] = isNaN(p.value) ? p.value : Number(p.value);
                                newDevice.properties[p.id + "_f"] = ("formatted" in p) ? ((isNaN(p.formatted)) ? p.formatted : Number(p.formatted)) : Number(p.value);
                                if (p.id === "ST") {
                                    currentState = Number(p.value);
                                    currentState_f = ("formatted" in p) ? ((isNaN(p.formatted)) ? p.formatted : Number(p.formatted)) : Number(p.value);
                                }
                            }
                        }
                        else if ("id" in node.property && node.property.id === "ST") {
                            currentState = Number(node.property.value);
                            currentState_f = ("formatted" in node.property) ? ((isNaN(node.property.formatted)) ? node.property.formatted : Number(node.property.formatted)) : Number(node.property.value);
                        }
                    }
                    this.deviceIndex[deviceAddress] = newDevice;
                    this.deviceList.push(newDevice);
                    this.handleISYStateUpdate(deviceAddress, currentState, currentState_f);
                }
            }
            else {
                this.logger('Ignoring disabled device: ' + deviceName);
            }
        }
    }
    loadElkNodes(result) {
        let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
        p.parseString(result, (err, res) => {
            if (err)
                throw err;
            for (let nodes of res.areas.area.zone) {
                let id = nodes.id;
                let name = nodes.name;
                let alarmDef = nodes.alarmDef;
                let newDevice = new elkdevice_1.ElkAlarmSensor(this, name, 1, id, (alarmDef == 17) ? "coSensor" : "alarmDoorWindowSensor");
                this.zoneMap[newDevice.zone] = newDevice;
            }
        });
    }
    loadElkInitialStatus(result) {
        assert(!!this.elkAlarmPanel, `Initializing ELK Alarm Panel Status, but it's not enabled`);
        let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
        p.parseString(result, (err, res) => {
            if (err)
                throw err;
            let document = new xmldoc.XmlDocument(result);
            for (let nodes of res.ae) {
                this.elkAlarmPanel.setFromAreaUpdate(nodes);
            }
            for (let nodes of res.ze) {
                let id = nodes.zone;
                let zoneDevice = this.zoneMap[id];
                if (zoneDevice !== null) {
                    zoneDevice.setFromZoneUpdate(nodes);
                    if (this.deviceIndex[zoneDevice.address] === null && zoneDevice.isPresent()) {
                        this.deviceList.push(zoneDevice);
                        this.deviceIndex[zoneDevice.address] = zoneDevice;
                    }
                }
            }
        });
    }
    finishInitialize(success, initializeCompleted) {
        this.nodesLoaded = true;
        initializeCompleted();
        if (success) {
            if (this.elkEnabled) {
                this.deviceList.push(this.elkAlarmPanel);
            }
            this.guardianTimer = setInterval(this.guardian.bind(this), 60000);
            this.initializeWebSocket();
        }
    }
    guardian() {
        let timeNow = Date.now();
        if (this.lastActivity && (timeNow - this.lastActivity) > 60000) {
            this.logger('ISY-JS: Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
            if (this.webSocket) {
                this.webSocket.terminate();
            }
            this.initializeWebSocket();
        }
    }
    variableChangedHandler(variable) {
        this.logger('ISY-JS: Variable:' + variable.id + ' (' + variable.type + ') changed');
        if (this.variableCallback !== null && this.variableCallback !== undefined) {
            this.variableCallback(this, variable);
        }
    }
    checkForFailure(response) {
        return (response === null || typeof response === "undefined" || response instanceof Error || response.statusCode !== 200);
    }
    loadVariables(type, done) {
        let options = {
            username: this.userName,
            password: this.password
        };
        let retryCount = 0;
        // Note: occasionally this fails on the first call and we need to re-call
        let getVariableInitialValues = () => {
            // Check if we've exceeded the retry count.
            if (retryCount > 2) {
                throw new Error('Unable to load variables from the ISY after ' + retryCount + ' retries.');
            }
            // Load initial values
            restler.get(this.protocol + '://' + this.isyAddress + '/rest/vars/get/' + type, options).on('complete', (result, response) => {
                if (this.checkForFailure(response)) {
                    this.logger('ISY-JS: Error loading variables from isy: ' + result.message + '\nRetrying...');
                    retryCount++;
                    getVariableInitialValues();
                }
                else {
                    this.setVariableValues(result, done);
                }
            });
        };
        // Callback function to get the variable values after getting definitions
        let loadVariablesCB = (result, response) => {
            if (this.checkForFailure(response)) {
                this.logger('ISY-JS: Error loading variables from isy. Device likely doesn\'t have any variables defined. Safe to ignore.');
                done();
            }
            else {
                this.createVariables(type, result);
                getVariableInitialValues();
            }
        };
        // Load definitions
        restler.get(this.protocol + '://' + this.isyAddress + '/rest/vars/definitions/' + type, options).on('complete', loadVariablesCB);
    }
    getVariableList() {
        return this.variableList;
    }
    getVariable(type, id) {
        let key = this.createVariableKey(type, id);
        if (this.variableIndex[key] !== null && this.variableIndex[key] !== undefined) {
            return this.variableIndex[key];
        }
        return null;
    }
    handleISYVariableUpdate(id, type, value, ts) {
        let variableToUpdate = this.getVariable(type, id);
        if (variableToUpdate !== null) {
            variableToUpdate.value = value;
            variableToUpdate.lastChanged = ts;
            this.variableChangedHandler(variableToUpdate);
        }
    }
    createVariableKey(type, id) {
        return `${type}:${id}`;
    }
    createVariables(type, result) {
        let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
        p.parseString(result, (err, res) => {
            if (err)
                throw err;
            if (res.CList.e) {
                for (let v of res.CList.e) {
                    let newVariable = new isyvariable_1.ISYVariable(this, v.id, v.name, type);
                    // Don't push duplicate variables.
                    if (this.variableList.indexOf(newVariable) !== -1) {
                        return;
                    }
                    if (this.createVariableKey(type, v.id) in this.variableIndex) {
                        return;
                    }
                    this.variableList.push(newVariable);
                    this.variableIndex[this.createVariableKey(type, v.id)] = newVariable;
                }
            }
        });
    }
    setVariableValues(result, callback) {
        let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
        p.parseString(result, (err, res) => {
            if (err)
                throw err;
            if (res.vars.var) {
                for (let vNode of res.vars.var) {
                    let id = vNode.id;
                    let type = vNode.type;
                    let init = parseInt(vNode.init);
                    let value = parseInt(vNode.val);
                    let ts = vNode.ts;
                    let variable = this.getVariable(type, id);
                    if (variable !== null) {
                        variable.value = value;
                        variable.init = init;
                        variable.lastChanged = new Date(ts);
                    }
                }
            }
            callback();
        });
    }
    initialize(initializeCompleted) {
        let that = this;
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(this.protocol + '://' + this.isyAddress + '/rest/nodes', options).on('complete', (result, response) => {
            if (that.checkForFailure(response)) {
                this.logger('ISY-JS: Error:' + result.message);
                throw new Error('Unable to contact the ISY to get the list of nodes');
            }
            else {
                this.webSocket = null;
                this.nodesLoaded = false;
                this.deviceIndex = {};
                this.deviceList = [];
                this.sceneList = [];
                this.sceneIndex = {};
                this.variableList = [];
                this.variableIndex = {};
                this.zoneMap = {};
                // Parse XML response into native JS object.
                let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
                p.parseString(result, (err, res) => {
                    if (err)
                        throw err;
                    //this.logger(JSON.stringify(res, undefined, 3));
                    that.loadNodes(res);
                });
                that.loadVariables(ISYDefs.variableType.integer, () => {
                    that.loadVariables(ISYDefs.variableType.state, () => {
                        if (that.elkEnabled) {
                            restler.get(that.protocol + '://' + that.isyAddress + '/rest/elk/get/topology', options).on('complete', (result, response) => {
                                if (that.checkForFailure(response)) {
                                    that.logger('ISY-JS: Error loading from elk: ' + result.message);
                                    throw new Error('Unable to contact the ELK to get the topology');
                                }
                                else {
                                    that.loadElkNodes(result);
                                    restler.get(that.protocol + '://' + that.isyAddress + '/rest/elk/get/status', options).on('complete', (result, response) => {
                                        if (that.checkForFailure(response)) {
                                            that.logger('ISY-JS: Error:' + result.message);
                                            throw new Error('Unable to get the status from the elk');
                                        }
                                        else {
                                            that.loadElkInitialStatus(result);
                                            that.finishInitialize(true, initializeCompleted);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            that.finishInitialize(true, initializeCompleted);
                        }
                    });
                });
            }
        }).on('error', (err, response) => {
            that.logger('ISY-JS: Error while contacting ISY' + err);
            throw new Error('Error calling ISY' + err);
        }).on('fail', (data, response) => {
            that.logger('ISY-JS: Error while contacting ISY -- failure');
            throw new Error('Failed calling ISY');
        }).on('abort', () => {
            that.logger('ISY-JS: Abort while contacting ISY');
            throw new Error('Call to ISY was aborted');
        }).on('timeout', (ms) => {
            that.logger('ISY-JS: Timed out contacting ISY');
            throw new Error('Timeout contacting ISY');
        });
    }
    handleWebSocketMessage(data) {
        //console.log('WEBSOCKET: ' + event.data)
        this.lastActivity = Date.now();
        let p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
        p.parseString(data, (err, res) => {
            if (err)
                throw err;
            // Uncomment to print JSON to log for every event received.
            // this.logger(JSON.stringify(res, undefined, 3));
            let evt = res.Event;
            if (typeof evt === "undefined" || typeof evt.control === "undefined") {
                return;
            }
            let eventControl = evt.control;
            if (eventControl.startsWith("GV")) {
                eventControl = "GV";
            } // Catch Generic Values ( GV##, Usually Node Servers)
            let actionValue = 0;
            if (typeof evt.action === "object") {
                actionValue = evt.action._;
            }
            else if (typeof evt.action === "number" || typeof evt.action === "string") {
                actionValue = Number(evt.action);
            }
            let formatted = ("fmtAct" in evt) ? (isNaN(Number(evt.fmtAct)) ? evt.fmtAct : Number(evt.fmtAct)) : actionValue;
            switch (eventControl) {
                case 'ST':
                    this.handleISYStateUpdate(evt.node, actionValue, formatted);
                    break;
                case ISYDefs.props.climate.temperature:
                case ISYDefs.props.climate.coolSetPoint:
                case ISYDefs.props.climate.heatSetPoint:
                    let uom = Number(evt.action.uom);
                    let precision = evt.action.prec;
                    actionValue = Number(actionValue);
                    if (precision == 1)
                        actionValue = actionValue / 10.0;
                    else if (precision == 2)
                        actionValue = actionValue / 100.0;
                    if (uom == 17) {
                        // UOM 17 = farenheit, UOM 4 = celcius, UOM 26 = Kelvin (probabaly a Hue bulb Color Temp)
                        actionValue = convertToCelsius(actionValue);
                    }
                    this.handleISYGenericPropertyUpdate(evt.node, actionValue, evt.control, formatted);
                    break;
                case ISYDefs.props.climate.humidity:
                case ISYDefs.props.climate.operatingMode:
                case ISYDefs.props.climate.mode:
                case ISYDefs.props.climate.fan:
                    this.handleISYGenericPropertyUpdate(evt.node, actionValue, evt.control, formatted);
                    break;
                case ISYDefs.props.batteryLevel:
                case ISYDefs.props.zwave.energyPowerFactor:
                case ISYDefs.props.zwave.energyPowerPolarizedPower:
                case ISYDefs.props.zwave.energyPowerCurrent:
                case ISYDefs.props.zwave.energyPowerTotalPower:
                case ISYDefs.props.zwave.energyPowerVoltage:
                    this.handleISYGenericPropertyUpdate(evt.node, actionValue, evt.control, formatted);
                    break;
                case '_19':
                    if (actionValue === 2) {
                        let aeElement = evt.eventInfo.ae;
                        if (aeElement !== null && this.elkAlarmPanel) {
                            if (this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                                this.nodeChangedHandler(this.elkAlarmPanel);
                            }
                        }
                    }
                    else if (actionValue === 3) {
                        let zeElement = evt.eventInfo.ze;
                        let zoneId = zeElement.zone;
                        let zoneDevice = this.zoneMap[zoneId];
                        if (zoneDevice !== null) {
                            if (zoneDevice.setFromZoneUpdate(zeElement)) {
                                this.nodeChangedHandler(zoneDevice);
                            }
                        }
                    }
                    break;
                case '_1':
                    if (actionValue === 6) {
                        let varNode = evt.eventInfo.var;
                        if (varNode !== null) {
                            let id = varNode.id;
                            let type = varNode.type;
                            let val = parseInt(varNode.val);
                            let year = parseInt(varNode.ts.substr(0, 4));
                            let month = parseInt(varNode.ts.substr(4, 2));
                            let day = parseInt(varNode.ts.substr(6, 2));
                            let hour = parseInt(varNode.ts.substr(9, 2));
                            let min = parseInt(varNode.ts.substr(12, 2));
                            let sec = parseInt(varNode.ts.substr(15, 2));
                            let timeStamp = new Date(year, month, day, hour, min, sec);
                            this.handleISYVariableUpdate(id, type, val, timeStamp);
                        }
                    }
                    // Uncomment the following if you are missing events. Excluded by default because "_1:3" events
                    //   are usually duplicates of events already fired. You may want to check for dupes if you
                    //   decide to uncomment this.
                    //
                    // else if (actionValue === 3 || actionValue === '3') {
                    //     // [     ZW029_1]   USRNUM   1 (uom=70 prec=0)
                    //     // [     ZW029_1]       ST   0 (uom=11 prec=0)
                    //     // [     ZW029_1]       ST   0 (uom=11 prec=0)
                    //     // [     ZW029_1]    ALARM  24 (uom=15 prec=0)
                    //     // let inputString = "[     ZW029_1]   USRNUM   1 (uom=70 prec=0)"
                    //     let inputString = evt.eventInfo.replace(/\s\s+/g, ' ');
                    //     const nodeName = inputString.split(']')[0].split('[')[1].trim();
                    //     const nodeValueString = inputString.split(']')[1].split('(')[0].trim();
                    //     const nodeEvent = nodeValueString.split(' ')[0];
                    //     const eventValue = nodeValueString.split(' ')[1];
                    //     this.handleISYGenericPropertyUpdate(nodeName, eventValue, nodeEvent);
                    // }
                    break;
                case 'GV':
                    // this.logger(JSON.stringify(res, undefined, 3));
                    this.handleISYGenericPropertyUpdate(evt.node, actionValue, evt.control, formatted);
                    if ("fmtName" in evt && "fmtAct" in evt) {
                        this.handleISYGenericPropertyUpdate(evt.node, evt.fmtAct, evt.fmtName);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    initializeWebSocket() {
        let auth = 'Basic ' + Buffer.from(this.userName + ':' + this.password).toString('base64');
        this.logger('Connecting to: ' + this.wsprotocol + '://' + this.isyAddress + '/rest/subscribe');
        this.webSocket = new WebSocket(this.wsprotocol + '://' + this.isyAddress + '/rest/subscribe', ['ISYSUB'], {
            headers: {
                'Origin': 'com.universal-devices.websockets.index.ts',
                'Authorization': auth
            }
        });
        this.lastActivity = Date.now();
        this.webSocket.on('message', (event) => {
            this.handleWebSocketMessage(event);
        }).on('error', (err) => {
            this.logger('ISY-JS: Error while contacting ISY: ' + err);
            throw new Error('Error calling ISY' + err);
        }).on('pong', () => {
            this.lastActivity = Date.now();
        }).on('close', () => {
            if (typeof this.pingInterval !== 'undefined' && this.pingInterval != null) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
        });
        this.pingInterval = setInterval(() => {
            this.webSocket.ping();
        }, 10000);
    }
    handleISYStateUpdate(address, state, formatted = undefined) {
        let deviceToUpdate = this.deviceIndex[address];
        if (deviceToUpdate !== undefined && deviceToUpdate !== null && deviceToUpdate instanceof isydevice_1.ISYBaseDevice) {
            if (deviceToUpdate.handleIsyUpdate(state, formatted)) {
                deviceToUpdate.updateType = ISYDefs.updateType.generic;
                this.nodeChangedHandler(deviceToUpdate);
                if (this.scenesInDeviceList) {
                    // Inefficient, we could build a reverse index (device->scene list)
                    // but device list is relatively small
                    for (let index = 0; index < this.sceneList.length; index++) {
                        if (this.sceneList[index].isDeviceIncluded(deviceToUpdate)) {
                            if (this.sceneList[index].reclalculateState()) {
                                deviceToUpdate.updateType = ISYDefs.updateType.generic;
                                this.nodeChangedHandler(this.sceneList[index]);
                            }
                        }
                    }
                }
            }
        }
    }
    handleISYGenericPropertyUpdate(address, state, prop, formatted = undefined) {
        let deviceToUpdate = this.deviceIndex[address];
        if (deviceToUpdate !== undefined && deviceToUpdate !== null && deviceToUpdate instanceof isydevice_1.ISYBaseDevice) {
            if (deviceToUpdate.handleIsyGenericPropertyUpdate(state, prop, formatted)) {
                deviceToUpdate.updateType = ISYDefs.updateType.property;
                this.nodeChangedHandler(deviceToUpdate);
            }
        }
    }
    sendISYCommand(path, handleResult) {
        let uriToUse = this.protocol + '://' + this.isyAddress + '/rest/' + path;
        this.logger('ISY-JS: Sending ISY command...' + uriToUse);
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', (data, response) => {
            if (response && response.statusCode === 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    sendRestCommand(deviceAddress, command, parameter, handleResult) {
        let uriToUse = this.protocol + '://' + this.isyAddress + '/rest/nodes/' + deviceAddress + '/cmd/' + command;
        if (parameter !== null) {
            uriToUse += '/' + parameter;
        }
        this.logger('ISY-JS: Sending command...' + uriToUse);
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', (data, response) => {
            if (response && response.statusCode === 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    sendGetVariable(id, type, handleResult) {
        let uriToUse = this.protocol + '://' + this.isyAddress + '/rest/vars/get/' + type + '/' + id;
        this.logger('ISY-JS: Sending ISY command...' + uriToUse);
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', (result, response) => {
            if (response && response.statusCode === 200) {
                let document = new xmldoc.XmlDocument(result);
                const valChild = document.childNamed('val');
                let val = valChild && parseInt(valChild.val);
                const initChild = document.childNamed('init');
                let init = initChild && parseInt(initChild.val);
                handleResult(val, init);
            }
        });
    }
    sendSetVariable(id, type, value, handleResult) {
        let uriToUse = this.protocol + '://' + this.isyAddress + '/rest/vars/set/' + type + '/' + id + '/' + value;
        this.logger('ISY-JS: Sending ISY command...' + uriToUse);
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', (result, response) => {
            if (response && response.statusCode === 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    runProgram(id, command, handleResult) {
        // Possible Commands: run|runThen|runElse|stop|enable|disable|enableRunAtStartup|disableRunAtStartup
        let uriToUse = this.protocol + '://' + this.isyAddress + '/rest/programs/' + id + '/' + command;
        this.logger('ISY-JS: Sending program command...' + uriToUse);
        let options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', (data, response) => {
            if (response && response.statusCode === 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    getDeviceList() {
        return this.deviceList;
    }
    getDevice(address) {
        return this.deviceIndex[address];
    }
    getSceneList() {
        return this.sceneList;
    }
    getScene(address) {
        return this.sceneIndex[address];
    }
}
exports.ISY = ISY;
//# sourceMappingURL=index.js.map