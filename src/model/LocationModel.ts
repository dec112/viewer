import { Message } from "./MessageModel";

export class Coordinates {
  constructor(
    public longitude: number,
    public latitude: number,
  ) { }

  static fromJson(json: any): Coordinates {
    return new Coordinates(
      json.lon,
      json.lat,
    );
  }
}

export class Location {
  constructor(
    public coords: Coordinates,
    public radius: number,
    public method: string,
    public message: Message,
  ) { }

  static fromJson(json: any, message: Message): Location {
    return new Location(
      Coordinates.fromJson(json),
      json.rad,
      json.method,
      message,
    );
  }
}