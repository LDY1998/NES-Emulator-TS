import { recursive_log, Instruction_OptCode_Table} from "./Util";
import { CPU } from "./Processor/CPU";


/**
 * Currently only for testing
 * 
 */


let cpu: CPU = new CPU();

cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_ZP);
cpu.setMemory(0xF1, 0xF1);
cpu.setMemory(cpu.getPC()+1, 0xF1);

cpu.execute(3);

recursive_log(cpu);