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
    this.timer = null;
}

TimeoutLock.prototype.getServices = function() {
    return [this.service];
}

TimeoutLock.prototype.setState = function(on, callback) {
    if(on) {
        this.log('Activated ' + this.config.name + ' for ' + this.config.timeout + ' seconds');
        clearTimeout(this.timer);
        
        // create timer
        this.timer = setTimeout(function() {
            this.service.getCharacteristic(Characteristic.On).setValue(false, undefined);
        }.bind(this), this.config.timeout * 1000);
    } else {
        clearTimeout(this.timer);
    }
}
