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
