import Homey from 'homey';

class CowboyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('CowboyApp has been initialized');
  }

}

module.exports = CowboyApp;
