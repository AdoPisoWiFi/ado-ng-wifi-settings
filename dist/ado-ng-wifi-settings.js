angular.module('ado.wifi-settings.tpls', []).run(['$templateCache', function($templateCache) {$templateCache.put('./wifi-settings.html','\n<div ng-if="!$ctrl.settings.hostapd" uib-alert class="bg-info">\n  Network interface is set to <code>External Access Point</code>. Configure your access point, or select another interface in the advanced options.\n</div>\n\n<form name="wifiForm">\n\n  <div ng-if="$ctrl.settings.hostapd">\n\n    <div class="form-group" ng-class="{\'has-error\' : wifiForm.ssid.$invalid, \'has-success\': wifiForm.ssid.$valid && wifiForm.ssid.$touched}">\n      <label>WiFi Name</label>\n      <input class="form-control" type="text" ng-model="$ctrl.settings.ssid" ng-maxlength="30" name="ssid" required>\n      <span class="help-block" ng-if="wifiForm.ssid.$error.required">SSID is required.</span>\n      <span class="help-block" ng-if="wifiForm.ssid.$error.maxlength">Maximum of 30 characters.</span>\n    </div>\n\n    <div class="form-group" ng-if="!$ctrl.settings.no_wpa" ng-class="{\'has-error\' : wifiForm.wpa_passphrase.$invalid, \'has-success\': wifiForm.wpa_passphrase.$valid && wifiForm.wpa_passphrase.$touched}">\n      <label>WiFi Password <small>(minimum 8 characters)</small></label>\n      <input class="form-control" type="text" name="wpa_passphrase" ng-model="$ctrl.settings.wpa_passphrase" ng-minlength="8" required>\n      <span class="help-block" ng-if="wifiForm.wpa_passphrase.$error.required">WiFi Password is required.</span>\n      <span class="help-block" ng-if="wifiForm.wpa_passphrase.$error.minlength">Minimum of 8 characters.</span>\n    </div>\n\n    <div class="input-demo checkbox-demo">\n      <label class="checkbox-inline custom-checkbox nowrap">\n        <input type="checkbox" ng-model="$ctrl.settings.no_wpa">\n        <span>\n          Open WiFi <small>(no password)</small>\n        </span>\n      </label>\n    </div>\n\n  </div>\n\n  <div class="form-group" ng-if="!$ctrl.settings.dont_limit_stations" ng-class="{\'has-error\' : wifiForm.max_num_sta.$invalid, \'has-success\': wifiForm.max_num_sta.$valid && wifiForm.max_num_sta.$touched}">\n    <label>Max number of wifi users</label>\n    <input class="form-control" type="number" name="max_num_sta" ng-model="$ctrl.settings.max_num_sta" min="1" max="200" required ng-disabled="$ctrl.settings.dont_limit_stations">\n    <span class="help-block" ng-if="wifiForm.max_num_sta.$error.required">This is required</span>\n    <span class="help-block" ng-if="wifiForm.max_num_sta.$error.min">Minimum of 1</span>\n    <span class="help-block" ng-if="wifiForm.max_num_sta.$error.max">Maximum of 200</span>\n  </div>\n\n  <div class="input-demo checkbox-demo" ng-class="{\'has-error\' : wifiForm.dont_limit_stations && wifiForm.max_num_sta.$invalid}">\n    <label class="checkbox-inline custom-checkbox nowrap">\n      <input type="checkbox" ng-model="$ctrl.settings.dont_limit_stations">\n      <span>\n        Don\'t limit the number of users\n      </span>\n    </label>\n  </div>\n\n\n  <div class="input-demo checkbox-demo" ng-if="$ctrl.config.hardware.model != \'espressobin_armbian\'">\n    <label class="checkbox-inline custom-checkbox nowrap">\n      <input type="checkbox" ng-model="$ctrl.settings.show_advanced_options">\n      <span>\n        Show Advanced Options\n      </span>\n    </label>\n  </div>\n\n  <div class="form-group" ng-show="$ctrl.settings.show_advanced_options" ng-class="{\'has-error\': wifiForm.lan.$invalid}">\n\n    <label>Select Interface</label>\n\n    <input ng-if="$ctrl.config.hardware.model !== \'raspberry_pi_3\'" class="form-control" type="text" name="lan" ng-model="$ctrl.settings.lan" required compare-to="$ctrl.config.wan" not-equal>\n    <select ng-if="$ctrl.config.hardware.model === \'raspberry_pi_3\'" class="form-control" name="lan" ng-model="$ctrl.settings.lan" ng-change="$ctrl.setHostapd()">\n      <option value="wlan0">Built-in WiFi</option>\n      <!--<option value="wlan1">USB WiFi</option>-->\n      <option value="eth1">External Access Point</option>\n    </select>\n\n    <span class="help-block" ng-show="wifiForm.lan.$error.compareTo">\n      This interface is currently being used for WAN interface.\n    </span>\n    <span class="help-block" ng-show="wifiForm.lan.$error.required">\n      This is required.\n    </span>\n\n    <div class="checkbox" ng-if="$ctrl.config.hardware.model !== \'raspberry_pi_3\'">\n      <label>\n        <input type="checkbox" ng-model="$ctrl.settings.hostapd" ng-disabled="$ctrl.config.hardware.model === \'raspbberry_pi_3\'">\n        Enable hostapd (for wireless interface only)\n      </label>\n    </div>\n\n  </div>\n\n  <hr>\n\n  <save-config-btn device="$ctrl.device" config="{hostapd: $ctrl.settings.hostapd, lan: $ctrl.settings.lan, hostapd: $ctrl.settings.hostapd, ssid: $ctrl.settings.ssid, wpa_passphrase: $ctrl.settings.wpa_passphrase, no_wpa: $ctrl.settings.no_wpa, max_num_sta: $ctrl.settings.max_num_sta, limit_stations: !$ctrl.settings.dont_limit_stations}" ng-disabled="wifiForm.$invalid || wifiForm.$pristine">Save Changes</save-config-btn>\n\n</form>\n\n');}]);
(function () {
  'use strict';

  var App = angular.module('ado.wifi-settings', [
    'ado.save-config-btn',
    'ado.wifi-settings.tpls'
  ]);

  App.component('adoWifiSettings', {
    bindings: {
      device: '<'
    },
    controller: 'AdoWifiSettingsCtrl',
    templateUrl: './wifi-settings.html'
  });

  App.controller('AdoWifiSettingsCtrl', [
    'adoConfigService',
    function AdoWifiSettingsCtrl(adoConfigService) {

      var $ctrl = this;

      $ctrl.$onInit = function () {

        $ctrl.device = $ctrl.device || {};

        adoConfigService.get({id: $ctrl.device.id})
          .then(function (res) {
            $ctrl.settings = res.data;
            $ctrl.config = angular.copy(res.data);
          });

      };

      $ctrl.setHostapd = function () {
        if ($ctrl.config.hardware.model === 'raspberry_pi_3') {
          $ctrl.settings.hostapd = $ctrl.settings.lan !== 'eth1';
        } else {
          $ctrl.settings.hostapd = false;
        }
      };

    }
  ]);

})();
