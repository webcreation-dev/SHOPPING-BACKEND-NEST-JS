import {
  FileTypeValidator,
  FileValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import * as bytes from 'bytes';
import { NonEmptyArray } from 'common/util/array.util';
import { lookup } from 'mime-types';
import { FileSignatureValidator } from './validators/file-signature.validator';

type FileType = 'png' | 'jpeg' | 'pdf';
type FileSize = `${number}${'KB' | 'MB' | 'GB'}`;

const createFileTypeRegex = (fileTypes: FileType[]) => {
  const mediaTypes = fileTypes.map((type) => lookup(type));
  return new RegExp(mediaTypes.join('|'));
};

export const createFileValidators = (
  maxSize: FileSize,
  ...fileTypes: NonEmptyArray<FileType>
): FileValidator[] => {
  const fileTypeRegex = createFileTypeRegex(fileTypes);

  return [
    new MaxFileSizeValidator({ maxSize: bytes(maxSize) }),
    new FileTypeValidator({ fileType: fileTypeRegex }),
    new FileSignatureValidator(),
  ];
};
