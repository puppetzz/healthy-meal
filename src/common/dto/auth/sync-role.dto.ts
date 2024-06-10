import { IsNotEmpty, IsString } from 'class-validator';

export class SyncRoleDTO {
  @IsNotEmpty()
  @IsString()
  uid: string;
}
