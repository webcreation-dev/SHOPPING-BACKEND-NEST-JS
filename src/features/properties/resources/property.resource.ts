import { Property } from '../entities/property.entity';
import { TypePropertyEnum } from '../enums/type_property.enum';

export class PropertyResource {
  constructor() {}

  format(property: Property) {
    const baseData = {
      id: property.id,
      type: property.type,
      to_sell: property.to_sell,
      video_url: property.video_url,
      tarification: property.tarification,
      visit_price: property.visit_price,
      rent_price: property.rent_price,
      commission: property.commission,
      description: property.description,
      latitude: property.latitude,
      longitude: property.longitude,
      district: property.district,
      municipality: property.municipality,
      department: property.department,
      galleries: property.galleries.map((gallery) => ({
        ...gallery,
        url: `${process.env.API_URL}${gallery.url}`,
      })),
      user: property.user,
      owner: property.owner,
      articles: property.articles,
    };

    if (property.type !== TypePropertyEnum.PARCEL) {
      const specificData = {
        number_living_rooms: property.number_living_rooms,
        number_rooms: property.number_rooms,
        number_bathrooms: property.number_bathrooms,
        number_households: property.number_households,
        paint: property.paint,
        is_fence: property.is_fence,
        is_terace: property.is_terace,
        sanitary: property.sanitary,
        water_meter_type: property.water_meter_type,
        electricity_meter_type: property.electricity_meter_type,
        electricity_personal_meter_type:
          property.electricity_personal_meter_type,
        electricity_decounter_meter_rate:
          property.electricity_decounter_meter_rate,
        month_advance: property.month_advance,
        caution: property.caution,
      };

      return { ...baseData, ...specificData };
    }

    return baseData;
  }

  formatCollection(properties: Property[]) {
    return properties.map((property) => this.format(property));
  }
}
