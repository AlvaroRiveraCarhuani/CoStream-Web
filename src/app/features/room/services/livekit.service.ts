import { Injectable, NgZone } from '@angular/core';
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteParticipant,
  LocalTrackPublication,
  RemoteTrackPublication,
} from 'livekit-client';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LivekitService {
  private room: Room | null = null;
  private localVideoElement: HTMLVideoElement | null = null;
  private spotlightVideoElement: HTMLVideoElement | null = null;
  private remoteVideoContainer: HTMLElement | null = null;
  private livekitUrl = environment.livekitUrl;

  /** Callback para avisar a la UI cuando cambie el mute remotamente */
  public onMuteStatusChange: ((muted: boolean) => void) | null = null;

  /**
   * Callback para avisar a la UI sobre cambios de screen share.
   * @param isSharing   - true si alguien está compartiendo, false si dejó de compartir
   * @param isLocal     - true si soy yo quien comparte
   * @param ownerName   - nombre del participante remoto que comparte (sólo si !isLocal)
   */
  public onScreenShareChange:
    | ((isSharing: boolean, isLocal: boolean, ownerName?: string) => void)
    | null = null;

  constructor(private zone: NgZone) {}

  /**
   * Detecta si el navegador soporta compartir pantalla.
   * En iOS (Safari, Chrome, Firefox) getDisplayMedia no existe.
   * En Android Chrome sí existe desde v72+.
   */
  static isScreenShareSupported(): boolean {
    return !!navigator.mediaDevices?.getDisplayMedia;
  }

  async connect(
    roomName: string,
    token: string,
    localVideoId: string,
    remoteContainerId: string,
    spotlightVideoId?: string
  ): Promise<void> {
    this.localVideoElement = document.getElementById(localVideoId) as HTMLVideoElement;
    this.remoteVideoContainer = document.getElementById(remoteContainerId);

    if (spotlightVideoId) {
      this.spotlightVideoElement = document.getElementById(spotlightVideoId) as HTMLVideoElement;
    }

    if (!this.localVideoElement || !this.remoteVideoContainer) {
      console.error('Elementos de video no encontrados');
      return;
    }

    // Solicitar permisos para que enumerateDevices devuelva labels
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (permErr) {
      console.warn('No se obtuvo permiso de media. Se continúa sin cámara/micrófono:', permErr);
    }

    this.room = new Room({
      publishDefaults: { stopMicTrackOnMute: false },
    });

    // ──────────────────────────────────────────────────────────────────
    // Track local publicado
    // ──────────────────────────────────────────────────────────────────
    this.room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      if (publication.kind !== Track.Kind.Video || !publication.track) return;

      if (publication.source === Track.Source.Camera) {
        // Cámara → elemento local pequeño
        setTimeout(() => {
          if (this.localVideoElement) {
            publication.track?.attach(this.localVideoElement!);
          }
        }, 100);
      } else if (publication.source === Track.Source.ScreenShare) {
        // Pantalla compartida → spotlight (también para quien la comparte)
        setTimeout(() => {
          if (this.spotlightVideoElement && publication.track) {
            publication.track.attach(this.spotlightVideoElement);
          }
        }, 100);
        if (this.onScreenShareChange) {
          this.onScreenShareChange(true, true);
        }
      }
    });

    // ──────────────────────────────────────────────────────────────────
    // Track local des-publicado
    // ──────────────────────────────────────────────────────────────────
    this.room.on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication) => {
      if (publication.kind !== Track.Kind.Video) return;

      if (publication.source === Track.Source.ScreenShare) {
        if (this.spotlightVideoElement) {
          publication.track?.detach(this.spotlightVideoElement);
          this.spotlightVideoElement.srcObject = null;
        }
        if (this.onScreenShareChange) {
          this.onScreenShareChange(false, true);
        }
      } else if (publication.source === Track.Source.Camera) {
        // Bug fix: el soft-reset apaga la cámara brevemente → limpiar el elemento
        // para evitar un frame congelado mientras el track se re-publica
        if (this.localVideoElement) {
          publication.track?.detach(this.localVideoElement);
          // NO ponemos srcObject = null — LiveKit lo gestiona internamente
        }
      }
    });

    // ──────────────────────────────────────────────────────────────────
    // Track remoto suscrito
    // ──────────────────────────────────────────────────────────────────
    this.room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Video) {
          if (publication.source === Track.Source.ScreenShare) {
            // Pantalla compartida remota → spotlight
            if (this.spotlightVideoElement) {
              track.attach(this.spotlightVideoElement);
            }
            if (this.onScreenShareChange) {
              this.onScreenShareChange(true, false, participant.name || participant.identity);
            }
          } else {
            // Cámara remota → tira de thumbnails
            const videoEl = document.createElement('video');
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.className = 'remote-thumbnail';
            videoEl.setAttribute('data-participant-id', participant.identity);
            videoEl.setAttribute('data-track-sid', track.sid || '');
            videoEl.setAttribute('data-track-source', publication.source || 'camera');
            track.attach(videoEl);
            this.remoteVideoContainer!.appendChild(videoEl);
          }
        } else if (track.kind === Track.Kind.Audio) {
          const audioEl = document.createElement('audio');
          audioEl.autoplay = true;
          audioEl.setAttribute('data-participant-audio-id', participant.identity);
          audioEl.setAttribute('data-track-sid', track.sid || '');
          track.attach(audioEl);
          this.remoteVideoContainer!.appendChild(audioEl);
        }
      }
    );

    // ──────────────────────────────────────────────────────────────────
    // Track remoto des-suscrito
    // ──────────────────────────────────────────────────────────────────
    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Video) {
          if (publication.source === Track.Source.ScreenShare) {
            if (this.spotlightVideoElement) {
              track.detach(this.spotlightVideoElement);
              this.spotlightVideoElement.srcObject = null;
            }
            if (this.onScreenShareChange) {
              this.onScreenShareChange(false, false);
            }
          } else {
            const el = this.remoteVideoContainer!.querySelector(
              `[data-track-sid="${track.sid || ''}"]`
            );
            if (el) el.remove();
          }
        } else if (track.kind === Track.Kind.Audio) {
          const audioEl = this.remoteVideoContainer!.querySelector(
            `[data-track-sid="${track.sid || ''}"]`
          );
          if (audioEl) audioEl.remove();
        }
      }
    );

    // ──────────────────────────────────────────────────────────────────
    // Participante remoto desconectado: limpiar todos sus elementos
    // Usamos data-participant-id para videos y data-participant-audio-id
    // para audios. TrackUnsubscribed usa data-track-sid; aquí limpiamos
    // lo que quede por si el participante se desconectó abruptamente
    // sin emitir TrackUnsubscribed.
    // ──────────────────────────────────────────────────────────────────
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      if (!this.remoteVideoContainer) return;
      // Videos: buscamos por data-participant-id (puede ya no existir si
      // TrackUnsubscribed los limpió por track.sid — esto es safe)
      this.remoteVideoContainer
        .querySelectorAll(`[data-participant-id="${participant.identity}"]`)
        .forEach((el) => el.remove());
      // Audios: buscamos por data-participant-audio-id
      this.remoteVideoContainer
        .querySelectorAll(`[data-participant-audio-id="${participant.identity}"]`)
        .forEach((el) => el.remove());
    });

    await this.room.connect(this.livekitUrl, token);
  }

  // ──────────────────────────────────────────────────────────────────
  // Controles de media
  // ──────────────────────────────────────────────────────────────────

  async toggleMicrophone(): Promise<boolean> {
    if (!this.room) return false;
    const newState = !this.room.localParticipant.isMicrophoneEnabled;
    await this.setMicrophoneEnabled(newState);
    return newState;
  }

  async toggleCamera(): Promise<boolean> {
    if (!this.room) return false;
    const newState = !this.room.localParticipant.isCameraEnabled;
    await this.room.localParticipant.setCameraEnabled(newState);
    return newState;
  }

  /**
   * Activa/desactiva el screen share.
   *
   * Bug 2 — Camera ghost-lock fix:
   * Cuando el navegador libera los permisos del screen share, WebRTC puede
   * dejar el dispositivo de vídeo en un estado de "bloqueo fantasma". El
   * soft-reset (disable → enable) re-adquiere el track limpiamente, sin
   * que el usuario lo note.
   */
  async toggleScreenShare(): Promise<boolean> {
    if (!this.room) return false;

    const isSharing = this.room.localParticipant.isScreenShareEnabled;

    await this.room.localParticipant.setScreenShareEnabled(!isSharing, { audio: false });

    if (isSharing) {
      // Acabamos de DETENER el screen share — aplicar soft-reset de cámara
      if (this.room.localParticipant.isCameraEnabled) {
        try {
          await this.room.localParticipant.setCameraEnabled(false);
          await this.room.localParticipant.setCameraEnabled(true);
        } catch (e) {
          console.warn('[LiveKit] Camera soft-reset tras screen share falló:', e);
        }
      }
    }

    return !isSharing;
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      if (this.onMuteStatusChange) this.onMuteStatusChange(!enabled);
    }
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(enabled);
    }
  }

  async getLocalDevices(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    return Room.getLocalDevices(kind);
  }

  async switchDevice(kind: 'videoinput' | 'audioinput', deviceId: string): Promise<void> {
    if (this.room) {
      await this.room.switchActiveDevice(kind, deviceId);
    }
  }

  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.remoteVideoContainer) this.remoteVideoContainer.innerHTML = '';
    if (this.localVideoElement) this.localVideoElement.srcObject = null;
    if (this.spotlightVideoElement) this.spotlightVideoElement.srcObject = null;
  }
}