"use strict";

var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-timeout-lock", "TimeoutLock", TimeoutLock);
}

var TimeoutLock = function(log, config) {
    this.config = config;
    this.log = log;
    this.service = new Service.Switch(this.config.name);
    this.service.getCharacteristic(Characteristic.On).on('set', this.setState.bind(this));
    this.service.getCharacteristic(Characteristic.On).on('get', this.getState.bind(this));
    this.timer = null;
    this.locked = false;
}

TimeoutLock.prototype.getServices = function() {
    return [this.service];
}

TimeoutLock.prototype.getState = function() {
    return this.locked
}

TimeoutLock.prototype.setState = function(on) {
    if(on) {
        this.log('Activated ' + this.config.name + ' for ' + this.config.timeout + ' seconds');
        this.locked = true;
        clearTimeout(this.timer);
        
        // create timer
        this.timer = setTimeout(function() {
            this.locked = false;
            this.log('Deactivated ' + this.config.name)
            this.service.getCharacteristic(Characteristic.On).setValue(false, undefined);
        }.bind(this), this.config.timeout * 1000);
    } else {
        this.locked = false;
        clearTimeout(this.timer);
    }
}
