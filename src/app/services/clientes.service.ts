import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { appConfigValues } from '../config/app-config';
import { Cliente } from '../models/cliente';

interface ClienteApiResponse {
  id?: number;
  firstName: string;
  lastName: string;
  surname?: string;
  phone: string;
  email?: string;
}

interface ClienteApiRequest {
  firstName: string;
  lastName: string;
  surname: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly clientsUrl = `${appConfigValues.baseApiUrl}/clients`;
  private mockClients: Cliente[] = [
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'Gómez Pérez',
      telefono: '+57 3001234567',
      email: 'ana.gomez@example.com',
    },
  ];

  listar(): Observable<Cliente[]> {
    if (appConfigValues.useMock) {
      return of(this.mockClients).pipe(delay(250));
    }

    return this.http
      .get<ClienteApiResponse[]>(this.clientsUrl)
      .pipe(map((clients) => clients.map((client) => this.fromApi(client))));
  }

  crear(cliente: Cliente): Observable<void> {
    if (appConfigValues.useMock) {
      const nextId = Math.max(0, ...this.mockClients.map(({ id }) => id ?? 0)) + 1;
      this.mockClients = [...this.mockClients, { ...cliente, id: nextId }];
      return of(void 0).pipe(delay(250));
    }

    return this.http.post<void>(`${appConfigValues.baseApiUrl}/client`, this.toApi(cliente));
  }

  eliminar(id: number): Observable<void> {
    if (appConfigValues.useMock) {
      this.mockClients = this.mockClients.filter((client) => client.id !== id);
      return of(void 0).pipe(delay(250));
    }

    return this.http.delete<void>(`${appConfigValues.baseApiUrl}/clientes/${id}`);
  }

  private fromApi(client: ClienteApiResponse): Cliente {
    return {
      id: client.id,
      nombre: client.firstName,
      apellido: [client.lastName, client.surname].filter(Boolean).join(' '),
      telefono: client.phone,
      email: client.email ?? '',
    };
  }

  private toApi(cliente: Cliente): ClienteApiRequest {
    const [lastName, ...surnameParts] = cliente.apellido.trim().split(/\s+/);

    return {
      firstName: cliente.nombre,
      lastName: lastName ?? '',
      surname: surnameParts.join(' '),
      phone: cliente.telefono,
    };
  }
}
