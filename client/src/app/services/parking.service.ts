import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ParkingArea, OccupancyStats, OverallStats } from '../models/parking.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = environment.apiUrl;
  private parkingAreasSubject = new BehaviorSubject<ParkingArea[]>([]);
  public parkingAreas$ = this.parkingAreasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllParkings(): Observable<ParkingArea[]> {
    return this.http.get<ParkingArea[]>(`${this.apiUrl}/parkings`)
      .pipe(
        tap(parkings => this.parkingAreasSubject.next(parkings))
      );
  }

  getParkingById(id: string): Observable<ParkingArea> {
    return this.http.get<ParkingArea>(`${this.apiUrl}/parkings/${id}`);
  }

  createParking(parking: Partial<ParkingArea>): Observable<ParkingArea> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<ParkingArea>(`${this.apiUrl}/parkings`, parking, { headers });
  }

  updateSlotStatus(parkingId: string, slotNumber: number, isAvailable: boolean): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/parkings/${parkingId}/slot/update`, 
      { slotNumber, isAvailable }, 
      { headers }
    ).pipe(
      tap(() => {
        // Update local cache
        const currentParkings = this.parkingAreasSubject.value;
        const updatedParkings = currentParkings.map(p => {
          if (p._id === parkingId) {
            const slot = p.slots.find(s => s.slotNumber === slotNumber);
            if (slot) {
              slot.isAvailable = isAvailable;
              slot.lastUpdated = new Date();
            }
            p.availableSlots = p.slots.filter(s => s.isAvailable).length;
          }
          return p;
        });
        this.parkingAreasSubject.next(updatedParkings);
      })
    );
  }

  getNearestParkings(lat: number, lng: number): Observable<ParkingArea[]> {
    return this.http.get<ParkingArea[]>(`${this.apiUrl}/parkings/nearest/search?lat=${lat}&lng=${lng}`);
  }

  getOccupancyStats(): Observable<{ parkingStats: OccupancyStats[], overall: OverallStats }> {
    return this.http.get<{ parkingStats: OccupancyStats[], overall: OverallStats }>(`${this.apiUrl}/stats/occupancy`);
  }

  // Update parking area in local cache
  updateParkingInCache(parkingId: string, updatedParking: Partial<ParkingArea>): void {
    const currentParkings = this.parkingAreasSubject.value;
    const updatedParkings = currentParkings.map(p => 
      p._id === parkingId ? { ...p, ...updatedParking } : p
    );
    this.parkingAreasSubject.next(updatedParkings);
  }

  // Get current parking areas value
  getParkingAreasValue(): ParkingArea[] {
    return this.parkingAreasSubject.value;
  }
}
