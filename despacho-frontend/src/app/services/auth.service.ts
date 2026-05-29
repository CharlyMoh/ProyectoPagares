import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth'; // URL de tu API Node.js

    constructor(private http: HttpClient) { }

    // Enviar credenciales al backend
    login(correo: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { correo, password }).pipe(
            tap(res => {
                if (res && res.token) {
                    // Guardamos el token y el rol de forma local
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('rol', res.usuario.rol);
                    localStorage.setItem('nombre', res.usuario.nombre);
                }
            })
        );
    }

    // Cerrar sesión limpiando el navegador
    logout(): void {
        localStorage.clear();
    }

    // Saber si el usuario está logueado analizando si existe el token
    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    // Obtener el rol actual para las restricciones visuales (Socio, Senior, Junior)
    getRol(): string | null {
        return localStorage.getItem('rol');
    }
}