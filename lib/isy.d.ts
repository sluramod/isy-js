/// <reference types="node" />
import * as WebSocket from 'ws';
import { ServerResponse } from "http";
import * as ISYDefs from './isydefs.json';
import { ISYBaseDevice, ISYDeviceType, ISYDoorWindowDevice, ISYFanDevice, ISYLeakSensorDevice, ISYLightDevice, ISYLockDevice, ISYMotionSensorDevice, ISYOutletDevice, ISYRemoteDevice, ISYThermostatDevice, ISYType } from "./isydevice";
import { ISYGetVariableCallback, ISYVariable } from "./isyvariable";
import { ISYScene } from "./isyscene";
import { ELKAlarmPanelDevice, ElkAlarmSensor } from "./elkdevice";
import { ISYCallback, ISYDeviceInfo, ISYNode } from "./isynode";
import { ISYNodeServerNode } from "./isynodeserver";
export interface ISYRestCommandSender {
    sendRestCommand(deviceAddress: string, command: string, parameter: any | null, handleResult: ISYCallback): void;
}
export interface ISYSetVariableSender {
    sendSetVariable(id: string, type: string, value: string, handleResult: ISYCallback): void;
}
export interface ISYCommandSender {
    sendISYCommand(path: string, handleResult: ISYCallback): void;
}
export declare class ISY implements ISYRestCommandSender, ISYSetVariableSender, ISYCommandSender {
    debugLogEnabled: boolean;
    address: string;
    userName: string;
    password: string;
    protocol: "http" | "https";
    wsprotocol: "ws" | "wss";
    deviceList: ISYNode[];
    deviceIndex: {
        [idx: string]: ISYNode;
    };
    sceneList: ISYScene[];
    sceneIndex: {
        [idx: string]: ISYScene;
    };
    variableList: ISYVariable[];
    variableIndex: {
        [idx: string]: ISYVariable;
    };
    variableCallback: ((owner: ISY, variable: ISYVariable) => void) | undefined;
    changeCallback: (owner: ISY, what: ISYNode) => void;
    elkEnabled: boolean;
    elkAlarmPanel: ELKAlarmPanelDevice | undefined;
    zoneMap: {
        [idx: string]: ElkAlarmSensor;
    };
    nodesLoaded: boolean;
    scenesInDeviceList: boolean;
    defs: typeof ISYDefs;
    lastActivity: number | null;
    guardianTimer: NodeJS.Timeout | null;
    webSocket: WebSocket | null;
    pingInterval: NodeJS.Timeout | null;
    constructor(address: string, username: string, password: string, elkEnabled: false, changeCallback: (owner: ISY, what: ISYNode) => void, useHttps?: boolean, scenesInDeviceList?: boolean, enableDebugLogging?: boolean, variableCallback?: (owner: ISY, variable: ISYVariable) => void);
    logger(msg: string): void;
    buildDeviceInfoRecord(isyType: ISYType, deviceFamily: string, deviceType: ISYDeviceType): {
        type: string;
        address: string;
        name: string;
        deviceType: ISYDeviceType;
        connectionType: string;
        batteryOperated: boolean;
    };
    getDeviceTypeBasedOnISYTable(deviceNode: any): {
        type: string;
        address: string;
        name: string;
        deviceType: ISYDeviceType;
        connectionType: string;
        batteryOperated: boolean;
    } | null;
    nodeChangedHandler(node: ISYNode): void;
    getElkAlarmPanel(): ELKAlarmPanelDevice | undefined;
    loadNodes(result: any): void;
    loadScenes(result: any): void;
    loadDevices(result: any): void;
    loadElkNodes(result: any): void;
    loadElkInitialStatus(result: any): void;
    finishInitialize(success: boolean, initializeCompleted: () => void): void;
    guardian(): void;
    variableChangedHandler(variable: ISYVariable): void;
    checkForFailure(response: ServerResponse | Error | undefined): boolean;
    loadVariables(type: string, done: () => void): void;
    getVariableList(): ISYVariable[];
    getVariable(type: string, id: string): ISYVariable | null;
    handleISYVariableUpdate(id: string, type: string, value: number | undefined, ts: Date): void;
    createVariableKey(type: string, id: string): string;
    createVariables(type: string, result: any): void;
    setVariableValues(result: any, callback: () => void): void;
    initialize(initializeCompleted: () => void): void;
    handleWebSocketMessage(data: WebSocket.Data): void;
    initializeWebSocket(): void;
    handleISYStateUpdate(address: string, state: string | number, formatted?: string | number | undefined): void;
    handleISYGenericPropertyUpdate(address: string, state: string | number, prop: string, formatted?: string | number | undefined): void;
    sendISYCommand(path: string, handleResult: ISYCallback): void;
    sendRestCommand(deviceAddress: string, command: string, parameter: any | null, handleResult: ISYCallback): void;
    sendGetVariable(id: string, type: string, handleResult: ISYGetVariableCallback): void;
    sendSetVariable(id: string, type: string, value: string, handleResult: ISYCallback): void;
    runProgram(id: string, command: string, handleResult: ISYCallback): void;
    getDeviceList(): ISYNode[];
    getDevice(address: string): ISYNode;
    getSceneList(): ISYScene[];
    getScene(address: string): ISYScene;
}
export { ISYCallback, ISYDeviceInfo, ISYNode, ISYBaseDevice, ISYDeviceType, ISYDoorWindowDevice, ISYFanDevice, ISYLeakSensorDevice, ISYLightDevice, ISYLockDevice, ISYMotionSensorDevice, ISYOutletDevice, ISYRemoteDevice, ISYThermostatDevice, ISYType, ISYGetVariableCallback, ISYVariable, ELKAlarmPanelDevice, ElkAlarmSensor, ISYNodeServerNode };
