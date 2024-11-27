import { IsNumber, IsUUID } from 'class-validator';

export class IdDto {
  @IsNumber()
  // @IsUUID()
  readonly id: number;
}
