import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Recuperar el token del almacenamiento local que guardó el login
  const token = localStorage.getItem('token');

  // 2. Si el token existe, clonamos la petición y le incrustamos el Header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // 3. Si no hay token (como en la pantalla de Login), la petición pasa limpia
  return next(req);
};