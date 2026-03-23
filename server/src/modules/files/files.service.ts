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

    return {
      fileName,
      originalName: file.originalname,
      filePath: `/${uploadDir}/${fileName}`,
      url: `/uploads/${fileName}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    const uploadDir = this.configService.get('UPLOAD_DIRECTORY') || './uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const fileName = `avatar-${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/${fileName}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return { avatarUrl };
  }
}
