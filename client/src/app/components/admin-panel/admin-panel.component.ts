import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ParkingArea, SlotUpdateEvent, OccupancyStats, OverallStats } from '../../models/parking.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  parkingAreas: ParkingArea[] = [];
  selectedParking: ParkingArea | null = null;
  updateForm: FormGroup;
  createForm: FormGroup;
  showCreateForm = false;
  occupancyStats: OccupancyStats[] = [];
  overallStats: OverallStats | null = null;
  loading = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingService,
    private socketService: SocketService,
    public authService: AuthService
  ) {
    this.updateForm = this.fb.group({
      parkingId: ['', Validators.required],
      slotNumber: ['', [Validators.required, Validators.min(1)]],
      isAvailable: [true]
    });

    this.createForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      lat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      lng: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      totalSlots: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadParkingAreas();
    this.loadOccupancyStats();
    this.setupRealtimeUpdates();
  }

  loadParkingAreas(): void {
    this.loading = true;
    const sub = this.parkingService.getAllParkings().subscribe({
      next: (parkings: ParkingArea[]) => {
        this.parkingAreas = parkings;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading parkings:', err);
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadOccupancyStats(): void {
    const sub = this.parkingService.getOccupancyStats().subscribe({
      next: (data: { parkingStats: OccupancyStats[], overall: OverallStats }) => {
        this.occupancyStats = data.parkingStats;
        this.overallStats = data.overall;
      },
      error: (err: any) => console.error('Error loading stats:', err)
    });
    this.subscriptions.push(sub);
  }

  setupRealtimeUpdates(): void {
    const socketSub = this.socketService.onSlotUpdated().subscribe({
      next: (update: SlotUpdateEvent) => {
        this.handleSlotUpdate(update);
        this.loadOccupancyStats(); // Refresh stats
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
        slot.lastUpdated = new Date();
      }
      parking.availableSlots = update.availableSlots;

      if (this.selectedParking?._id === update.parkingId) {
        this.selectedParking = { ...parking };
      }
    }
  }

  selectParking(parking: ParkingArea): void {
    this.selectedParking = parking;
    this.updateForm.patchValue({
      parkingId: parking._id
    });
  }

  updateSlot(): void {
    if (this.updateForm.valid) {
      const { parkingId, slotNumber, isAvailable } = this.updateForm.value;
      
      const sub = this.parkingService
        .updateSlotStatus(parkingId, slotNumber, isAvailable)
        .subscribe({
          next: (response: any) => {
            console.log('Slot updated:', response);
            this.updateForm.patchValue({ slotNumber: '' });
          },
          error: (err: any) => {
            console.error('Error updating slot:', err);
            alert('Failed to update slot. Please try again.');
          }
        });
      this.subscriptions.push(sub);
    }
  }

  toggleSlotStatus(parking: ParkingArea, slot: any): void {
    const sub = this.parkingService
      .updateSlotStatus(parking._id, slot.slotNumber, !slot.isAvailable)
      .subscribe({
        next: () => console.log('Slot toggled'),
        error: (err: any) => console.error('Error toggling slot:', err)
      });
    this.subscriptions.push(sub);
  }

  createParking(): void {
    if (this.createForm.valid) {
      const formData = this.createForm.value;
      const newParking = {
        name: formData.name,
        address: formData.address,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        totalSlots: parseInt(formData.totalSlots)
      };

      const sub = this.parkingService.createParking(newParking).subscribe({
        next: (parking: ParkingArea) => {
          console.log('Parking created:', parking);
          this.parkingAreas.push(parking);
          this.createForm.reset();
          this.showCreateForm = false;
          alert('Parking area created successfully!');
        },
        error: (err: any) => {
          console.error('Error creating parking:', err);
          alert('Failed to create parking area. Please check your permissions.');
        }
      });
      this.subscriptions.push(sub);
    }
  }

  getSlotClass(slot: any): string {
    return slot.isAvailable ? 'available' : 'occupied';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
