import {
  ConflictException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { join } from 'path';
import { BASE_PATH } from '../utils/file.constant';
import {
  createReadStream,
  mkdirp,
  pathExists,
  readdir,
  remove,
  writeFile,
} from 'fs-extra';

@Injectable()
export class FseService implements StorageService {
  async saveFile(path: string, file: Express.Multer.File) {
    const { originalname, buffer } = file;

    const uniqueFilename = this.genUniqueFilename(originalname);
    const fullPath = join(BASE_PATH, path, uniqueFilename);
    await writeFile(fullPath, buffer);
  }

  async saveFiles(dir: string, files: Express.Multer.File[]) {
    await Promise.all(
      files.map(async (file) => {
        await this.saveFile(dir, file);
      }),
    );
  }

  async createDir(path: string) {
    const fullPath = join(BASE_PATH, path);
    await mkdirp(fullPath);
  }

  getFile(path: string) {
    const fullPath = join(BASE_PATH, path);
    const stream = createReadStream(fullPath);
    return new StreamableFile(stream);
  }

  getDirFilenames(path: string) {
    const fullPath = join(BASE_PATH, path);
    return readdir(fullPath);
  }

  async getDirFilecount(path: string) {
    const dirFilenames = await this.getDirFilenames(path);
    return dirFilenames.length;
  }

  async delete(path: string) {
    const fullPath = join(BASE_PATH, path);
    await remove(fullPath);
  }

  async validatePath(path: string) {
    const fullPath = join(BASE_PATH, path);
    if (!(await pathExists(fullPath))) {
      throw new NotFoundException('Path not found');
    }
  }

  validateFilecount(count: number, max: number) {
    if (count > max) {
      throw new ConflictException('File count exceeds max limit');
    }
  }

  genUniqueFilename(filename: string) {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${uniquePrefix}-${filename}`;
  }
}
