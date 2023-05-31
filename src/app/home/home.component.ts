import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MapService } from '@services/map.service';
import { Line, LineRoutes, Polyline } from '@models/interfaces/maps';
import { MapComponent } from "@home/map/map.component";
import Swal from 'sweetalert2';
import { SidebarComponent } from "@home/sidebar/sidebar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ],
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('appMap') appMap!: MapComponent;
  @ViewChild('appSidebar') appSidebar!: SidebarComponent;

  lines: Line[] = [];

  lineRoutesSelected!: LineRoutes;

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


  enableMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (this.appMap.isGpsEnabled) {
          const { latitude, longitude } = position.coords;
          this.appMap.myLocation = {
            lat: latitude,
            lng: longitude,
          };
          navigator.geolocation.clearWatch(this.appMap.watchId);
          this.appMap.map.panTo(this.appMap.myLocation);
          this.appMap.observeMyLocation();
        } else {
          this.appMap.isGpsEnabled = true;
          navigator.geolocation.clearWatch(this.appMap.watchId);
          this.appMap.observeMyLocation();
        }
      }, (error) => {
        const errorIcon = 'error';
        const errorTitle = 'Oops...';
        const errorText = this.getLocationErrorMessage(error);
        this.showAlert(errorIcon, errorTitle, errorText);
      });
    } else {
      this.showAlert('error', 'Oops...', 'La geolocalización no está disponible en este dispositivo.');
    }
  }

  getLocationErrorMessage(error: GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'El usuario no ha permitido el acceso a la geolocalización.';
      case error.POSITION_UNAVAILABLE:
        return 'La información de la geolocalización no está disponible.';
      case error.TIMEOUT:
        return 'La petición de geolocalización ha caducado.';
      default:
        return 'Se ha producido un error desconocido.';
    }
  }

  showAlert(icon: any, title: string, text: string) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
    });
  }

}
