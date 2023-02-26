import Homey from 'homey';
import { Cowboy } from 'node-cowboybike';

class CowboyDevice extends Homey.Device {

  private cowboyClient: Cowboy | undefined;
  private bikeId: number | undefined;
  private pollInterval: any;
  private lastCrash: Date | undefined;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.bikeId = <number> this.getData().id;
    this.cowboyClient = new Cowboy(this.getSetting('username'), this.getSetting('password'));
    try {
      const meData = await this.cowboyClient.getMe();
      await this.updateBikeData();
    } catch (exception) {
      this.log(exception);
      this.setUnavailable();
    }
    this.setAvailable();
    this.startPolling();
    this.log('Cowboy device has been initialized');
  }

  private async startPolling() {
    this.pollInterval = this.homey.setInterval(async () => {
      try {
        this.setAvailable();
        await this.updateBikeData();
      } catch (exception) {
        this.log(exception);
        this.setUnavailable();
      }
    }, 30 * 60000) // 30 minutes
  }

  private async updateBikeData() {
    const bikeData = await this.cowboyClient?.getBike(this.bikeId!);
    this.setCapabilityValue('measure_battery', bikeData?.battery_state_of_charge);
    this.setCapabilityValue('measure_battery_bike', bikeData?.pcb_battery_state_of_charge);
    if (this.lastCrash && this.lastCrash !== bikeData?.last_crash_started_at) {
      this.setCapabilityValue('alarm_crashed', true);
    } else {
      this.lastCrash = bikeData?.last_crash_started_at;
      this.setCapabilityValue('alarm_crashed', bikeData?.crashed);
    }
    this.setCapabilityValue('meter_autonomy', Math.round((bikeData!.autonomy / 100) * bikeData!.battery_state_of_charge));
    this.setCapabilityValue('meter_total_distance', Math.round(bikeData!.total_distance));
    this.setCapabilityValue('meter_total_duration', Math.round(bikeData!.total_duration / 3600));
    this.setCapabilityValue('meter_total_co2_saved', Math.round(bikeData!.total_co2_saved / 1000));
    this.setCapabilityValue('latitude', bikeData?.position.latitude);
    this.setCapabilityValue('longitude', bikeData?.position.longitude);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('Cowboy device has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: [] }): Promise<string|void> {
    this.log('Cowboy device settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('Cowboy device was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    if (this.pollInterval) {
      this.homey.clearInterval(this.pollInterval);
    }
    this.log('Cowboy device has been deleted');
  }
}

module.exports = CowboyDevice;
