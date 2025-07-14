import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RuleSchema } from 'src/modules/rule-engine/schema/rule.schema';
import * as yaml from 'yaml';

@Injectable()
export class YamlParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const yamlStr = req.body;

    if (!yamlStr || typeof yamlStr !== 'string') {
      return next(); // skip if no yaml field
    }
 
    try {
      const parsed = yaml.parse(yamlStr);
      // const validationResult = RuleSchema.safeParse(parsed);
      // if (!validationResult.success) {
      //   console.error('YAML validation error:', validationResult.error.message);
      //   throw new BadRequestException(
      //     'Invalid YAML format: ' + validationResult.error,
      //   );
      // }
      req.body = parsed; // replace body with parsed YAML
      next();
    } catch (e) {
      throw new BadRequestException('Invalid YAML format');
    }
  }
}
