import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cliente } from './models/cliente';
import { ClientesService } from './services/clientes.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Administración de clientes');
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected nuevoCliente: Cliente = this.formularioVacio();

  constructor(private readonly clientesService: ClientesService) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  protected listarClientes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.clientesService.listar().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar los clientes. Verifica que el backend esté iniciado.');
        this.cargando.set(false);
      },
    });
  }

  protected guardarCliente(): void {
    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.clientesService.crear(this.nuevoCliente).subscribe({
      next: () => {
        this.mensaje.set('Cliente creado correctamente.');
        this.nuevoCliente = this.formularioVacio();
        this.guardando.set(false);
        this.listarClientes();
      },
      error: () => {
        this.error.set('No fue posible crear el cliente.');
        this.guardando.set(false);
      },
    });
  }

  protected eliminarCliente(id: number | undefined): void {
    if (id === undefined || !confirm(`¿Deseas eliminar el cliente ${id}?`)) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    this.clientesService.eliminar(id).subscribe({
      next: () => {
        this.mensaje.set('Cliente eliminado correctamente.');
        this.listarClientes();
      },
      error: (response: { status?: number }) => {
        this.error.set(response.status === 404
          ? 'El cliente no existe.'
          : 'No fue posible eliminar el cliente.');
      },
    });
  }

  private formularioVacio(): Cliente {
    return {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
    };
  }
}
