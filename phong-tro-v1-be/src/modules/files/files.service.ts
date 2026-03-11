import 'multer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: string) {
    const uploadDir = this.configService.get('UPLOAD_DIRECTORY') || './uploads';
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Log the upload (optional)
    // await this.prisma.activityLog.create({
    //   data: {
    //     userId,
    //     propertyId: '', // Add if needed
    //     action: 'FILE_UPLOAD',
    //     entityType: 'File',
    //     entityId: fileName,
    //     details: { originalName: file.originalname, size: file.size },
    //   },
    // });

    return {
      fileName,
      originalName: file.originalname,
      filePath: `/${uploadDir}/${fileName}`,
      url: `/uploads/${fileName}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
