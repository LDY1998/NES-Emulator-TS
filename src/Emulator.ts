import { recursive_log } from "./Util";
import { CPU, Instruction_OptCode_Table } from "./Processor/CPU";


/**
 * Currently only for testing
 * 
 */


let cpu: CPU = new CPU();

cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_IMD);
cpu.setMemory(cpu.getPC()+1, 0xF1);

cpu.execute(2);

recursive_log(cpu);