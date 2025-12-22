import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../interfaces';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<User>;
}
export {};
