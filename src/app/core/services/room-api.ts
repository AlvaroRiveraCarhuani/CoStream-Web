import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PublicRoom, RoomHistory, RoomJoinResponse } from '../../shared/interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RoomApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/rooms';

  public publicRooms = signal<PublicRoom[]>([]);
  public roomHistory = signal<RoomHistory[]>([]);
  public myActiveRoom = signal<any | null>(null);

  loadPublicRooms() {
    this.http.get<any[]>(`${this.API_URL}/public`).subscribe(rooms => {
      this.publicRooms.set(rooms);
    });
  }

  createRoom(data: { title: string; isPublic: boolean; requiresPin: boolean; pin?: string }): Observable<RoomJoinResponse> {
    return this.http.post<RoomJoinResponse>(this.API_URL, data);
  }

  joinRoom(data: { roomId: string; displayName: string; pin?: string }): Observable<RoomJoinResponse> {
    return this.http.post<RoomJoinResponse>(`${this.API_URL}/join`, data);
  }

  loadRoomHistory(): void {
    this.http.get<RoomHistory[]>(`${this.API_URL}/history`).subscribe({
      next: (history) => this.roomHistory.set(history),
      error: (err) => console.error('Error cargando historial', err)
    });
  }
  checkRoomStatus(roomId: string): Observable<{ exists: boolean, requiresPin: boolean }> {
    return this.http.get<{ exists: boolean, requiresPin: boolean }>(`${this.API_URL}/${roomId}/status`);
  }

  loadMyActiveRoom() {
    this.http.get(`${this.API_URL}/my-active`).subscribe({
      next: (room) => this.myActiveRoom.set(room || null),
      error: () => this.myActiveRoom.set(null)
    });
  }
  endRoom(roomId: string) {
    return this.http.post(`${this.API_URL}/${roomId}/end`, {});
  }
}