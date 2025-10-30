import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { SocketService } from '../../services/socket.service';
import { SessionService } from '../../services/session.service';
import { ParkingArea, SlotUpdateEvent, ParkingSession } from '../../models/parking.model';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-list.component.html',
  styleUrls: ['./parking-list.component.css']
})
export class ParkingListComponent implements OnInit, OnDestroy {
  parkingAreas: ParkingArea[] = [];
  loading = true;
  error: string | null = null;
  activeSession: ParkingSession | null = null;
  parkingHistory: ParkingSession[] = [];
  showHistory = false;
  private subscriptions: Subscription[] = [];
  userLocation: { lat: number; lng: number } = { lat: 17.4239, lng: 78.4738 }; // Default to Banjara Hills

  constructor(
    private parkingService: ParkingService,
    private socketService: SocketService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadParkingAreas();
    this.setupRealtimeUpdates();
    this.loadActiveSession();
    this.getUserLocation();
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.sortByDistance();
        },
        () => {
          // Using default location: Banjara Hills, Hyderabad
        }
      );
    }
  }

  loadActiveSession(): void {
    const sub = this.sessionService.activeSession$.subscribe({
      next: (session) => {
        this.activeSession = session;
      }
    });
    this.subscriptions.push(sub);
  }

  loadParkingAreas(): void {
    this.loading = true;
    const sub = this.parkingService.getAllParkings().subscribe({
      next: (parkings) => {
        this.parkingAreas = parkings;
        this.sortByDistance();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load parking areas';
        this.loading = false;
        console.error(err);
      }
    });
    this.subscriptions.push(sub);
  }

  sortByDistance(): void {
    this.parkingAreas = this.parkingAreas.map(parking => ({
      ...parking,
      distance: this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        parking.location.lat,
        parking.location.lng
      )
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  enterParking(parkingArea: ParkingArea): void {
    if (this.activeSession) {
      alert('You already have an active parking session. Please exit first.');
      return;
    }

    const availableSlot = parkingArea.slots.find(s => s.isAvailable);
    if (!availableSlot) {
      alert('No available slots in this parking area.');
      return;
    }

    if (confirm(`Enter ${parkingArea.name} at Slot #${availableSlot.slotNumber}?`)) {
      this.sessionService.enterParking(parkingArea._id, availableSlot.slotNumber).subscribe({
        next: (response) => {
          alert(`Successfully entered parking at Slot #${availableSlot.slotNumber}`);
          this.loadParkingAreas();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to enter parking');
        }
      });
    }
  }

  exitParking(): void {
    if (!this.activeSession) {
      return;
    }

    if (confirm('Exit parking? You will be charged based on duration.')) {
      this.sessionService.exitParking().subscribe({
        next: (response) => {
          const duration = response.session.duration;
          alert(`Successfully exited parking.\nDuration: ${this.formatDuration(duration)}`);
          this.loadParkingAreas();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to exit parking');
        }
      });
    }
  }

  viewHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.sessionService.getParkingHistory().subscribe({
        next: (response) => {
          this.parkingHistory = response.sessions;
        },
        error: (err) => {
          alert('Failed to load parking history');
        }
      });
    }
  }

  formatDuration(minutes: number | undefined): string {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  getActiveDuration(): string {
    if (!this.activeSession) return '';
    const now = new Date().getTime();
    const entry = new Date(this.activeSession.entryTime).getTime();
    const minutes = Math.floor((now - entry) / 60000);
    return this.formatDuration(minutes);
  }

  setupRealtimeUpdates(): void {
    // Listen for slot updates via WebSocket
    const socketSub = this.socketService.onSlotUpdated().subscribe({
      next: (update: SlotUpdateEvent) => {
        this.handleSlotUpdate(update);
      },
      error: (err) => console.error('Socket error:', err)
    });
    this.subscriptions.push(socketSub);
  }

  handleSlotUpdate(update: SlotUpdateEvent): void {
    const parking = this.parkingAreas.find(p => p._id === update.parkingId);
    if (parking) {
      const slot = parking.slots.find(s => s.slotNumber === update.slotNumber);
      if (slot) {
        slot.isAvailable = update.isAvailable;
        slot.lastUpdated = new Date();
      }
      parking.availableSlots = update.availableSlots;
    }
  }

  getOccupancyPercentage(parking: ParkingArea): number {
    const occupied = parking.totalSlots - (parking.availableSlots || 0);
    return (occupied / parking.totalSlots) * 100;
  }

  getOccupancyClass(percentage: number): string {
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    return 'high';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
