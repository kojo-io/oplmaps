import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeafService {

  constructor(private httpClient: HttpClient) { }

  locateNominatim(info): any {
    return this.httpClient.get(`https://nominatim.openstreetmap.org/search?q=${info}&format=geojson`);
  }

  ReverselocateNominatim(long, lat): any {
    return this.httpClient.get(`https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${long}`);
  }

  locate(info): any {
    return this.httpClient.get(`http://photon.komoot.de/api/?q=${info}`);
  }

  Revserselocate(long, lat): any {
    return this.httpClient.get(`http://photon.komoot.de/reverse?lon=${long}&lat=${lat}`);
  }

  getWaypoint(pickupCoords, destinationCoords): any{
    const url = `http://router.project-osrm.org/route/v1/driving/`;
    return this.httpClient.get(`${url}${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}`);
  }
}
