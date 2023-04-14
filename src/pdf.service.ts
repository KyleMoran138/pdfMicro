import { Injectable } from '@nestjs/common';
import * as HummusRecipe from 'hummus-recipe';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PdfService {
  async mergePdfs(inputFiles: string[]): Promise<string> {
    const outputFile = `./output/merged-${uuidv4()}.pdf`;
    const pdfDoc = new HummusRecipe('new', outputFile);
    inputFiles.forEach((inputFile) => {
      const srcPdf = new HummusRecipe(inputFile as any);
      const totalPages = srcPdf.metadata.pages;
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        pdfDoc.appendPage(inputFile, pageNumber);
      }
    });
    pdfDoc.endPDF();
    return outputFile;
  }

  async splitPdf(inputFile: string): Promise<string[]> {
    const pdfDoc = new HummusRecipe(inputFile as any);
    const totalPages = pdfDoc.metadata.pages;
    const outputFiles: string[] = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const outputFile = `./output/page-${pageNumber}-${uuidv4()}.pdf`;
      outputFiles.push(outputFile);
      const newPdfDoc = new HummusRecipe('new', outputFile);
      newPdfDoc.appendPage(inputFile, pageNumber);
      newPdfDoc.endPDF();
    }
    return outputFiles;
  }

  // Other PDF mutation functions can be added here
}
