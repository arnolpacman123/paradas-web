import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment.prod";
import { Observable } from "rxjs";
import { Line, Polyline } from '@models/interfaces/maps';

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

  findClosestPolylineAndPoint(polylines: Polyline[], point: google.maps.LatLngLiteral) {
    return new Observable<Polyline>(observer => {
      let minDistance = Infinity;
      let nearestPolyline!: Polyline;

      polylines.forEach(polyline => {
        (polyline.options.path as google.maps.LatLngLiteral[]).forEach(pointPath => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(pointPath),
            new google.maps.LatLng(point)
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestPolyline = polyline;
          }
        });
      });
      if (nearestPolyline) {
        observer.next(nearestPolyline);
      } else {
        observer.error('Polyline not found');
      }
    });
  }

  findAllLinesRoutes() {
    return this.http.get<Polyline[]>(
      `${ environment.apiUrl }/polylines/lines-routes`
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
