import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MapService } from '@services/map.service';
import { Line, Polyline } from '@models/interfaces/maps';
import { MapComponent } from "./map/map.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
  }

  rotateLeft() {
    this.appMap.rotateMap(-22.5);
  }
}
