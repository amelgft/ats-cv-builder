import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create-ats-cv')
  createPdf(@Body() cvData: unknown): unknown {
  return this.appService.createPdf(cvData);
  }


}
