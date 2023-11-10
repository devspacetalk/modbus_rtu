import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DeviceAirconditionerDto, HWCommand } from 'src/modbus/dto/modbusDto';
import { ModbusService } from './modbus.service';
import { Request } from 'express';

@Controller('v1/modbus')
@ApiTags('modbus 컨트롤러 제어')
export class ModbusController {
  constructor(private readonly modbusService: ModbusService) {}

  @Post('/device/modbus/:uuid')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'device uuid (출입문, pc, light, Airconditioner, projector )',
    enum: [
      '679bb01c-7462-11ee-b962-0242ac120002',
      '679bb2a6-7462-11ee-b962-0242ac120002',
      '679bb4fe-7462-11ee-b962-0242ac120002',
      '679bb62a-7462-11ee-b962-0242ac120002',
      '679bb742-7462-11ee-b962-0242ac120002',
    ],
  })
  @ApiOperation({
    summary: '매장의 device 보드 등록',
    description: '매장 device 보드 등록',
  })
  async createDeviceModbus(@Param('uuid') uuid: string): Promise<any> {
    return await this.modbusService.createDeviceModbus(uuid);
  }

  @Delete('/device/modbus/:uuid')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'device uuid (출입문, pc, light, Airconditioner, projector )',
    enum: [
      '679bb01c-7462-11ee-b962-0242ac120002',
      '679bb2a6-7462-11ee-b962-0242ac120002',
      '679bb4fe-7462-11ee-b962-0242ac120002',
      '679bb62a-7462-11ee-b962-0242ac120002',
      '679bb742-7462-11ee-b962-0242ac120002',
    ],
  })
  @ApiOperation({
    summary: 'device modbus register 삭제',
    description: 'modbus register 삭제',
  })
  async deleteModbus(@Param('uuid') uuid: string): Promise<any> {
    return await this.modbusService.controlDevice(uuid, HWCommand.Delete);
  }

  @Put('/device/control/:uuid/:execute')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'device uuid (출입문, pc, light, Airconditioner, projector)',
    enum: [
      '679bb01c-7462-11ee-b962-0242ac120002',
      '679bb2a6-7462-11ee-b962-0242ac120002',
      '679bb4fe-7462-11ee-b962-0242ac120002',
      '679bb62a-7462-11ee-b962-0242ac120002',
      '679bb742-7462-11ee-b962-0242ac120002',
    ],
  })
  @ApiParam({
    name: 'execute',
    required: true,
    description: 'device 실행',
    enum: ['true', 'false'],
  })
  @ApiOperation({
    summary: 'store device 제어',
    description: 'store device 제어',
  })
  async controlDevice(
    @Param('uuid') uuid: string,
    @Param('execute') execute: boolean,
  ): Promise<any> {
    return await this.modbusService.controlDevice(uuid, execute);
  }

  @Put('/device/airconditioner/:uuid/:acMode/:temperature')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'device uuid hw(Airconditioner)',
    enum: ['679bb62a-7462-11ee-b962-0242ac120002'],
  })
  @ApiParam({
    name: 'acMode',
    required: true,
    description: '1:cool, 2:dry, 3:fan, 4:heat',
    enum: ['1', '2', '3', '4'],
  })
  @ApiParam({
    name: 'temperature',
    required: true,
    description: '18 ~ 28',
    enum: ['18', '20', '22', '24', '26', '28'],
  })
  @ApiOperation({
    summary: '에어컨 모드/ 온도 제어',
    description: '에어컨 모드/ 온도 제어',
  })
  async controlAirconditioner(
    @Param('uuid') uuid: string,
    @Param('acMode') acMode: string,
    @Param('temperature') temperature: string,
  ): Promise<any> {
    const config = {
      acMode: acMode,
      temperature: temperature,
    };
    return await this.modbusService.setAirconditioner(uuid, config);
  }

  @Get('/device/modbus/read/all')
  @ApiOperation({
    summary: '매장의 device 보드 읽기 ALL',
    description: '매장 device 보드 읽기 ALL',
  })
  async readDevicesModbus(): Promise<any> {
    console.log('createDevicesModbus()');
    return await this.modbusService.readDevicesModbus();
  }

  @Post('/device/modbus/register/all')
  @ApiOperation({
    summary: '매장의 device 보드 등록 ALL',
    description: '매장 device 보드 등록 ALL',
  })
  async createDevicesModbus(): Promise<any> {
    console.log('createDevicesModbus()');
    return await this.modbusService.createDevicesModbus();
  }

  @Delete('/device/modbus/delete/all')
  @ApiOperation({
    summary: '매장의 device 보드 section ALL 삭제',
    description: '매장 device 보드 section ALL 삭제',
  })
  async deleteDevicesModbus(): Promise<any> {
    console.log('createDevicesModbus()');
    return await this.modbusService.deleteDevicesModbus();
  }
  // END: 제어부
}
