import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {SheetStates} from 'ionic-custom-bottom-sheet';
declare var L: any;
import 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.locatecontrol';
import {ModalController} from '@ionic/angular';
import {SearchCompComponent} from './search-comp/search-comp.component';
import {LeafService} from './leaf.service';

@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.page.html',
  styleUrls: ['./leaflet.page.scss'],
})
export class LeafletPage implements OnInit, AfterViewInit {
  map: any;
  lng: any;
  lat: any;
  mylocation: any;
  markers: Array<any> = [];
  icon = L.icon({
    iconUrl: 'assets/icon/marker-icon-2x.png',
    shadowUrl: 'assets/icon/marker-shadow.png',
    iconSize:     [30, 50], // size of the icon
    shadowSize:   [40, 64], // size of the shadow
    iconAnchor:   [16, 45], // point of the icon which will correspond to marker's location
    shadowAnchor: [14, 59],   // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  marker: any;
  disable = true;
  platform: any;
  routing: any;
  pickUpText = '';
  pickupCoords = {lng: 0, lat: 0};
  destinationCoords = {lng: 0, lat: 0};
  destinationText = '';
  searchPickUpList: Array<any> = [];
  searchDestinationUpList: Array<any> = [];
  setMarker = false;
  setDestMark = false;
  setPickUpMark = false;
  BottomSheetState = SheetStates.Closed;
  @Input() Destinfo: any;
  @Input() Pickinfo: any;
  constructor( private httpClient: HttpClient, private geolocation: Geolocation,
               private leafService: LeafService,
               public modalController: ModalController) {}

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
        this.map = L.map('map', {
          center: [this.lat, this.lng],
          zoom: 18
        });

        // const mark = L.marker(this.map.getCenter(), {
        //   icon: this.icon,
        // });
        // this.marker = mark;
        // this.marker.addTo(this.map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            .addTo(this.map);
        this.mylocation = L.control.locate({setView: 'always', showCompass: true, keepCurrentZoomLevel: true, watch: true}).addTo(this.map);
        this.mylocation.start();
        this.mylocation.stopFollowing();
      }).catch((error) => {
      });
    }, 2000);
  }

  public async OpenSheet() {
    const modal = await this.modalController.create({
      component: SearchCompComponent,
      componentProps: {
      }
    });

    await modal.present();
    const {data} = await modal.onWillDismiss();

    if (data.setMarker) {
      this.setMarker = data.setMarker;
      this.setDestMark = data.setDestMark;
      this.setPickUpMark = data.setPickUpMark;
      if (this.setDestMark) {
        this.getDestinationLatLng(data);
      }
      if (this.setPickUpMark) {
        this.getPickupLatLng(data);
      }
    }
  }

  public StateChanged(event)
  {
    if (event === SheetStates.Closed)
    {
      console.log('Sheet Closed');
    }
    else {
      console.log(event);
    }
  }

  searchPickUp(item) {
    const nArray = [];
    this.leafService.locate(item).subscribe(u => {
      console.log(u);
      u.features.forEach((s) => {
        nArray.push({
          city: `${this.checkUndefined(s.properties?.country)} ${this.checkUndefined(s.properties?.city)} ${this.checkUndefined(s.properties?.state)}`,
          place: `${this.checkUndefined(s.properties?.name)} ${this.checkUndefined(s.properties?.postcode)}`,
          lat: s.geometry.coordinates[1],
          long: s.geometry.coordinates[0]
        });
      });

      this.searchPickUpList = nArray;
    });
  }

  checkUndefined(text) {
    if (text) {
      return `${text},`;
    } else {
      return '';
    }
  }

  setPin() {
    if (this.routing) {
      this.routing.remove();
    }
    if (this.mylocation) {
      this.mylocation.stopFollowing();
    } else {
      this.mylocation = L.control.locate({setView: 'always', showCompass: true, keepCurrentZoomLevel: true}).addTo(this.map);
      this.mylocation.start();
      this.mylocation.stopFollowing();
    }
    if (this.marker) {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
        this.marker.setLatLng(this.lat, this.lng);
      }).catch((error) => {
      });
    }
  }

  trackLocation() {
    if (this.routing) {
      this.routing.remove();
    }
    if (this.mylocation) {
      this.mylocation.start();
    } else {
      this.mylocation = L.control.locate({setView: 'always', showCompass: true, keepCurrentZoomLevel: true, flyTo: true}).addTo(this.map);
      this.mylocation.start();
    }
  }

  fitView() {
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers).addTo(this.map);
      this.map.fitBounds(group.getBounds());
      this.markers.forEach(u => {
        u.remove();
      });
    }
  }

  openMaps() {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${this.pickupCoords.lat},${this.pickupCoords.lng}&destination=${this.destinationCoords.lat},${this.destinationCoords.lng}&travelmode=driving`, '_system');
  }

  searchDest(item) {
    const nArray = [];
    this.leafService.locate(item).subscribe(u => {
      u.forEach((s) => {
        nArray.push({
          place: s.display_name,
          lat: s.lat,
          long: s.lon
        });
      });

      this.searchDestinationUpList = nArray;
    });
  }

  async setDestinationLatLng() {
    this.destinationCoords.lng = this.marker.getLatLng().lng;
    this.destinationCoords.lat = this.marker.getLatLng().lat;
    this.leafService.ReverselocateNominatim(this.destinationCoords.lng, this.destinationCoords.lat).subscribe(async u => {
      console.log(u);
      const s = u.features[0];
      this.Destinfo = {
        // city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
        // place: `${this.checkUndefined(s.properties?.name)} ${this.checkUndefined(s.properties?.address?.town)} ${this.checkUndefined(s.properties?.address?.road)} ${this.checkUndefined(s.properties?.address?.postcode)}`,
        city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
        place: this.checkUndefined(s.properties?.display_name),
        lat: s.geometry.coordinates[1],
        long: s.geometry.coordinates[0]
      };
      const modal = await this.modalController.create({
        component: SearchCompComponent,
        componentProps: {
          Pickinfo: this.Pickinfo,
          Destinfo: this.Destinfo
        }
      });
      this.marker.remove();
      await modal.present();
      const {data} = await modal.onWillDismiss();
      console.log(data);
      if (data.setMarker) {
        this.setMarker = data.setMarker;
        this.setDestMark = data.setDestMark;
        this.setPickUpMark = data.setPickUpMark;
        if (this.setDestMark) {
          this.getDestinationLatLng(data);
        }
        if (this.setPickUpMark) {
          this.getPickupLatLng(data);
        }
      } else {
        if (data) {
          this.pickupCoords = data.pickupCoords;
          this.destinationCoords = data.destinationCoords;
        }

        if (data.route) {
          this.mapRoute();
          this.setMarker = false;
        }
      }
    });
  }

  async setPickUpLatLng() {
    this.pickupCoords.lng = this.marker.getLatLng().lng;
    this.pickupCoords.lat = this.marker.getLatLng().lat;
    this.leafService.ReverselocateNominatim(this.pickupCoords.lng, this.pickupCoords.lat).subscribe(async u => {
      console.log(u);
      const s = u.features[0];
      this.Pickinfo = {
        // city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
        // place: `${this.checkUndefined(s.properties?.name)} ${this.checkUndefined(s.properties?.address?.town)} ${this.checkUndefined(s.properties?.address?.road)} ${this.checkUndefined(s.properties?.address?.postcode)}`,
        city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
        place: this.checkUndefined(s.properties?.display_name),
        lat: s.geometry.coordinates[1],
        long: s.geometry.coordinates[0]
      };

      const modal = await this.modalController.create({
        component: SearchCompComponent,
        componentProps: {
          Pickinfo: this.Pickinfo,
          Destinfo: this.Destinfo
        }
      });
      this.marker.remove();
      await modal.present();
      const {data} = await modal.onWillDismiss();
      console.log(data);
      if (data.setMarker) {
        this.setMarker = data.setMarker;
        this.setDestMark = data.setDestMark;
        this.setPickUpMark = data.setPickUpMark;
        if (this.setDestMark) {
          this.getDestinationLatLng(data);
        }
        if (this.setPickUpMark) {
          this.getPickupLatLng(data);
        }
      } else {
        if (data) {
          this.pickupCoords = data.pickupCoords;
          this.destinationCoords = data.destinationCoords;
        }

        if (data.route) {
          this.mapRoute();
          this.setMarker = false;
        }
      }
    });
  }

  mapRoute(): any {
    if (this.marker) {
      this.marker.remove();
    }
    if (this.mylocation) {
      this.mylocation.stop();
    }
    if (this.routing) {
      this.routing.remove();
    }
    this.markers = [];
    this.markers.push(L.marker([this.pickupCoords.lat, this.pickupCoords.lng]));
    this.markers.push(L.marker([this.destinationCoords.lat, this.destinationCoords.lng]));
    this.routing = L.Routing.control({
      waypoints: [
        L.latLng(this.pickupCoords.lat, this.pickupCoords.lng),
        L.latLng(this.destinationCoords.lat, this.destinationCoords.lng)
      ],
      createMarker: (i, wp, nWps) => {
        if (i === 0 || i === nWps - 1) {
          // here change the starting and ending icons
          return L.marker(wp.latLng, {
            draggable: true,
            icon: this.icon // here pass the custom marker icon instance
          });
        } else {
          // here change all the others
          return L.marker(wp.latLng, {
            icon: this.icon,
            draggable: true,
          });
        }
      },
      // showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        addWaypoints: false
      },
      show: false
    }).addTo(this.map);

    this.routing.on('routesfound', (e) => {
      const distance = e.routes[0];
      console.log('routing distance: ', distance);
    });

    this.Destinfo = null;
    this.Pickinfo = null;
  }

  getDestinationLatLng(info) {
    const dicon = L.icon({
      iconUrl: 'assets/icon/location.png',
      shadowUrl: 'assets/icon/marker-shadow.png',

          iconSize:     [50, 50], // size of the icon
          shadowSize:   [40, 64], // size of the shadow
          iconAnchor:   [26, 45], // point of the icon which will correspond to marker's location
          shadowAnchor: [14, 59],  // the same for the shadow
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    const mark = L.marker(this.map.getCenter(), {
      icon: dicon,
    });
    this.marker = mark;
    this.marker.addTo(this.map);

    this.map.on('move', () => {
      this.marker.setLatLng(this.map.getCenter());
      console.log(this.map.getCenter());
    });

    this.mylocation.stop();
    this.setMarker = info.setMarker;
    this.setPickUpMark = info.setPickUpMark;
    this.setDestMark = info.setDestMark;
  }

  getPickupLatLng(info) {
    const dicon = L.icon({
      iconUrl: 'assets/icon/location.png',
      shadowUrl: 'assets/icon/marker-shadow.png',

      iconSize:     [50, 50], // size of the icon
      shadowSize:   [40, 64], // size of the shadow
      iconAnchor:   [26, 45], // point of the icon which will correspond to marker's location
      shadowAnchor: [14, 59],  // the same for the shadow
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    const mark = L.marker(this.map.getCenter(), {
      icon: dicon,
    });
    this.marker = mark;
    this.marker.addTo(this.map);

    this.map.on('move', () => {
      this.marker.setLatLng(this.map.getCenter());
      console.log(this.map.getCenter());
    });
    this.mylocation.stop();
    this.setMarker = info.setMarker;
    this.setPickUpMark = info.setPickUpMark;
    this.setDestMark = info.setDestMark;
  }

  startMoving() {
    if (this.routing) {
      this.routing.remove();
    }
    this.routing = L.Routing.control({
      waypoints: [
        L.latLng(this.pickupCoords.lat, this.pickupCoords.lng),
        L.latLng(this.destinationCoords.lat, this.destinationCoords.lng)
      ],
      createMarker: () => {},
      // showAlternatives: false,
      // fitSelectedRoutes: true,
      lineOptions: {
        addWaypoints: false
      },
      show: false
    }).addTo(this.map);

    if (this.mylocation) {
      this.mylocation.remove();
      this.mylocation = L.control.locate({setView: 'always', flyTo: true, showCompass: true, locateOptions: {
          maxZoom: 10,
          enableHighAccuracy: true
        }}).addTo(this.map);
      this.mylocation.start();
    } else {
      this.mylocation = L.control.locate({setView: 'always', flyTo: true, showCompass: true, locateOptions: {
          maxZoom: 10,
          enableHighAccuracy: true
        }}).addTo(this.map);
      this.mylocation.start();
    }
  }

  getCenterOfExtent(Extent): any{
    const X = Extent[0] + (Extent[2] - Extent[0]) / 2;
    const Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
    return [X, Y];
  }
}
