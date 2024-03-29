import { Message } from "./MessageModel";

export class Coordinates {
  constructor(
    public longitude?: number,
    public latitude?: number,
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
    public message: Message,
    public radius?: number,
    public method?: string,
    public timestamp?: Date,
  ) { }

  static fromJson(json: any, message: Message): Location {
    const { timestamp } = json;

    return new Location(
      Coordinates.fromJson(json),
      message,
      json.rad,
      json.method,
      timestamp ? new Date(timestamp) : undefined,
    );
  }
}