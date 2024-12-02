import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import {
  DataSource,
  getConnectionManager,
  getConnection,
  createConnection,
  getConnectionOptions,
  Repository,
} from 'typeorm';

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  private async getRepository(
    entityClass: new () => any,
  ): Promise<Repository<any>> {
    let connection: DataSource;

    // Vérifie si une connexion existe déjà
    if (!getConnectionManager().has('default')) {
      const connectionOptions = await getConnectionOptions();
      connection = await createConnection(connectionOptions);
    } else {
      connection = getConnection();
    }

    return connection.getRepository(entityClass);
  }

  async validate(value: any, args: ValidationArguments) {
    const [entityClass, property] = args.constraints;

    try {
      const repository = await this.getRepository(entityClass); // Récupère le repository dynamiquement
      const count = await repository.count({ where: { [property]: value } });
      return count === 0; // Retourne true si la valeur est unique
    } catch (error) {
      console.error('Error validating uniqueness:', error);
      return false; // Retourne false en cas d'erreur
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [entityClass, property] = args.constraints;
    return `${property} already exists in ${entityClass.name}`;
  }
}

export function IsUnique(
  entityClass: new () => any,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: IsUniqueConstraint,
    });
  };
}
