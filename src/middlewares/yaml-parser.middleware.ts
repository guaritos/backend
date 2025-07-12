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
    const yamlStr = req.body?.raw;

    if (!yamlStr || typeof yamlStr !== 'string') {
      return next(); // skip if no yaml field
    }
 
    try {
      const parsed = yaml.parse(yamlStr);
      const validationResult = RuleSchema.safeParse(parsed);
      if (!validationResult.success) {
        throw new BadRequestException(
          'Invalid YAML format: ' + validationResult.error.format(),
        );
      }
      req.body.json = validationResult.data;
      next();
    } catch (e) {
      throw new BadRequestException('Invalid YAML format');
    }
  }
}
