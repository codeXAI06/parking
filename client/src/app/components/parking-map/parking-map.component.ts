import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { ParkingService } from '../../services/parking.service';
import { SocketService } from '../../services/socket.service';
import { ParkingArea, SlotUpdateEvent } from '../../models/parking.model';

@Component({
  selector: 'app-parking-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-map.component.html',
  styleUrls: ['./parking-map.component.css']
})
export class ParkingMapComponent implements OnInit, OnDestroy, AfterViewInit {
  private map!: L.Map;
  private markers: Map<string, L.Marker> = new Map();
  parkingAreas: ParkingArea[] = [];
  selectedParking: ParkingArea | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  private subscriptions: Subscription[] = [];

  // Custom icons
  private availableIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMyN2FlNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+UDwvdGV4dD48L3N2Zz4=',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });

  private limitedIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNmMzljMTIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+UDwvdGV4dD48L3N2Zz4=',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });

  private fullIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNlNzRjM2MiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+UDwvdGV4dD48L3N2Zz4=',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });

  constructor(
    private parkingService: ParkingService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadParkingAreas();
    this.setupRealtimeUpdates();
    this.getUserLocation();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Default center (New York City)
    const defaultCenter: L.LatLngExpression = [40.7128, -74.0060];
    
    this.map = L.map('map').setView(defaultCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add user location marker if available
    if (this.userLocation) {
      const userIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzM0OThkYiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('Your Location');
    }
  }

  loadParkingAreas(): void {
    const sub = this.parkingService.getAllParkings().subscribe({
      next: (parkings: ParkingArea[]) => {
        this.parkingAreas = parkings;
        this.addMarkersToMap();
      },
      error: (err: any) => console.error('Error loading parkings:', err)
    });
    this.subscriptions.push(sub);
  }

  setupRealtimeUpdates(): void {
    const socketSub = this.socketService.onSlotUpdated().subscribe({
      next: (update: SlotUpdateEvent) => {
        this.handleSlotUpdate(update);
      },
      error: (err: any) => console.error('Socket error:', err)
    });
    this.subscriptions.push(socketSub);
  }

  handleSlotUpdate(update: SlotUpdateEvent): void {
    const parking = this.parkingAreas.find(p => p._id === update.parkingId);
    if (parking) {
      const slot = parking.slots.find(s => s.slotNumber === update.slotNumber);
      if (slot) {
        slot.isAvailable = update.isAvailable;
      }
      parking.availableSlots = update.availableSlots;
      
      // Update marker icon
      this.updateMarkerIcon(parking);
      
      // Update selected parking if it's the one that changed
      if (this.selectedParking?._id === update.parkingId) {
        this.selectedParking = { ...parking };
      }
    }
  }

  addMarkersToMap(): void {
    if (!this.map) return;

    this.parkingAreas.forEach(parking => {
      const icon = this.getIconForParking(parking);
      const marker = L.marker([parking.location.lat, parking.location.lng], { icon })
        .addTo(this.map);

      const popupContent = this.createPopupContent(parking);
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        this.selectedParking = parking;
      });

      this.markers.set(parking._id, marker);
    });
  }

  updateMarkerIcon(parking: ParkingArea): void {
    const marker = this.markers.get(parking._id);
    if (marker) {
      const icon = this.getIconForParking(parking);
      marker.setIcon(icon);
      
      // Update popup content
      const popupContent = this.createPopupContent(parking);
      marker.setPopupContent(popupContent);
    }
  }

  getIconForParking(parking: ParkingArea): L.Icon {
    const available = parking.availableSlots || 0;
    const total = parking.totalSlots;
    const percentage = (available / total) * 100;

    if (percentage > 30) return this.availableIcon;
    if (percentage > 0) return this.limitedIcon;
    return this.fullIcon;
  }

  createPopupContent(parking: ParkingArea): string {
    const available = parking.availableSlots || 0;
    return `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${parking.name}</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${parking.address}</p>
        <p style="margin: 5px 0;"><strong>Available:</strong> 
          <span style="color: ${available > 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
            ${available} / ${parking.totalSlots}
          </span>
        </p>
      </div>
    `;
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.map) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 13);
          }
        },
        (error) => {
          console.log('Could not get user location:', error);
        }
      );
    }
  }

  findNearestParking(): void {
    if (!this.userLocation) {
      alert('Please allow location access to find nearest parking');
      return;
    }

    const sub = this.parkingService
      .getNearestParkings(this.userLocation.lat, this.userLocation.lng)
      .subscribe({
        next: (parkings: ParkingArea[]) => {
          if (parkings.length > 0) {
            this.parkingAreas = parkings;
            this.selectedParking = parkings[0];
            this.map.setView(
              [parkings[0].location.lat, parkings[0].location.lng], 
              14
            );
          }
        },
        error: (err: any) => console.error('Error finding nearest parking:', err)
      });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }
}
