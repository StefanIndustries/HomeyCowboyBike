import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { Cowboy } from 'node-cowboybike';

class CowboyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('CowboyDriver has been initialized');
  }

  async onPair(session: PairSession) {
    let username = '';
    let password = '';
    let cowboyClient: Cowboy;

    session.setHandler('login', async (data: {username: string, password: string}) => {
      username = data.username.trim();
      password = data.password;
      cowboyClient = new Cowboy(username, password);
      try {
        cowboyClient.getMe();
      } catch {
        return false;
      }
      return true;
    });

    session.setHandler('list_devices', async () => {
      const meData = await cowboyClient.getMe();
      const bike = await cowboyClient.getBike(meData.bike.id);
      const devices = [
        {
          name: bike.nickname,
          data: {
            id: bike.id
          },
          icon: this.getIcon(bike.model.name),
          settings: {
            username: username,
            password: password
          }
        }
      ];
      return devices;
    });
  }

  async onRepair(session: PairSession, device: Homey.Device) {
    let username;
    let password;
    let cowboyClient;
    session.setHandler('login', async (data: {username: string, password: string}) => {
      username = data.username.trim();
      password = data.password;
      cowboyClient = new Cowboy(username, password);
      try {
        cowboyClient.getMe();
        device.setSettings({
          "username": username,
          "password": password
        });
      } catch {
        return false;
      }
      return true;
    });
  }
  private getIcon(modelName: string): string {
    switch (modelName.toLowerCase().replace(' ', '')) {
      case 'cowboy4':
        return `cowboy 4.svg`
      case 'cowboy4st':
        return `cowboy 4 st.svg`
      case 'cowboy3':
        return `cowboy 3.svg`
      case 'cowboy2':
        return `cowboy 2.svg`
      case 'cowboy1':
      case 'cowboy':
        return `cowboy 1.svg`
      default:
        return `default.svg`
    }
  }
}
module.exports = CowboyDriver;
