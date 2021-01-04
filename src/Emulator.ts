import { CPU } from "./Processor/CPU";


let cpu: CPU = new CPU();

cpu.setMemory(cpu.getPC(), 0xA9);
cpu.setMemory(cpu.getPC()+1, 0x01);

cpu.execute(2);

cpu.log();