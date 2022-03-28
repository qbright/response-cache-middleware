import { RegisterOptionParams } from './options/register-options';

export abstract class BaseMiddleware {
  abstract register(options: RegisterOptionParams): void;
}
