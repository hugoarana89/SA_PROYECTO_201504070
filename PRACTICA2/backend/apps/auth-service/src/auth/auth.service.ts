import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService
    ) {}
    
    // Aquí irán los métodos relacionados con la autenticación
    register() {
        return { message: 'Register method in AuthService' };
    }

    login() {
        return { message: 'Login method in AuthService' };
    }
}
