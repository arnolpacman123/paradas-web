import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Line, Polyline } from "@models/interfaces/maps";
import { MapService } from "@services/map.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.scss' ]
})
export class SidebarComponent {
  @Input()
  showChannels: boolean = false;

  @Input()
  showStands: boolean = false;

  @Input()
  lines!: Line[];


  @Input()
  lineRoutesSelected!: Polyline[];

  showLineRouteInfo: boolean = false;

  @Output()
  showChannelsChange = new EventEmitter<boolean>();

  @Output()
  showStandsChange = new EventEmitter<boolean>();

  @Output()
  lineRoutesSelectedChange = new EventEmitter<Polyline[]>();

  constructor(
    private readonly mapService: MapService,
  ) {
  }

  selectLine(line: string) {
    this.mapService.getPolylinesByLine(line).subscribe({
      next: (polylines) => {
        this.lineRoutesSelected = polylines;
        this.lineRoutesSelectedChange.emit(this.lineRoutesSelected);
      },
      error: () => {
        this.lineRoutesSelected = [];
        this.lineRoutesSelectedChange.emit(this.lineRoutesSelected);
      },
    });
  }

  toggleShowChannels() {
    this.showChannels = !this.showChannels;
    this.showChannelsChange.emit(this.showChannels);
  }

  toggleShowStands() {
    this.showStands = !this.showStands;
    this.showStandsChange.emit(this.showStands);
  }
}
