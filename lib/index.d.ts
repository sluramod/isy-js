/// <reference types="node" />
import * as WebSocket from 'ws';
import { ServerResponse } from "http";
import { ISYBaseDevice, ISYDeviceType, ISYDoorWindowDevice, ISYFanDevice, ISYLeakSensorDevice, ISYLightDevice, ISYLockDevice, ISYMotionSensorDevice, ISYOutletDevice, ISYRemoteDevice, ISYThermostatDevice, ISYType, ISYFanDeviceState } from "./isydevice";
import { ISYGetVariableCallback, ISYVariable } from "./isyvariable";
import { ISYScene } from "./isyscene";
import { ELKAlarmPanelDevice, ElkAlarmSensor } from "./elkdevice";
import { ISYCallback, ISYDeviceInfo, ISYNode } from "./isynode";
import { ISYNodeServerNode } from "./isynodeserver";
export interface HasISYAddress {
    isyAddress: string;
}
export interface ISYRestCommandSender extends HasISYAddress {
    sendRestCommand(deviceAddress: string, command: string, parameter: any | null, handleResult: ISYCallback): void;
}
export interface ISYSetVariableSender extends HasISYAddress {
    sendSetVariable(id: string, type: string, value: string, handleResult: ISYCallback): void;
}
export interface ISYCommandSender extends HasISYAddress {
    sendISYCommand(path: string, handleResult: ISYCallback): void;
}
export declare class ISY implements HasISYAddress, ISYRestCommandSender, ISYSetVariableSender, ISYCommandSender {
    isyAddress: string;
    userName: string;
    password: string;
    elkEnabled: boolean;
    changeCallback: (owner: ISY, what: ISYNode) => void;
    variableCallback?: ((owner: ISY, variable: ISYVariable) => void) | undefined;
    debugLogEnabled: boolean;
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
    elkAlarmPanel: ELKAlarmPanelDevice | undefined;
    zoneMap: {
        [idx: string]: ElkAlarmSensor;
    };
    nodesLoaded: boolean;
    scenesInDeviceList: boolean;
    lastActivity: number | null;
    guardianTimer: NodeJS.Timeout | null;
    webSocket: WebSocket | null;
    pingInterval: NodeJS.Timeout | null;
    constructor(isyAddress: string, userName: string, password: string, elkEnabled: boolean, changeCallback: (owner: ISY, what: ISYNode) => void, useHttps?: boolean, scenesInDeviceList?: boolean, enableDebugLogging?: boolean, variableCallback?: ((owner: ISY, variable: ISYVariable) => void) | undefined);
    logger(msg: string): void;
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
export { ISYFanDeviceState, ISYCallback, ISYDeviceInfo, ISYNode, ISYBaseDevice, ISYDeviceType, ISYDoorWindowDevice, ISYFanDevice, ISYLeakSensorDevice, ISYLightDevice, ISYLockDevice, ISYMotionSensorDevice, ISYOutletDevice, ISYRemoteDevice, ISYThermostatDevice, ISYType, ISYGetVariableCallback, ISYVariable, ELKAlarmPanelDevice, ElkAlarmSensor, ISYNodeServerNode };
