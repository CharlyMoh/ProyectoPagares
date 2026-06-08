import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule], 
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

                // 1. PASO CRUCIAL: Almacenar los datos de respuesta de la API en el localStorage
                // Ajusta las propiedades (res.token, res.usuario...) según la estructura exacta de tu backend de Node
                localStorage.setItem('token', res.token);
                localStorage.setItem('rol', res.usuario.rol);
                localStorage.setItem('usuario_nombre', res.usuario.nombre);

                // 2. RECUPERAR EL ROL RECIÉN GUARDADO
                const rol = localStorage.getItem('rol');

                // 3. REDIRECCIÓN INTELIGENTE INTEGRAL
                // Ahora todos los roles van al Historial para que puedan auditar lo que les corresponde
                if (rol === 'Socio' || rol === 'Administrador' || rol === 'Abogado Senior' || rol === 'Abogado Junior') {
                    this.router.navigate(['/historial']);
                } else {
                    // Respaldar por si existe algún rol secundario en el despacho
                    this.router.navigate(['/nuevo-pagare']);
                }
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Credenciales inválidas.';
            }
        });
    }
}