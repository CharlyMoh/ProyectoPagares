import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  nombreUsuario: string | null = '';
  rolUsuario: string | null = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Jalamos los datos que guardó el AuthService al hacer login
    this.nombreUsuario = localStorage.getItem('usuario_nombre') || 'Abogado';
    this.rolUsuario = localStorage.getItem('rol');
  }

  // Destrucción segura de la sesión JWT
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_nombre');
    
    // Redirección inmediata al formulario de acceso
    this.router.navigate(['/login']);
  }

  // Navegación rápida entre módulos del despacho
  irAlHistorial(): void { this.router.navigate(['/historial']); }
  irANuevoPagare(): void { this.router.navigate(['/nuevo-pagare']); }
}