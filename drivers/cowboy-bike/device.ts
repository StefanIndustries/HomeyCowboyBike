import Homey from 'homey';
import { Cowboy } from 'node-cowboybike';
import { Bike } from 'node-cowboybike/lib/Models/Bike';

class CowboyDevice extends Homey.Device {

  private cowboyClient: Cowboy | undefined;
  private bikeId: number | undefined;
  private pollInterval: any;

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
      await this.updateBikeData();
    }, 10 * 60000) // 10 minutes
  }

  private async updateBikeData() {
    const bikeData = await this.cowboyClient?.getBike(this.bikeId!);
    this.setCapabilityValue('measure_battery', bikeData?.battery_state_of_charge)
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
    this.log('Cowboy device has been deleted');
  }
}

module.exports = CowboyDevice;
