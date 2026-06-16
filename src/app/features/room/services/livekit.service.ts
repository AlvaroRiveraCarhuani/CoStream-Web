import { Injectable, NgZone } from '@angular/core';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, LocalTrackPublication } from 'livekit-client';
import { environment } from '../../../../environments/environment'
@Injectable({ providedIn: 'root' })
export class LivekitService {
  private room: Room | null = null;
  private localVideoElement: HTMLVideoElement | null = null;
  private remoteVideoContainer: HTMLElement | null = null;
  private livekitUrl = environment.livekitUrl;

  constructor(private zone: NgZone) {}

  async connect(roomName: string, token: string, localVideoId: string, remoteContainerId: string): Promise<void> {
    this.localVideoElement = document.getElementById(localVideoId) as HTMLVideoElement;
    this.remoteVideoContainer = document.getElementById(remoteContainerId);

    if (!this.localVideoElement || !this.remoteVideoContainer) {
      console.error('Elementos de video no encontrados');
      return;
    }

    // PASO 1: Pedir permiso al navegador ANTES de conectar.
    // Esto fuerza el diálogo "Permitir cámara/micrófono" en el navegador.
    // Si el usuario niega, continuamos sin media (solo lectura de sala).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop()); // Liberar inmediatamente; LiveKit tomará el control
    } catch (permErr) {
      console.warn('No se obtuvo permiso de media. Se continúa sin cámara/micrófono:', permErr);
    }

    this.room = new Room({
      publishDefaults: { stopMicTrackOnMute: false }
    });

    this.room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      if (publication.kind === Track.Kind.Video && publication.track) {
        setTimeout(() => {
          if (this.localVideoElement) {
            publication.track?.attach(this.localVideoElement!);
          }
        }, 100);
      }
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video) {
        const videoEl = document.createElement('video');
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.style.width = '300px';
        videoEl.style.margin = '10px';
        videoEl.setAttribute('data-participant-id', participant.identity);
        track.attach(videoEl);
        this.remoteVideoContainer!.appendChild(videoEl);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video) {
        const el = this.remoteVideoContainer!.querySelector(`[data-participant-id="${participant.identity}"]`);
        if (el) el.remove();
      }
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      const videos = this.remoteVideoContainer!.querySelectorAll(`[data-participant-id="${participant.identity}"]`);
      videos.forEach(v => v.remove());
    });

    // PASO 2: Conectar a LiveKit. Este paso NO debe fallar por errores de media.
    await this.room.connect(this.livekitUrl, token);
    console.log('Conectado a LiveKit');

    // PASO 3: Habilitar media LOCAL. Si falla (sin dispositivo o sin permiso),
    // solo se registra una advertencia — la conexión a la sala se mantiene.
    try {
      if (!this.room.localParticipant.isMicrophoneEnabled) {
        await this.room.localParticipant.setMicrophoneEnabled(true);
      }
    } catch (micErr) {
      console.warn('No se pudo habilitar el micrófono:', micErr);
    }

    try {
      if (!this.room.localParticipant.isCameraEnabled) {
        await this.room.localParticipant.setCameraEnabled(true);
      }
    } catch (camErr) {
      console.warn('No se pudo habilitar la cámara:', camErr);
    }
  }

  async toggleMicrophone(): Promise<boolean> {
    if (!this.room) return false;
    const newState = !this.room.localParticipant.isMicrophoneEnabled;
    await this.room.localParticipant.setMicrophoneEnabled(newState);
    return newState;
  }

  async toggleCamera(): Promise<boolean> {
    if (!this.room) return false;
    const newState = !this.room.localParticipant.isCameraEnabled;
    await this.room.localParticipant.setCameraEnabled(newState);
    return newState;
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(enabled);
    }
  }

  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.remoteVideoContainer) this.remoteVideoContainer.innerHTML = '';
    if (this.localVideoElement) this.localVideoElement.srcObject = null;
  }
}