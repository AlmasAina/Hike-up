import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

/** Persist a new display order: ids in the desired order. */
export class ReorderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids: string[];
}
