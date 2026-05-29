import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule], // Importamos módulos necesarios para formularios directos
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    correo: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    onLogin(): void {
        this.errorMessage = '';

        this.authService.login(this.correo, this.password).subscribe({
            next: (res) => {
                console.log('¡Autenticación exitosa!');

                // 1. Recuperamos el rol exacto que devolvió tu API de Node.js
                const rol = localStorage.getItem('rol');

                // 2. REDIRECCIÓN DINÁMICA POR ROLES
                if (rol === 'Socio' || rol === 'Administrador') {
                    // El Socio Principal va directo al Tablero de Auditoría Global
                    this.router.navigate(['/historial']);
                } else {
                    // Los Abogados (Junior/Senior) van directo a la pantalla de captura Formitec para trabajar
                    this.router.navigate(['/nuevo-pagare']);
                }
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Credenciales inválidas.';
            }
        });
    }

}