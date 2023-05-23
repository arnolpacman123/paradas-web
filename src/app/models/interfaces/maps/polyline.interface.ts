import { Marker } from "@models/interfaces/maps/marker.interface";

export interface Polyline {
  id?: string;
  options: google.maps.PolylineOptions;
  stands: Marker[];
}
