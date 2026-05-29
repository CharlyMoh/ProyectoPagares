import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PagareFormComponent } from './components/pagare-form/pagare-form.component';
import { PagareHistorialComponent } from './components/pagare-historial/pagare-historial.component';

export const routes: Routes = [
    // 1. Pantalla de entrada: Si entran a la raíz, los manda al Login
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },

    // 2. Módulos protegidos del despacho (Listos para operar con el Interceptor)
    { path: 'historial', component: PagareHistorialComponent },
    { path: 'nuevo-pagare', component: PagareFormComponent },

    // 3. Comodín de seguridad: Si escriben una URL rota o inexistente, los rebota al Login
    { path: '**', redirectTo: 'login' }
];