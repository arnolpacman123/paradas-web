import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment.prod";
import { Observable } from "rxjs";
import { Line, LineRoutes, Polyline } from '@models/interfaces/maps';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getPolylinesByLine(line: string) {
    return this.http.get<Polyline[]>(
      `${ environment.apiUrl }/polylines/find-one-by-line/${ line }`
    );
  }

  
  getLineRoutesByLine(line: string) {
    return this.http.get<LineRoutes>(
      `${ environment.apiUrl }/lines-routes/${ line }`
    );
  }

  findClosestPolylineAndPoint(linesRoutes: LineRoutes[], point: google.maps.LatLngLiteral) {
    return new Observable<LineRoutes>(observer => {
      let minDistance = Infinity;
      let nearestLineRoutes!: LineRoutes;

      linesRoutes.forEach(lineRoutes => {
        lineRoutes.lineRoutesOptions.forEach(lineRouteOption => {
          (lineRouteOption.options.path as google.maps.LatLngLiteral[]).forEach(pointPath => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(pointPath),
              new google.maps.LatLng(point)
            );
    
            if (distance < minDistance) {
              minDistance = distance;
              nearestLineRoutes = lineRoutes;
            }
          });         
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
    return this.http.get<LineRoutes[]>(
      `${ environment.apiUrl }/lines-routes`
    );
  }

  findAllChannels() {
    return this.http.get<Polyline[]>(
      `${ environment.apiUrl }/polylines/channels`
    );
  }


  getLines() {
    return this.http.get<Line[]>(
      `${ environment.apiUrl }/lines`
    );
  }

  findOneByStand(standPosition: google.maps.LatLngLiteral) {
    return this.http.post<Polyline>(
      `${ environment.apiUrl }/polylines/find-one-by-stand`,
      {
        lat: standPosition.lat,
        lng: standPosition.lng,
      }
    );
  }
}
