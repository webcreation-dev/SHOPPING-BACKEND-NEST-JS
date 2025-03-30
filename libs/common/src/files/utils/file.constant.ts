export const MaxFileCount = {
  PRODUCT_IMAGES: 5,
  PROPERTY_IMAGES: 5,
  VALIDATE_ACCOUNT: 3,
} as const satisfies Record<string, number>;

export const BASE_PATH = 'upload';

export const FilePath = {
  Users: {
    BASE: 'users',
    IMAGES: 'images',
  },
  Properties: {
    BASE: 'properties',
    IMAGES: 'images',
  },
} as const satisfies Record<string, Record<string, string>>;

export const MULTIPART_FORMDATA_KEY = 'multipart/form-data';
