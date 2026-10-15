import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequestManager } from '../services/requestManager';
import { AsignarRequest, TransicionRequest } from 'src/app/@core/models/flujo';

@Injectable({
  providedIn: 'root',
})
export class FlujoService {
  private documentoSubject = new BehaviorSubject<string>('');
  public documento$ = this.documentoSubject.asObservable();

  private asignacionesSubject = new BehaviorSubject<any[]>([]);
  public asignaciones$ = this.asignacionesSubject.asObservable();

  private pendientesSubject = new BehaviorSubject<any[]>([]);
  public pendientes$ = this.pendientesSubject.asObservable();

  constructor(private request: RequestManager) {}

  setDocumento(documento: string) {
    this.documentoSubject.next(documento);
  }

  getDocumento(): string {
    return this.documentoSubject.value;
  }

  setAsignaciones(asignaciones: any[]) {
    this.asignacionesSubject.next(asignaciones || []);
  }

  setPendientes(pendientes: any[]) {
    this.pendientesSubject.next(pendientes || []);
  }

  asignar(payload: AsignarRequest) {
    return this.request.post(environment.SYLLABUS_MID, 'flujo/asignar', payload);
  }

  misAsignaciones(documento: string) {
    return this.request.get(
      environment.SYLLABUS_MID,
      `flujo/mis-asignaciones?documento=${encodeURIComponent(documento)}`
    );
  }

  pendientes(documento: string) {
    return this.request.get(
      environment.SYLLABUS_MID,
      `flujo/pendientes?documento=${encodeURIComponent(documento)}`
    );
  }

  buscarDocente(documento: string) {
    return this.request.get(
      environment.SYLLABUS_MID,
      `flujo/docente?documento=${encodeURIComponent(documento)}`
    );
  }

  getEstado(code: string, documento: string) {
    return this.request.get(
      environment.SYLLABUS_MID,
      `flujo/${code}/estado?documento=${encodeURIComponent(documento)}`
    );
  }

  getBorrador(code: string, documento: string) {
    return this.request.get(
      environment.SYLLABUS_MID,
      `flujo/${code}/borrador?documento=${encodeURIComponent(documento)}`
    );
  }

  guardarBorrador(code: string, payload: any) {
    return this.request.putSinId(environment.SYLLABUS_MID, `flujo/${code}/borrador`, payload);
  }

  proponer(code: string, payload: TransicionRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/proponer`, payload);
  }

  aprobar(code: string, payload: TransicionRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/aprobar`, payload);
  }

  rechazar(code: string, payload: TransicionRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/rechazar`, payload);
  }

  reabrir(code: string, payload: TransicionRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/reabrir`, payload);
  }

  reasignar(code: string, payload: AsignarRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/reasignar`, payload);
  }

  cancelar(code: string, payload: TransicionRequest) {
    return this.request.post(environment.SYLLABUS_MID, `flujo/${code}/cancelar`, payload);
  }
}
