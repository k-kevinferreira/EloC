import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ADMIN_ROLES } from '../auth/constants/admin-roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { UploadedFile as UploadedFileInput } from './interfaces/uploaded-file.interface';
import { UploadsService } from './uploads.service';

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('product-images')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(@UploadedFile() file?: UploadedFileInput) {
    return this.uploadsService.saveProductImage(file);
  }
}
