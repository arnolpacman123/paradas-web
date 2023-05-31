import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Line, LineRoutes } from "@models/interfaces/maps";
import { MapService } from "@services/map.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input()
  showChannels: boolean = false;

  @Input()
  showStands: boolean = false;

  @Input()
  lines!: Line[];

  @Input()
  lineRoutesSelected!: LineRoutes;

  showLineRouteInfo: boolean = false;

  @Output()
  showChannelsChange = new EventEmitter<boolean>();

  @Output()
  showStandsChange = new EventEmitter<boolean>();

  @Output()
  lineRoutesSelectedChange = new EventEmitter<LineRoutes>();

  lineSelected!: string;

  searchText: string = '';

  @Input()
  result: Line[] = this.lines;

  constructor(
    private readonly mapService: MapService,
  ) {
  }

  selectLine(line: string) {
    this.mapService.getLineRoutesByLine(line).subscribe({
      next: (lineRoutes) => {
        this.lineRoutesSelected = lineRoutes;
        this.lineRoutesSelectedChange.emit(this.lineRoutesSelected);
      },
      error: () => {
        this.lineRoutesSelected = undefined!;
        this.lineRoutesSelectedChange.emit(this.lineRoutesSelected);
      },
    });
  }

  search(searchText: string) {
    this.result = this.lines.filter((line) => line.name.includes(searchText.toUpperCase()));
  }

  onSearchText() {
    this.search(this.searchText);
  }

  toggleShowChannels() {
    this.showChannels = !this.showChannels;
    this.showChannelsChange.emit(this.showChannels);
  }

  toggleShowStands() {
    this.showStands = !this.showStands;
    this.showStandsChange.emit(this.showStands);
  }

  selectShowLineRouteInfo(line: string) {
    this.showLineRouteInfo = !this.showLineRouteInfo;
    this.lineSelected = line;
  }

  getFileImage(line: string) {
    return `LINEA ${line}.jpg`.replace(' ', '+');
  }
}
