export interface DatosUsuario {
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	contraseña: string;
}

export class Usuario implements DatosUsuario {
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	contraseña: string;

	constructor({ id, nombre, email, telefono, contraseña }: DatosUsuario) {
		this.id = id;
		this.nombre = nombre;
		this.email = email;
		this.telefono = telefono;
		this.contraseña = contraseña;
	}
}

export class UsuarioComprador extends Usuario {
	ticketsComprados: string[];

	constructor(props: DatosUsuario, ticketsComprados: string[] = []) {
		super(props);
		this.ticketsComprados = ticketsComprados;
	}
}
