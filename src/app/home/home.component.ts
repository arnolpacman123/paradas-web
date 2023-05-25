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
    alert('Habilitar geolocalización');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        alert('Geolocalización habilitada');
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Latitud: ${ latitude }, Longitud: ${ longitude }`);
      }, (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
           alert("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
           alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
           alert("The request to get user location timed out.");
            break;
          default:
           alert("An unknown error occurred.");
            break;
      });
    } else {
      alert('La geolocalización no está disponible en este dispositivo.');
    }
  }

  rotateLeft() {
    this.appMap.rotateMap(-22.5);
  }
}
