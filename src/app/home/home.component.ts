import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MapService } from '@services/map.service';
import { Line, Polyline } from '@models/interfaces/maps';
import { MapComponent } from "./map/map.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ],
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('appMap') appMap!: MapComponent;

  lines: Line[] = [];

  isLoading = true;

  lineRoutesSelected!: Polyline[];

  showChannels = false;
  showStands = false;

  constructor(private readonly mapService: MapService) {
    mapService.getLines().subscribe({
      next: (lines) => {
        this.lines = lines;
      },
    });
  }

  closeSidenav(): void {
    this.sidenav.toggle();
  }

  selectLine(line: string) {
    this.isLoading = true;
    this.mapService.getPolylinesByLine(line).subscribe({
      next: (polylines) => {
        this.lineRoutesSelected = polylines;
        this.closeSidenav();
        this.isLoading = false;
      },
      error: () => {
        this.closeSidenav();
        this.isLoading = false;
      },
    });
  }

  rotateRight() {
    this.appMap.rotateMap(22.5);
  }

  enableMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (this.appMap.isGpsEnabled) {
          console.log('GPS enabled');
          const { latitude, longitude } = position.coords;
          this.appMap.myLocation = {
            lat: latitude,
            lng: longitude,
          };
          navigator.geolocation.clearWatch(this.appMap.watchId);
          this.appMap.map.panTo(this.appMap.myLocation);
          this.appMap.observeMyLocation();
        } else {
          console.log('GPS disabled');
          this.appMap.isGpsEnabled = false;
          navigator.geolocation.clearWatch(this.appMap.watchId);
        }
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('El usuario no ha permitido el acceso a la geolocalización.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('La información de la geolocalización no está disponible.');
            break;
          case error.TIMEOUT:
            alert('La petición de geolocalización ha caducado.');
            break;
          default:
            alert('Se ha producido un error desconocido.');
            break;
        }
      });
    } else {
      alert('La geolocalización no está disponible en este dispositivo.');
    }
  }

  rotateLeft() {
    this.appMap.rotateMap(-22.5);
  }
}
