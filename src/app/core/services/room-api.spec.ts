import { TestBed } from '@angular/core/testing';
import { RoomApiService } from './room-api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, beforeEach, it, expect, inject } from 'vitest';
import { PublicRoom } from '../../shared/interfaces/shared.interfaces';

describe('RoomApiService - Unit Tests', () => {
  let service: RoomApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoomApiService]
    });
    service = TestBed.inject(RoomApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debería poblar la Signal publicRooms con los datos simulados devueltos por la API', () => {
    const mockRooms: PublicRoom[] = [
      { id: 'r1', title: 'Stream de Sistemas', hostName: 'Alvaro', createdAt: new Date().toISOString() }
    ];

    // Disparamos el método
    service.loadPublicRooms();

    // Interceptamos la petición HTTP esperada hacia NestJS
    const req = httpMock.expectOne('http://localhost:3000/api/rooms/public');
    expect(req.request.method).toBe('GET');
    req.flush(mockRooms); // Resolvemos la petición con nuestro mock

    // Validamos que la Signal mutó su estado de forma limpia
    expect(service.publicRooms().length).toBe(1);
    expect(service.publicRooms()[0].title).toBe('Stream de Sistemas');
  });
});