export class Utils {
  static convertUTCDateToLocalDate(date: Date): Date {
    if (!date) {
      return null;
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  }

  static convertLocalDateToUTCDate(date: Date): Date {
    if (!date) {
      return null;
    }
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  }

  static randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
