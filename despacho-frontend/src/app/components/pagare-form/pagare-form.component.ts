import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-pagare-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './pagare-form.component.html',
  styleUrls: ['./pagare-form.component.css']
})
export class PagareFormComponent implements OnInit {
  deudores: any[] = [];
  estados: any[] = [
    { id: 1, nombre: 'Puebla' },
    { id: 2, nombre: 'Ciudad de México' },
    { id: 3, nombre: 'Estado de México' }
  ];

  pagareData = {
    numero_expediente: '',
    deudor_id: '',
    total_pagares: 1,
    monto_total: null as number | null,
    monto_letra: '',
    nombre_beneficiario: 'Despacho Jurídico S.C.',
    fecha_vencimiento_inicial: '',
    lugar_pago: '',
    fecha_suscripcion: new Date().toISOString().split('T')[0],
    lugar_suscripcion: '',
    estado_suscripcion_id: '',
    nombre_aval: '',
    domicilio_aval: ''
  };

  successMessage = '';
  errorMessage = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargarDeudores();
    this.generarNumeroExpedienteAutomatico();
  }

  cargarDeudores(): void {
    this.dataService.getDeudores().subscribe({
      next: (res) => this.deudores = res,
      error: (err) => console.error('Error al cargar deudores', err)
    });
  }

  // 1. Automatización de NÚMERO DE EXPEDIENTE
  // Genera un formato único incremental basado en la estampa de tiempo actual: EXP-AÑO-MES-MILISEGUNDOS
  generarNumeroExpedienteAutomatico(): void {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const randomId = String(fecha.getTime()).slice(-4); // Últimos 4 dígitos del timestamp
    
    this.pagareData.numero_expediente = `EXP-${anio}${mes}-${randomId}`;
  }

  // 2. Escuchar cambios en el input numérico para actualizar la letra automáticamente
  onMontoChange(valor: number | null): void {
    if (!valor || valor <= 0) {
      this.pagareData.monto_letra = '';
      return;
    }
    
    this.pagareData.monto_letra = this.convertirNumeroALetra(valor);
  }

  // Algoritmo de conversión monetaria legal (Pesos Mexicanos)
  private convertirNumeroALetra(monto: number): string {
    const centavos = Math.round((monto % 1) * 100);
    const parteEntera = Math.floor(monto);
    const strCentavos = String(centavos).padStart(2, '0') + '/100 M.N.';
    
    if (parteEntera === 0) {
      return `Cero pesos ${strCentavos}`;
    }

    const letras = this.numeroALetrasLógica(parteEntera);
    return `${letras} PESOS ${strCentavos}`.toUpperCase();
  }

  private numeroALetrasLógica(n: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const decenas2 = ['', '', 'VEINTI', 'TREINTA Y ', 'CUARENTA Y ', 'CINCUENTA Y ', 'SESENTA Y ', 'SETENTA Y ', 'OCHENTA Y ', 'NOVENTA Y '];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SIETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    if (n === 100) return 'CIEN';
    if (n < 10) return unidades[n];
    if (n < 20) return especiales[n - 10];
    if (n < 30) return n === 20 ? 'VEINTE' : `VEINTI${unidades[n % 10]}`;
    if (n < 100) {
      const u = n % 10;
      return `${decenas[Math.floor(n / 10)]}${u > 0 ? ' Y ' + unidades[u] : ''}`;
    }
    if (n < 1000) {
      const resto = n % 100;
      return `${centenas[Math.floor(n / 100)]}${resto > 0 ? ' ' + this.numeroALetrasLógica(resto) : ''}`;
    }
    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      const strMiles = miles === 1 ? 'MIL' : `${this.numeroALetrasLógica(miles)} MIL`;
      return `${strMiles}${resto > 0 ? ' ' + this.numeroALetrasLógica(resto) : ''}`;
    }
    
    return 'CANTIDAD MUY ALTA'; // Límite funcional para el MVP
  }

  registrarSerie(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.dataService.generarSeriePagares(this.pagareData).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.pagareData.monto_total = null;
        this.pagareData.monto_letra = '';
        this.generarNumeroExpedienteAutomatico(); // Regenera uno nuevo al terminar
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al procesar la serie de pagarés.';
      }
    });
  }
}