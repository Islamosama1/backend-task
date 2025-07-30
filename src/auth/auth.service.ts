import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants/constants';

export interface User {
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async validateUser(email: string, password: string): Promise<any> {
    // Just for testing
    if (email && password) {
      return { userId: '1', email };
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: JWT_SECRET,
        expiresIn: JWT_EXPIRES_IN,
      }),
    };
  }
}
