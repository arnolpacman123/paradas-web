import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Marker, Polyline } from '@models/interfaces/maps';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { MapService } from '@services/map.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myGoogleMap', { static: false })
  map!: GoogleMap;
  @ViewChild('search')
  searchElementRef!: ElementRef;

  options: google.maps.MapOptions = {
    disableDoubleClickZoom: true,
    gestureHandling: 'greedy',
    fullscreenControl: true,
    mapTypeControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    streetViewControl: true,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP,
    },
    restriction: {
      latLngBounds: {
        north: -17.136612047846986,
        east: -62.59999999999444,
        south: -18.299612047847986,
        west: -63.59995002009344,
      },
    },
    zoom: 14,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    mapId: 'a24e498d0a606a2d'
  };
  center: google.maps.LatLngLiteral = {
    lat: -17.797612047846986,
    lng: -63.19975002009344,
  };

  myLocationOptions: google.maps.MarkerOptions = {
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillOpacity: 1,
      strokeWeight: 2,
      fillColor: '#5384ED',
      strokeColor: '#ffffff',
    },
  };

  @Input()
  lineRoutes!: Polyline[];

  destinationMarker!: Marker;

  allLinesRoutes: Polyline[] = [];

  allChannels: Polyline[] = [];

  allStands: Marker[] = [];

  @ViewChild(MapInfoWindow, { static: false })
  info!: MapInfoWindow;

  infoContent = '';

  isLoading = false;

  nearestPolylines!: Polyline[];
  zoom = 14;

  myLocation!: google.maps.LatLngLiteral;

  @Input()
  showChannels = false;

  @Input()
  showStands = false;
  watchId!: number;

  isGpsEnabled = false;

  constructor(
    private readonly mapService: MapService,
    private readonly ngZone: NgZone,
    private readonly route: ActivatedRoute,
  ) {
    this.mapService.findAllLinesRoutes().subscribe({
      next: (lineRoutes) => {
        this.allLinesRoutes = lineRoutes;
      },
    });
    this.mapService.findAllChannels().subscribe({
      next: (channels) => {
        this.allChannels = channels;
        this.allChannels.forEach((channel) => {
          const stands = channel.stands!;
          this.allStands.push(...stands);
        });
      },
    });
  }

  ngOnInit(): void {
    this.enableMyLocation();
  }

  enableMyLocation() {
    // Verificar si el navegador admite la geolocalización
    if ("geolocation" in navigator) {
      this.isGpsEnabled = false;

      // Verificar el estado inicial de la geolocalización
      this.checkGpsStatus();

      // Verificar el estado de la geolocalización en un intervalo regular (por ejemplo, cada segundo)
      setInterval(this.checkGpsStatus, 1000);
    } else {
      console.log("La geolocalización no es compatible en este navegador.");
    }
  }

  checkGpsStatus = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        if (!this.isGpsEnabled) {
          // El GPS se activó
          console.log("El GPS está activado");
          this.isGpsEnabled = true;

          // Obtener la ubicación actual
          this.watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            console.log("Ubicación actualizada");
            console.log("Latitud: " + latitude);
            console.log("Longitud: " + longitude);
            this.myLocation = {
              lat: latitude,
              lng: longitude,
            };
          }, () => {
            this.myLocation = undefined!;
          });
        }
      },
      () => {
        if (this.isGpsEnabled) {
          // El GPS se desactivó
          console.log("El GPS está desactivado");
          this.isGpsEnabled = false;
          navigator.geolocation.clearWatch(this.watchId);
          this.myLocation = undefined!;
        }
      }
    );
  };

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        const standString = params['stand'];
        if (!standString) {
          return;
        }
        const [ lat, lng ] = (standString as string)
          .split(',')
          .map((value) => +value);
        this.putMarker({ lat, lng });
        this.putPolylineClosestToStand({ lat, lng });
        this.map.panTo({ lat, lng });
        this.zoom = 20;
      },
    });

    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      {
        componentRestrictions: { country: 'bo' },
      }
    );

    // Align search box to center
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        const position: google.maps.LatLngLiteral = {
          lat: place.geometry.location?.lat()!,
          lng: place.geometry.location?.lng()!,
        };

        this.mapService
          .findClosestPolylineAndPoint(this.allLinesRoutes, position)
          .subscribe({
            next: (nearestPolylines) => {
              this.lineRoutes = nearestPolylines;
            },
          });
        this.destinationMarker = {
          position,
        };
        this.map.panTo(position);
      });
    });
  }

  ngOnDestroy(): void {
    this.ngZone.runOutsideAngular(() => {
      navigator.geolocation.clearWatch(this.watchId);
    });
  }

  eventHandler(event: any, name: string) {
    // Add marker on double click event
    if (name === 'mapDblclick') {
      this.dropMarker(event);
      this.findClosestPolylineAndPoint(event);
    }
  }

  findClosestPolylineAndPoint(event: any) {
    this.isLoading = true;
    const point: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.mapService
      .findClosestPolylineAndPoint(this.allLinesRoutes, point)
      .subscribe({
        next: (nearestPolylines) => {
          this.lineRoutes = nearestPolylines;
          this.isLoading = false;
        },
      });
  }

  dropMarker(event: any) {
    const position: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.putMarker(position);
    this.lineRoutes = [];
  }

  putMarker(position: google.maps.LatLngLiteral) {
    this.destinationMarker = {
      position: {
        lat: position.lat,
        lng: position.lng,
      },
    };
  }

  clearMarker() {
    this.destinationMarker = undefined!;
    this.lineRoutes = [];
  }

  rotateMap(value: number) {
    const mapInstance = this.map.googleMap!;
    const currentHeading = mapInstance.getHeading() || 0;
    const newHeading = currentHeading + value;
    mapInstance.setOptions({ heading: newHeading });
  }

  get height(): number {
    return window.innerHeight - 90;
  }

  private putPolylineClosestToStand(param: google.maps.LatLngLiteral) {
    // this.mapService.findOneByStand(param).subscribe({
    //   next: (polyline) => {
    //     this.nearestPolyline = polyline;
    //   },
    // });
  }
}
