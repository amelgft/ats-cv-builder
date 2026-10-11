import { Body, Controller, Get, Post, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create-ats-cv')
  async createPdf(@Body() cvData: unknown): Promise<StreamableFile> {
  const pdf = await this.appService.createPdf(cvData);

  return new StreamableFile(pdf, {
    type: 'application/pdf',
    disposition: 'attachment; filename="my-cv.pdf"',
  });
}
}
