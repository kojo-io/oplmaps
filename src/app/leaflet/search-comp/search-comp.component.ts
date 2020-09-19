import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {LeafService} from '../leaf.service';
import {SheetStates} from 'ionic-custom-bottom-sheet';

@Component({
  selector: 'app-search-comp',
  templateUrl: './search-comp.component.html',
  styleUrls: ['./search-comp.component.scss'],
})
export class SearchCompComponent implements OnInit {
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
  @Input() Destinfo: any;
  @Input() Pickinfo: any;
  constructor(private modalCtrl: ModalController, private leafService: LeafService) { }

  ngOnInit() {
    if (this.Destinfo) {
      this.destinationText = this.Destinfo.place;
      this.destinationCoords.lat = this.Destinfo.lat;
      this.destinationCoords.lng = this.Destinfo.long;
    }

    if (this.Pickinfo) {
      this.pickUpText = this.Pickinfo.place;
      this.pickupCoords.lat = this.Pickinfo.lat;
      this.pickupCoords.lng = this.Pickinfo.long;
    }

    console.log(this.Destinfo, this.Pickinfo);
  }

  close() {
    this.modalCtrl.dismiss({setMarker: false, setPickUpMark: false, setDestMark: false});
  }

  searchPickUp(item) {
    const nArray = [];
    this.leafService.locateNominatim(item).subscribe(u => {
      console.log(u);
      u.features.forEach((s) => {
        nArray.push({
          // city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
          // place: `${this.checkUndefined(s.properties?.name)} ${this.checkUndefined(s.properties?.address?.town)} ${this.checkUndefined(s.properties?.address?.road)} ${this.checkUndefined(s.properties?.address?.postcode)}`,
          city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
          place: this.checkUndefined(s.properties?.display_name),
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

  searchDest(item) {
    const nArray = [];
    this.leafService.locateNominatim(item).subscribe(u => {
      console.log('dest', u);
      u.features.forEach((s) => {
        nArray.push({
          // city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
          // place: `${this.checkUndefined(s.properties?.name)} ${this.checkUndefined(s.properties?.address?.town)} ${this.checkUndefined(s.properties?.address?.road)} ${this.checkUndefined(s.properties?.address?.postcode)}`,
          city: `${this.checkUndefined(s.properties?.address?.country)} ${this.checkUndefined(s.properties?.county)} ${this.checkUndefined(s.properties?.state)}`,
          place: this.checkUndefined(s.properties?.display_name),
          lat: s.geometry.coordinates[1],
          long: s.geometry.coordinates[0]
        });
      });

      this.searchDestinationUpList = nArray;
    });
  }

  getDestinationLatLng() {
    this.modalCtrl.dismiss({setMarker: true, setPickUpMark: false, setDestMark: true});
  }

  getPickupLatLng() {
    this.modalCtrl.dismiss({setMarker: true, setPickUpMark: true, setDestMark: false});
  }

  setPickUp(data) {
    this.pickupCoords = { lat: data.lat, lng: data.long };
    this.pickUpText = data.place;
    console.log(this.pickupCoords);
    this.searchPickUpList = [];
    if (!this.pickUpText) {
      this.disable = true;
    } else if (!this.destinationText) {
      this.disable = true;
    } else {
      this.disable = false;
    }
  }

  setDest(data) {
    this.destinationText = data.place;
    this.destinationCoords = { lat: data.lat, lng: data.long };
    console.log(this.destinationCoords);
    this.searchDestinationUpList = [];
    if (!this.pickUpText) {
      this.disable = true;
    } else if (!this.destinationText) {
      this.disable = true;
    } else {
      this.disable = false;
    }
  }

  mapRoute() {
    this.modalCtrl.dismiss({pickupCoords: this.pickupCoords, destinationCoords: this.destinationCoords, route: true});
  }
}
