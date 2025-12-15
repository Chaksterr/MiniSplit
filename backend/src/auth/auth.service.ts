import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUserByEmail = await this.userService.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier si le username existe déjà
    const existingUserByUsername = await this.userService.findByUsernameForAuth(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
    }

    // Créer l'utilisateur (le mot de passe sera hashé par @BeforeInsert)
    const user = await this.userService.create(registerDto);

    // Générer le token JWT
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      access_token,
      message: 'Inscription réussie',
    };
  }

  async login(loginDto: LoginDto) {
    // Valider les credentials
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      access_token,
      message: 'Connexion réussie',
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
