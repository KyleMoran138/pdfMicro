import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
  Request,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Controller('pdf')
export class AppController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly pdfService: PdfService) { }

  @Post('merge')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const fileName = `${uuidv4()}${Date.now()}.pdf`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async mergePdfs(@UploadedFiles() files, @Res() res: Response): Promise<void> {
    const inputFiles = files.map((file) => file.path);
    const outputFile = await this.pdfService.mergePdfs(inputFiles);

    // Remove temporary input files
    inputFiles.forEach((filePath) => fs.unlinkSync(filePath));

    // Send the outputFile as a response or provide a download link
    res.download(outputFile, () => {
      // Remove outputFile after it's been sent
      fs.unlinkSync(outputFile);
    });
  }

  @Post('split')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const fileName = `${uuidv4()}${Date.now()}.pdf`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async splitPdf(
    @UploadedFiles() file,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const inputFile = file[0].path;
    const outputFiles = await this.pdfService.splitPdf(inputFile);

    // Remove temporary input file
    fs.unlinkSync(inputFile);

    // Send a JSON response containing download links for each output file
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const downloadLinks = outputFiles.map((filePath) => {
      const fileName = filePath.split('/').pop();
      return `${protocol}://${host}/pdf/download/${fileName}`;
    });

    res.json({ files: downloadLinks });
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = `./output/${fileName}`;

    // Send the file as a response or provide a download link
    res.download(filePath, () => {
      // Remove file after it's been sent
      fs.unlinkSync(filePath);
    });
  }

  // Other PDF mutation endpoints can be added here
}
