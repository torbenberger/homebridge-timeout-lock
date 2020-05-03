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
    this.timer = null;
    this.locked = false;
}

TimeoutLock.prototype.getServices = function() {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Torben Berger")
      .setCharacteristic(Characteristic.Model, "Timeout Lock")
      .setCharacteristic(Characteristic.SerialNumber, "0000000001");

    let switchService = new Service.Switch(this.config.name);
    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.setState.bind(this));

    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
}

TimeoutLock.prototype.getState = function(callback) {
    callback(undefined, this.locked)
}

TimeoutLock.prototype.setState = function(value, callback) {
    this.locked = value;

    if(value) {
        this.log('Activated ' + this.config.name + ' for ' + this.config.timeout + ' seconds');
        clearTimeout(this.timer);

        // create timer
        this.timer = setTimeout(function() {
            this.log('Deactivated ' + this.config.name)
            this.switchService.getCharacteristic(Characteristic.On).setValue(false);
        }.bind(this), this.config.timeout * 1000);
    } else {
        clearTimeout(this.timer);
    }
    
    callback()
}
