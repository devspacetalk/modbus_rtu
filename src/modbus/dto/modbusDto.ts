import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmpty,
  ValidateIf,
  IsBoolean,
} from 'class-validator';

export enum DeviceCode {
  Entrance = 'Entrance',
  Door = 'Door',
  Light = 'Light',
  PC = 'PC',
  Projector = 'Projector',
  AIRCONDITIONER = 'Airconditioner',
}

export enum HWCodeType {
  Relay = 1,
  IR_SamsungAC = 2,
  IR_LGAC = 3,
  IR_AirClean = 4,
  IR_NECProjector = 5,
}

export enum HWCommand {
  ON = 1,
  OFF = 2,
  Config = 3,
  Register = 4,
  Delete = 5,
}

export enum HWMapRegister {
  id = 1,
  type = 2,
  eui_1 = 3,
  eui_2 = 4,
  eui_3 = 5,
  eui_4 = 6,
  key_1 = 7,
  key_2 = 8,
  key_3 = 9,
  key_4 = 10,
  key_5 = 11,
  key_6 = 12,
  key_7 = 13,
  key_8 = 14,
  state = 15,
  command = 16,
  config = 17,
  config_temp = 18,
}

//17 mode, 18, temp
export enum HWACMode {
  Cool = 1,
  Dry = 2,
  Fan = 3,
  Heat = 4,
}

export class DeviceAirconditionerDto {
  @ApiProperty({
    description: '에어컨 모드 1 : 냉방, 2 : 제습, 3: 송품, 4: 난방',
    enum: HWACMode,
    example: [HWACMode.Cool, HWACMode.Dry, HWACMode.Fan, HWACMode.Heat],
  })
  @IsNumber()
  acMode: number;

  @ApiProperty({
    description: 'temperature 온도 전달',
  })
  @IsNumber()
  temperature: number;
}
