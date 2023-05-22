export interface Marker {
  id?: string;
  position: google.maps.LatLngLiteral;
  options?: google.maps.MarkerOptions;
  title?: string;
  label?: string | google.maps.MarkerLabel;
  info?: string;
}
