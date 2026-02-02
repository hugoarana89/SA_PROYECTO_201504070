import { Body, Controller, Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';


@Controller('auth')
export class AuthController {

    // inyectar el servicio de autenticación
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    register(
        @Body()
        createUserDto: CreateUserDto
    ) {
        //responder error si no se cumple el dto
        
        console.log(createUserDto);
        return this.authService.register();
    }

    @Post('login')
    login(
        @Body()
        loginDto: LoginUserDto
    ) {
        return this.authService.login();
    }

    @Post('update')
    update(
        @Body()
        updateDto: UpdateUserDto
    ) {
        return this.authService.login();
    }
}
