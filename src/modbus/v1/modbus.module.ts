import { Module, forwardRef } from '@nestjs/common';
import { ModbusService } from './modbus.service';
import { ModbusController } from './modbus.controller';

@Module({
  imports: [],
  providers: [ModbusService],
  exports: [ModbusService],
  controllers: [ModbusController],
})
export class ModbusModule {}
