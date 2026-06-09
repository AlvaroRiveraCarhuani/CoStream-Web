import { Injectable, NgZone } from '@angular/core';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, LocalTrackPublication, createLocalTracks } from 'livekit-client';

@Injectable({ providedIn: 'root' })
export class LivekitService {
  private room: Room | null = null;
  private localVideoElement: HTMLVideoElement | null = null;
  private remoteVideoContainer: HTMLElement | null = null;

  constructor(private zone: NgZone) {}

  async connect(roomName: string, token: string, localVideoId: string, remoteContainerId: string): Promise<void> {
    this.localVideoElement = document.getElementById(localVideoId) as HTMLVideoElement;
    this.remoteVideoContainer = document.getElementById(remoteContainerId);

    if (!this.localVideoElement) {
      console.error(`No se encontró el elemento con id "${localVideoId}"`);
      return;
    }
    if (!this.remoteVideoContainer) {
      console.error(`No se encontró el contenedor con id "${remoteContainerId}"`);
      return;
    }

    this.room = new Room({
      publishDefaults: {
        stopMicTrackOnMute: false,
      },
    });

    this.room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      console.log('Track local publicado:', publication.kind);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
      console.log('Track remoto suscrito:', track.kind, 'de', participant.identity);
      if (track.kind === Track.Kind.Video) {
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = false;
        videoElement.style.width = '300px';
        videoElement.style.margin = '10px';
        videoElement.setAttribute('data-participant-id', participant.identity);
        track.attach(videoElement);
        this.remoteVideoContainer!.appendChild(videoElement);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
      console.log('Track remoto eliminado:', track.kind, 'de', participant.identity);
      if (track.kind === Track.Kind.Video) {
        const videoElement = this.remoteVideoContainer!.querySelector(`[data-participant-id="${participant.identity}"]`);
        if (videoElement) videoElement.remove();
      }
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participante desconectado:', participant.identity);
      const videos = this.remoteVideoContainer!.querySelectorAll(`[data-participant-id="${participant.identity}"]`);
      videos.forEach(v => v.remove());
    });

    try {
      await this.room.connect('wss://costream-qcj17wn6.livekit.cloud', token);
      console.log('Conectado a LiveKit, participantes:', this.room.numParticipants);

      // 🔥 SOLUCIÓN PARA FLOORP: Pedir permisos de audio y video en una sola llamada
      try {
        console.log('Solicitando permisos unificados...');
        
        // Esto es lo que obligará a Floorp a mostrar la ventana emergente de permisos
        const localTracks = await createLocalTracks({
          audio: true,
          video: true
        });

        for (const track of localTracks) {
          // Publicamos cada track (audio y video) en la sala
          await this.room.localParticipant.publishTrack(track);

          if (track.kind === Track.Kind.Audio) {
            console.log('Micrófono publicado correctamente');
          }

          if (track.kind === Track.Kind.Video) {
            console.log('Cámara publicada correctamente');
            // Adjuntamos el track de video al elemento HTML para verte a ti mismo
            track.attach(this.localVideoElement!);
          }
        }
      } catch (mediaError) {
        // Si rechazas el permiso o hay un error de hardware, caerá aquí
        console.error('Error al obtener permisos o publicar medios:', mediaError);
        alert('Por favor, permite el acceso a la cámara y el micrófono en el icono del candado en la barra de direcciones.');
      }
    } catch (error) {
      console.error('Error al conectar a LiveKit:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.remoteVideoContainer) {
      this.remoteVideoContainer.innerHTML = '';
    }
    if (this.localVideoElement) {
      // Es buena práctica limpiar también el srcObject del video local al desconectar
      this.localVideoElement.srcObject = null;
    }
  }
}