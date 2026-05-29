import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // --- MÓDULO DE DEUDORES ---
  getDeudores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deudores`);
  }

  crearDeudor(deudor: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deudores`, deudor);
  }

  // --- MÓDULO DE PAGARÉS ---
  generarSeriePagares(datosSerie: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pagares/generar-serie`, datosSerie);
  }

  // 1. OBTENER EL HISTORIAL (Este es el que te está marcando el error)
  getHistorialPagares(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pagares/historial`);
  }

  // 2. IMPRIMIR UN PAGARÉ INDIVIDUAL (FORMATO VERDE FORMITEC)
  imprimirPagare(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pagares/imprimir/${id}`, { responseType: 'blob' });
  }

  // 3. DESCARGAR EL REPORTE DE AUDITORÍA COMPLETO PARA EL SOCIO
  descargarReporteAuditoria(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pagares/reporte-auditoria`, { responseType: 'blob' });
  }
}