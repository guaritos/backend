import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware{
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const date = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    console.log(`[${date}][INFO][${method}]: ${originalUrl}`);
    next();
  }
}
