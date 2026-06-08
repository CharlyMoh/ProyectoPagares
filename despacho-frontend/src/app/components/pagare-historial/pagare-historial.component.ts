import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-pagare-historial',
  standalone: true,
  // Importamos CommonModule y DatePipe para manejar los bucles y formatos de fecha en el HTML
  imports: [CommonModule, DatePipe, NavbarComponent], 
  templateUrl: './pagare-historial.component.html',
  styleUrls: ['./pagare-historial.component.css']
})
export class PagareHistorialComponent implements OnInit {
  pagares: any[] = [];
  errorMessage = '';
  rolUsuario: string | null = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Recuperamos el rol del usuario logueado para ajustar la vista en Angular
    this.rolUsuario = localStorage.getItem('rol'); 
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.errorMessage = '';
    this.dataService.getHistorialPagares().subscribe({
      next: (res) => {
        this.pagares = res;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo cargar el historial de auditoría. Verifique su sesión.';
      }
    });
  }

  // Descarga e imprime un pagaré individual (Formato Verde Formitec)
  verPdf(id: number): void {
    this.dataService.imprimirPagare(id).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar la vista previa del pagaré.');
      }
    });
  }

  // Descarga e imprime el reporte administrativo completo (Solo para el Socio/Admin)
  imprimirReporteGlobal(): void {
    this.dataService.descargarReporteAuditoria().subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el reporte ejecutivo global de auditoría.');
      }
    });
  }
}