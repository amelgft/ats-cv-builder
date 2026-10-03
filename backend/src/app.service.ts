import { BadRequestException, Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async createPdf(cvData: unknown): Promise<Uint8Array> {
    
    if (JSON.stringify(cvData) === '{}') {
      throw new BadRequestException('CV data is required')
    }

    const templateHtml = await fs.readFile(
      'template/cv.html',
      { encoding: 'utf8' },
    );
    

    const renderTemplate = Handlebars.compile(templateHtml);
    const filledHtml = renderTemplate(cvData);

    const browser = await puppeteer.launch();

    try {
      const page = await browser.newPage();

      await page.setContent(filledHtml);

      const pdf = await page.pdf({
       format: 'A4',
       preferCSSPageSize: true,
       printBackground: true,
        });

      return pdf;
    } finally {
      await browser.close();
    }
  }
}