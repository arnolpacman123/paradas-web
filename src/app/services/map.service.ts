import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';
import { Observable } from 'rxjs';
import { Line, LineRoutes, Polyline } from '@models/interfaces/maps';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private readonly http: HttpClient) {}

  getPolylinesByLine(line: string) {
    return this.http.get<Polyline[]>(
      `${environment.apiUrl}/polylines/find-one-by-line/${line}`
    );
  }

  getLineRoutesByLine(line: string) {
    return this.http.get<LineRoutes>(
      `${environment.apiUrl}/lines-routes/${line}`
    );
  }

  findBestLines(
    allLinesRoutes: LineRoutes[],
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) {
    return new Observable<LineRoutes[]>((observer) => {
      // Buscar la ruta más cercana al origen y al destino
      let nearestLineRoutes: LineRoutes = undefined!;
      let minDistanceOrigin = Infinity;
      let minDistanceDestination = Infinity;
      allLinesRoutes.forEach((lineRoutes) => {
        lineRoutes.lineRoutesOptions.forEach((lineRouteOption) => {
          (lineRouteOption.options.path as google.maps.LatLngLiteral[]).forEach(
            (pointPath) => {
              const distanceOrigin =
                google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(pointPath),
                  new google.maps.LatLng(origin)
                );
              const distanceDestination =
                google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(pointPath),
                  new google.maps.LatLng(destination)
                );

              // La distancia no debe ser mayor a 200
              if (distanceOrigin < minDistanceOrigin && distanceOrigin < 1000) {
                minDistanceOrigin = distanceOrigin;
                nearestLineRoutes = lineRoutes;
              }
              if (
                distanceDestination < minDistanceDestination &&
                distanceDestination < 1000
              ) {
                minDistanceDestination = distanceDestination;
                nearestLineRoutes = lineRoutes;
              }
            }
          );
        });
      });

      if (nearestLineRoutes) {
        observer.next([nearestLineRoutes]);
      } else {
        observer.error('No se encontró la ruta más cercana');
      }
    });
  }

  findClosestRoute(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ): Observable<google.maps.Polyline> {
    return new Observable<google.maps.Polyline>((observer) => {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
            const polylineEncoded =
              directionsRenderer.getDirections()!.routes[0].overview_polyline;
            const polyline = new google.maps.Polyline({
              path: google.maps.geometry.encoding.decodePath(polylineEncoded),
            });
            observer.next(polyline);
          } else {
            observer.error('Directions request failed due to ' + status);
          }
        }
      );
    });
  }

  findLinesRoutesClosestToPolyline(
    polylineResult: google.maps.Polyline,
    allLinesRoutes: LineRoutes[]
  ): Observable<LineRoutes[]> {
    return new Observable<LineRoutes[]>((observer) => {
      const nearestLinesRoutes: LineRoutes[] = [];
      let minDistance = Infinity;
      // allLinesRoutes.forEach((lineRoutes) => {
      //   lineRoutes.lineRoutesOptions.forEach((lineRouteOption) => {
      //     (lineRouteOption.options.path as google.maps.LatLngLiteral[]).forEach(
      //       (pointPath) => {
      //         for (const pointPolyline of polylineResult
      //           .getPath()!
      //           .getArray()) {
      //           const distance =
      //             google.maps.geometry.spherical.computeDistanceBetween(
      //               new google.maps.LatLng(pointPath),
      //               pointPolyline
      //             );
      //           // La distancia no debe ser mayor a 200 metros
      //           if (distance < minDistance && distance < 200) {
      //             minDistance = distance;
      //             if (!nearestLinesRoutes.includes(lineRoutes)) {
      //               nearestLinesRoutes.push(lineRoutes);
      //             }
      //           }
      //         }
      //       }
      //     );
      //   });
      // });
      if (nearestLinesRoutes.length > 0) {
        observer.next(nearestLinesRoutes);
      } else {
        observer.error('Polyline not found');
      }
    });
  }

  findClosestPolylineAndPoint(
    linesRoutes: LineRoutes[],
    point: google.maps.LatLngLiteral
  ) {
    return new Observable<LineRoutes>((observer) => {
      let minDistance = Infinity;
      let nearestLineRoutes!: LineRoutes;
      linesRoutes.forEach((lineRoutes) => {
        lineRoutes.lineRoutesOptions.forEach((lineRouteOption) => {
          (lineRouteOption.options.path as google.maps.LatLngLiteral[]).forEach(
            (pointPath) => {
              const distance =
                google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(pointPath),
                  new google.maps.LatLng(point)
                );

              if (distance < minDistance) {
                minDistance = distance;
                nearestLineRoutes = lineRoutes;
              }
            }
          );
        });
        // (polyline.options.path as google.maps.LatLngLiteral[]).forEach(pointPath => {
        //   const distance = google.maps.geometry.spherical.computeDistanceBetween(
        //     new google.maps.LatLng(pointPath),
        //     new google.maps.LatLng(point)
        //   );

        //   if (distance < minDistance) {
        //     minDistance = distance;
        //     nearestPolyline = polyline;
        //   }
        // });
      });
      if (nearestLineRoutes) {
        observer.next(nearestLineRoutes);
      } else {
        observer.error('Polyline not found');
      }
    });
  }

  findAllLinesRoutes() {
    return this.http.get<LineRoutes[]>(`${environment.apiUrl}/lines-routes`);
  }

  findAllChannels() {
    return this.http.get<Polyline[]>(
      `${environment.apiUrl}/polylines/channels`
    );
  }

  getLines() {
    return this.http.get<Line[]>(`${environment.apiUrl}/lines`);
  }

  findOneByStand(standPosition: google.maps.LatLngLiteral) {
    return this.http.post<Polyline>(
      `${environment.apiUrl}/polylines/find-one-by-stand`,
      {
        lat: standPosition.lat,
        lng: standPosition.lng,
      }
    );
  }
}
