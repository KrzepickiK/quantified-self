import {Data} from './data';

export class DataTemperature extends Data {
  static className = 'DataTemperature';
  static type = 'Temperature';
  static unit = '°C';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
