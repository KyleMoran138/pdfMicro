import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { PdfService } from './pdf.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [AppController],
  providers: [PdfService],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
