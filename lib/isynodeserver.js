"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ISYNodeServerNode {
    constructor(isy, name, address, deviceType, nodeSlot, parentNode, nodeDefId) {
        this.isy = isy;
        this.name = name;
        this.address = address;
        this.deviceType = deviceType;
        this.nodeSlot = nodeSlot;
        this.parentNode = parentNode;
        this.nodeDefId = nodeDefId;
        this.deviceFriendlyName = 'ISYv5 Node Server Device';
        this.batteryOperated = false;
        this.connectionType = 'ISYv5 Node Server';
        this.currentState = 0;
        this.currentState_f = 0;
        this.properties = {};
        this.lastChanged = new Date();
    }
    get currentState() {
        return this.properties['currentState'];
    }
    set currentState(value) {
        this.properties['currentState'] = value;
    }
    get currentState_f() {
        return this.properties['currentState_f'];
    }
    set currentState_f(value) {
        this.properties['currentState_f'] = value;
    }
    handleIsyUpdate(actionValue, formatted = undefined) {
        if (Number(actionValue) != this.currentState) {
            this.currentState = Number(actionValue);
            this.currentState_f = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.markAsChanged();
            return true;
        }
        else {
            return false;
        }
    }
    handleIsyGenericPropertyUpdate(actionValue, prop, formatted = undefined) {
        if (Number(actionValue) != this.properties[prop]) {
            this.properties[prop] = isNaN(Number(actionValue)) ? actionValue : Number(actionValue);
            this.properties[prop + "_f"] = (typeof formatted !== "undefined") ? ((isNaN(Number(formatted))) ? formatted : Number(formatted)) : Number(actionValue);
            this.markAsChanged();
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
    markAsChanged() {
        this.lastChanged = new Date();
    }
}
exports.ISYNodeServerNode = ISYNodeServerNode;
//# sourceMappingURL=isynodeserver.js.map