import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@core/database/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { AppLogger } from '@common/logger/app-logger.service';
import { User } from '@prisma/client';

// Define the authenticated user type using Pick to select specific properties from User
type AuthenticatedUser = Pick<User, 'id' | 'email'> & {
  name: string | null;
  token: string;
  picture?: string | null;
};

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthenticatedUser> {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration attempt with existing email: ${email}`);
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        authProvider: 'local',
      },
    });

    this.logger.log(`User registered successfully: ${user.id}`);

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

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider === 'google') {
      this.logger.warn(`Local login attempt for Google user: ${user.id}`);
      throw new UnauthorizedException(
        'This account uses Google authentication. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${user.id}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${user.id}`);

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
    this.logger.debug(`Google login attempt for: ${email}`);
    this.logger.debug(
      `Google profile details: firstName=${firstName}, lastName=${lastName}, picture=${picture ? 'present' : 'absent'}`,
    );

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return await this.createGoogleUser(email, firstName, lastName, picture);
    } else if (user.authProvider !== 'google') {
      this.logger.debug(
        `Updating existing user (id=${user.id}) to use Google auth`,
      );

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: 'google',
          profilePicture: picture || null,
        },
      });

      this.logger.log(`Existing user updated to use Google auth: ${user.id}`);
    }

    this.logger.debug(
      `User data for token: id=${user.id}, email=${user.email}, name=${user.name || 'null'}, picture=${user.profilePicture ? 'present' : 'null'}`,
    );

    const token = this.generateToken(
      user.id,
      user.email,
      user.name,
      user.profilePicture,
    );

    if (token) {
      const tokenPrefix = token.substring(0, 15) + '...';
      this.logger.debug(`Generated token: ${tokenPrefix}`);
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
    this.logger.debug(`Creating Google user for email: ${email}`);

    const name = `${firstName} ${lastName}`.trim();
    this.logger.debug(`Full name for Google user: "${name}"`);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: '',
        authProvider: 'google',
        profilePicture: picture || null,
      },
    });

    this.logger.log(`New Google user created with ID: ${user.id}`);

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
    this.logger.debug(
      `Generating token with: userId=${userId}, email=${email}, name=${name || 'null'}, picture=${picture ? 'present' : 'null'}`,
    );

    const payload = {
      sub: userId,
      email,
      name: name || null,
      picture: picture || null,
    };

    this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);

    return this.jwtService.sign(payload);
  }
}
