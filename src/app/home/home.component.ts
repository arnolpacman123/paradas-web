import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from "@angular/material/sidenav";
import { MapService } from "@services/map.service";
import { Polyline } from "@models/interfaces/maps/polyline";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  lines: string[] = [
    "1",
    "3",
    "4",
    "5",
    "9 VERDE",
    "9 AMARILLO",
    "10",
    "15",
    "16 AZUL",
    "22 ROJO",
    "23",
    "24",
    "30",
    "31",
    "32 VERDE",
    "33",
    "40",
    "42",
    "44 ROJO",
    "51",
    "60 VERDE",
    "78",
    "84",
    "87",
    "121",
    "116",
    "119 ROJO",
    "105 ROJO",
    "119 AZUL",
    "136 URBANO",
  ];

  isLoading = true;

  lineRoutesSelected!: Polyline[];

  constructor(
    private readonly mapService: MapService
  ) {
  }

  closeSidenav(): void {
    this.sidenav.close();
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
}
