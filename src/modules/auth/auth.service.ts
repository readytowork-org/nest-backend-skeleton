import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser, GoogleUser } from './interfaces/auth.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthenticatedUser> {
    const { email, password, name } = registerDto;

    // find the existing user
    const existingUser = await this.userService.findUnique(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
      authProvider: 'local',
    });

    const token = this.generateToken(
      user.id,
      user.email,
      user.name,
      user.profilePicture,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      picture: user.profilePicture,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthenticatedUser> {
    const { email, password } = loginDto;

    const user = await this.userService.findUnique(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider === 'google') {
      throw new UnauthorizedException(
        'This account uses Google authentication. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(
      user.id,
      user.email,
      user.name,
      user.profilePicture,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      picture: user.profilePicture,
    };
  }

  async validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser> {
    const { email, firstName, lastName, picture } = googleUser;
    let user = await this.userService.findUnique(email);

    if (!user) {
      return await this.createGoogleUser(email, firstName, lastName, picture);
    } else if (user.authProvider !== 'google') {
      user = await this.userService.update(user.id, {
        authProvider: 'google',
        profilePicture: picture || null,
      });
    }

    const token = this.generateToken(
      user.id,
      user.email,
      user.name,
      user.profilePicture,
    );

    if (token) {
      const tokenPrefix = token.substring(0, 15) + '...';
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || null,
      token,
      picture: user.profilePicture || null,
    };
  }

  async createGoogleUser(
    email: string,
    firstName: string,
    lastName: string,
    picture: string,
  ): Promise<AuthenticatedUser> {
    const name = `${firstName} ${lastName}`.trim();

    const user = await this.userService.create({
      email,
      name,
      password: '',
      authProvider: 'google',
      profilePicture: picture || null,
    });

    const token = this.generateToken(
      user.id,
      user.email,
      user.name,
      user.profilePicture,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name || null,
      token,
      picture: user.profilePicture || null,
    };
  }

  private generateToken(
    userId: number,
    email: string,
    name: string | null | undefined,
    picture: string | null | undefined,
  ): string {
    const payload = {
      sub: userId,
      email,
      name: name || null,
      picture: picture || null,
    };

    return this.jwtService.sign(payload);
  }
}
