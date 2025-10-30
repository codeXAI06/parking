import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ParkingSession } from '../models/parking.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = environment.apiUrl;
  private activeSessionSubject = new BehaviorSubject<ParkingSession | null>(null);
  public activeSession$ = this.activeSessionSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadActiveSession();
  }

  private loadActiveSession(): void {
    this.getActiveSession().subscribe({
      next: (response: any) => {
        this.activeSessionSubject.next(response.session);
      },
      error: () => {
        this.activeSessionSubject.next(null);
      }
    });
  }

  enterParking(parkingAreaId: string, slotNumber: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/enter`, { 
      parkingAreaId, 
      slotNumber 
    }).pipe(
      tap((response: any) => {
        this.activeSessionSubject.next(response.session);
      })
    );
  }

  exitParking(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/exit`, {}).pipe(
      tap(() => {
        this.activeSessionSubject.next(null);
      })
    );
  }

  getActiveSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/active`);
  }

  getParkingHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/history`);
  }

  refreshActiveSession(): void {
    this.loadActiveSession();
  }

  hasActiveSession(): boolean {
    return this.activeSessionSubject.value !== null;
  }

  getCurrentSession(): ParkingSession | null {
    return this.activeSessionSubject.value;
  }
}
