"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ISYVariable {
    constructor(isy, id, name, type) {
        this.isy = isy;
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = undefined;
        this.init = undefined;
        this.lastChanged = new Date();
    }
    markAsChanged() {
        this.lastChanged = new Date();
    }
    sendSetValue(value, onComplete) {
        this.isy.sendSetVariable(this.id, this.type, value, (success) => {
            onComplete(success);
        });
    }
}
exports.ISYVariable = ISYVariable;
//# sourceMappingURL=isyvariable.js.map