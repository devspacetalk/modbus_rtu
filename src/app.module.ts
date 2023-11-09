import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModbusModule } from './modbus/v1/modbus.module';

@Module({
  imports: [ConfigModule.forRoot(), ModbusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
