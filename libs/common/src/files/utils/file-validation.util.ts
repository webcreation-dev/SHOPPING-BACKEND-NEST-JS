import {
  FileTypeValidator,
  FileValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import * as bytes from 'bytes';
import { NonEmptyArray } from '../../usual/util/array.util';
import { lookup } from 'mime-types';
import { FileSignatureValidator } from './validators/file-signature.validator';

type FileSize = `${number}${'KB' | 'MB' | 'GB'}`;
type FileType = 'png' | 'jpeg' | 'pdf';

const createFileTypeRegex = (fileTypes: FileType[]) => {
  const mediaTypes = fileTypes.map((type) => lookup(type));
  return new RegExp(mediaTypes.join('|'));
};

export const createFileValidators = (
  maxSize: FileSize,
  fileTypes: FileType[],
): FileValidator[] => {
  const fileTypeRegex = createFileTypeRegex(fileTypes);

  return [
    new MaxFileSizeValidator({ maxSize: bytes(maxSize) }),
    new FileTypeValidator({ fileType: fileTypeRegex }),
    new FileSignatureValidator(),
  ];
};

export const createParseFilePipe = (
  maxSize: FileSize,
  ...fileTypes: NonEmptyArray<FileType>
) =>
  new ParseFilePipe({
    validators: createFileValidators(maxSize, fileTypes),
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });
