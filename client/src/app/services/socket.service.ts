import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { environment } from '../../environments/environment';
import { SlotUpdateEvent, ParkingArea } from '../models/parking.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private connected = false;

  constructor() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  // Listen for slot updates
  onSlotUpdated(): Observable<SlotUpdateEvent> {
    return fromEvent<SlotUpdateEvent>(this.socket, 'slotUpdated');
  }

  // Listen for parking data
  onParkingData(): Observable<ParkingArea[]> {
    return fromEvent<ParkingArea[]>(this.socket, 'parkingData');
  }

  // Request current parking data
  requestParkingData(): void {
    this.socket.emit('requestParkingData');
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Reconnect socket
  reconnect(): void {
    if (this.socket && !this.connected) {
      this.socket.connect();
    }
  }
}
