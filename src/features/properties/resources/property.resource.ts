import { Property } from '../entities/property.entity';

export class PropertyResource {
  constructor() {}

  format(property: Property) {
    return {
      ...property,
      galleries: property.galleries.map((gallery) => ({
        ...gallery,
        url: `${process.env.API_URL}${gallery.url}`,
      })),
    };
  }

  formatCollection(properties: Property[]) {
    return properties.map((property) => this.format(property));
  }
}
