//1. 장비 등록
// - 제어측에서 ID, TYPE, EUI, KEY를 넣고 Command에 4를 쓴다
// - 중계기는 장비를 시스템에 등록하고  state에 값을 써서 등록됨을 표시, Command는 0으로 초기화
// Modbus Register Map
// 1	id
// 2	type
// 3	eui_1
// 4	eui_2
// 5	eui_3
// 6	eui_4
// 7	key_1
// 8	key_2
// 9	key_3
// 10	key_4
// 11	key_5
// 12	key_6
// 13	key_7
// 14	key_8
// 15	state
// 16	command
// 17	config
// 18
// 19
// 20
// 21	id
// 22	type

//레지스터 크기	2Byte(16bit)
// devEui	8Byte(64bit)
// appKey	16Byte(128bit)

// command
// 1	ON
// 2	OFF
// 3	설정변경
// 4	등록
// 5	삭제

// state
// 1	ON
// 2	OFF
// 3	ERROR
// ...	...

// 시나리오
// 1. 장비 등록
// - 제어측에서 ID, TYPE, EUI, KEY를 넣고 Command에 4를 쓴다
// - 중계기는 장비를 시스템에 등록하고  state에 값을 써서 등록됨을 표시, Command는 0으로 초기화

// 2. ON
// - 제어측에서 command에 1을 쓴다
// - 중계기는 장비에 제어 명령을 전송하고 state 값을 업데이트해서 동작했음을 표시 Command는 0으로 초기화

// 3. OFF
// - ON과 같음

// 4. 설정 변경
// - 제어측에서 config 값을 업데이트하고 command에 3을 쓴다
// - 중계기는 설정(AC 온도, 모드 등)을 변경하고 제어 명령을 전송한 뒤 Command를 0으로 초기화

import { Injectable } from '@nestjs/common';
import ModbusRTU from 'modbus-serial';
import {
  HWCodeType,
  HWCommand,
  HWMapRegister,
  DeviceCode,
} from 'src/modbus/dto/modbusDto';
import * as Dummy from '../dummy/dummy.json';

@Injectable()
export class ModbusService {
  private client: ModbusRTU;
  public COM_PORT = 'COM1'; //process.env.COM_PORT;

  constructor() {
    //장비 연결 안했을시 주석처리 필요
    //this.connect();
  }
  connect() {
    console.log('Modbus connect port ', this.COM_PORT);
    this.client = new ModbusRTU();
    this.client.connectRTUBuffered(this.COM_PORT, {
      baudRate: 9600,
      parity: 'none',
      stopBits: 1,
      dataBits: 8,
    });
    this.client.setID(1); // Modbus slave ID
  }

  disconnect() {
    // this.client.close;
  }

  // systemOn() {}

  // systemOff() {}

  async readDummyUUID(uuid) {
    const dummy_data = Dummy.data;

    for (let i = 0; i < dummy_data.length; i++) {
      if (dummy_data[i].uuid == uuid) return dummy_data[i];
    }
  }

  async readDummyCount() {
    return Dummy.data.length;
  }

  async createDeviceModbus(uuid: string): Promise<any> {
    const device = await this.readDummyUUID(uuid);

    //device 검증
    // const device_vaildate = this.validateDevice(device);
    // if (device_vaildate.status == 403) return device_vaildate;

    const hwCount = await this.readDummyCount();

    const result = await this.createModbusDevice(device, hwCount);

    return device.name + '디바이스 등록';
  }
  async controlDevice(uuid, execute) {
    //전달받은 id 로 등록된 device 조회후 제어
    const device = await this.readDummyUUID(uuid);

    let isOn = false;

    switch (execute) {
      case true:
        isOn = true;
        break;
      case false:
        isOn = false;
        break;
      case 'true':
        isOn = true;
        break;
      case 'false':
        isOn = false;
        break;
      case 'on':
        isOn = true;
        break;
      case 'off':
        isOn = false;
        break;
      default:
        isOn = execute;
        break;
    }

    await this.controlModbus(device, isOn);

    return device.name + '디바이스 명령 : ' + execute + '실행';
  }

  async controlModbus(device, command) {
    console.log('controlModbus 실행 device = ', device.name);
    const hwCount = await this.readDummyCount();
    this.control(device.slaveId, command, hwCount);
  }

  async setAirconditioner(uuid, data) {
    const device = await this.readDummyUUID(uuid);

    if (device == null) return '데이터없음';

    const hwCount = await this.readDummyCount();

    await this.setAirconditionerModbus(device.slaveId, data, hwCount);

    return device.name + 'config 변경';
  }

  async readDevicesModbus() {
    const devices = Dummy.data;
    const hwCount = devices.length;

    const data = await this.readAllRegist(hwCount);

    return data;
  }
  //hw 등록 한번에 하기
  async createDevicesModbus(): Promise<any> {
    //하드웨어 연결 디바이스 가져오기
    const devices = Dummy.data;
    const hwCount = devices.length;

    const result = await this.createModbusDevices(devices, hwCount);

    return result;
  }
  //hw 삭제 all
  async deleteDevicesModbus() {
    console.log('deleteDevicesModbus');
    const devices = Dummy.data;
    const hwCount = devices.length;
    console.log('hwCount = ', hwCount);

    return await this.deleteAllRegist(hwCount);
  }
  //상단 하드웨어 등록 시나리오 참고
  async createModbusDevice(device, hwCount) {
    console.log('createModbusDevice 하드웨어 레지스터 등록 = ', device.name);
    //하드웨어 등록은 register 섹션별  n * 1번부터 ~  n * 14번까지 데이터를 입력한후 command 4 입력한다.
    const values = this.makeValues(device);

    //register 비어있는 섹션 찾기
    const start_regist = await this.findStartRegist(hwCount);

    console.log('start_regist = ', start_regist);
    await this.writeRegisters(start_regist, values);

    await this.writeRegister(HWMapRegister.command - 1, HWCommand.Register);
  }

  async createModbusDevices(devices, hwCount) {
    //하드웨어 등록은 register 1번부터 ~ 14번까지 데이터를 입력한후 command 4 입력한다.
    console.log('createModbusDevices = ', devices.name);
    for (let i = 0; i < hwCount; i++) {
      await this.createModbusDevice(devices[i], hwCount);
    }
  }

  async findStartRegist(hwCount) {
    for (let i = 0; i < hwCount; i++) {
      const read_data = await this.readHoldingRegisters(i * 20, 1);

      const id = read_data.data[0];
      if (id == 0) return i * 20;
    }
  }

  async readAllRegist(hwCount) {
    const all_regist = [];
    for (let i = 0; i < hwCount; i++) {
      const read_data = await this.readHoldingRegisters(i * 20, 1);

      const id = read_data.data[0];
      const data = {
        address: i * 20,
        id: id,
      };
      all_regist.push(data);
    }

    return all_regist;
  }

  async deleteAllRegist(hwCount) {
    //삭제 할때 앞에서 부터 지우면 한칸씩 땡겨지기 때문에 뒤에서 부터 지워준다
    const data = await this.readAllRegist(hwCount);

    for (let i = data.length; i >= 0; i--) {
      const section = i * 20 + 15;
      console.log('deleteAllRegist section주소 = ', section);
      await this.writeRegister(section, HWCommand.Delete);
    }

    return '레지스트 삭제 완료';
  }

  //hw modbus on : 1, off : 2, 설정변경 : 3, 등록 : 4, 삭제 : 5
  async control(slaveId, command, hwCount) {
    let control_slave = -1;
    //0, 20, 40, 60 ..... 섹션의 id값 읽어오기
    for (let i = 0; i < hwCount; i++) {
      const read_data = await this.readHoldingRegisters(i * 20, 1);
      console.log('read_data', read_data);
      let id = read_data.data[0].toString();
      console.log('id = ', id);
      if (parseInt(id) < 10) {
        // 10 이하의 숫자라면 0을 앞에 붙힙니다.
        id = '0' + id;
      } else {
        // 10보다 큰 숫자는 그대로 반환합니다.
        id = id.toString();
      }

      if (id == slaveId) {
        control_slave = i * 20;
        console.log('control_slave 섹션확인= ', control_slave);
      }
    }

    if (control_slave == -1) return '일치하는 device 가 없습니다.';

    console.log(
      '제어 섹션  = ',
      control_slave,
      '   제어 command 주소 = ',
      control_slave + 15,
      '제어명령 = ',
      command,
    );

    if (command == true) command = 1;
    else if (command == false) command = 0;

    await this.writeRegister(control_slave + 15, command);
  }

  async setAirconditionerModbus(slaveId, data, hwCount) {
    let control_slave = -1;
    //0, 20, 40, 60 ..... 섹션의 id값 읽어오기
    for (let i = 0; i < hwCount; i++) {
      const read_data = await this.readHoldingRegisters(i * 20, 1);
      console.log('read_data', read_data);
      let id = read_data.data[0].toString();
      console.log('id = ', id);
      if (parseInt(id) < 10) {
        // 10 이하의 숫자라면 0을 앞에 붙힙니다.
        id = '0' + id;
      } else {
        // 10보다 큰 숫자는 그대로 반환합니다.
        id = id.toString();
      }

      if (id == slaveId) {
        control_slave = i * 20;
        console.log('control_slave 섹션확인= ', control_slave);
      }
    }

    console.log(
      '제어 섹션  = ',
      control_slave,
      '   제어 command 주소 = ',
      control_slave + 16,
      '제어명령 = ',
      data,
    );

    const values: number[] = [];
    //register 1번 아이디 넣기
    const mode = parseInt(data.acMode);
    values.push(this.intToHex2Bytes(mode));

    const temperature = parseInt(data.temperature);
    values.push(this.intToHex2Bytes(temperature));

    console.log('에어컨 하드웨어 전송 values = ', values);
    //에어컨 모드와, 온도를 한번에 전송해준다
    await this.writeRegisters(control_slave + 16, values);
    //그이후 커멘드를 3 전송해준다
    await this.writeRegister(control_slave + 15, HWCommand.Config);
  }

  // async writeCoil(address: number, value: boolean) {
  //   try {
  //     await this.client.writeCoil(address, value);
  //     console.log(
  //       `Successfully wrote coil at address ${address} with value ${value}`,
  //     );
  //   } catch (error) {
  //     console.error(`Error writing coil: ${error}`);
  //   }
  // }
  // readCoil(address: number, lenght: number) {
  //   try {
  //     this.client.readCoils(address, lenght);
  //     console.log(
  //       `Successfully wrote coil at address ${address} with lenght ${lenght}`,
  //     );
  //   } catch (error) {
  //     console.error(`Error writing coil: ${error}`);
  //   }
  // }
  async writeRegister(address: number, value: number) {
    try {
      await this.client.writeRegister(address, value);
      console.log(
        `Successfully writeRegister at address ${address} with value ${value} `,
      );
    } catch (error) {
      console.error(`Error writing coil: ${error}`);
    }
  }
  async writeRegisters(address: number, values: Array<number>) {
    try {
      await this.client.writeRegisters(address, values);
      console.log(
        `Successfully writeRegisters at address ${address} with value ${values} `,
      );
    } catch (error) {
      console.error(`Error writing coil: ${error}`);
    }
  }

  async readHoldingRegisters(startAddress: number, quantity: number) {
    try {
      // Read holding registers from the Modbus RTU device
      const response = this.client.readHoldingRegisters(startAddress, quantity);

      if (response) {
        return response;
      } else {
        throw new Error('Modbus RTU read error');
      }
    } catch (error) {
      console.error('Modbus RTU read error:', error);
      throw new Error('Modbus RTU read error');
    }
  }

  makeValues(device) {
    const values: number[] = [];
    //register 1번 아이디 넣기
    const id = parseInt(device.slaveId);
    values.push(this.intToHex2Bytes(id));

    //register 2번 type 넣기
    console.log('device.codeType = ', device.codeType);
    values.push(this.intToHex2Bytes(parseInt(device.codeType)));
    //]]

    //register 3번 ~ 6번 eui 넣기 [[
    const devEUI = this.splitHexToBytes(device.eui);
    values.push(...devEUI);

    //register 7번 ~ 14번 eui 넣기 [[
    const appkey = this.splitHexToBytes(device.appKey);
    values.push(...appkey);

    //최종 values 값 확인 리턴
    console.log('makeValues = ', values);

    //문자열을 숫자로 저장
    const result = this.stringArrayToHexNumbers(values);
    console.log('result = ', result);
    return result;
  }

  splitHexToBytes(hexString) {
    const hexArray = [];

    for (let i = 0; i < hexString.length; i += 4) {
      const hexPair = hexString.substr(i, 4); // 4글자(2바이트)씩 자름
      if (hexPair.length === 4) {
        hexArray.push(hexPair); // 배열에 추가
      }
    }

    return hexArray;
  }
  //정수형 10진수를 hex 로 만들어주는 코드
  intToHex2Bytes(number) {
    // 10진수 숫자를 16진수로 변환하고 문자열로 표시
    const hexString = number.toString(16);

    // 16진수 문자열을 2바이트(4글자)로 만듭니다.
    const paddedHexString = hexString.padStart(4, '0');

    return paddedHexString.toLowerCase();
  }

  stringArrayToHexNumbers(stringArray) {
    return stringArray.map((hexString) => parseInt(hexString, 16));
  }
}
