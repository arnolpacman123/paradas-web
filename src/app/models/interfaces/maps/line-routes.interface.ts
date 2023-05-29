export interface LineRoutes {
  name: string;
  lineRoutesOptions: [LineRouteOptions, LineRouteOptions];
}

export interface LineRouteOptions {
  direction: string;
  options: google.maps.PolylineOptions;
}