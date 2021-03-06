import { Instruction_OptCode_Table, Register, Mode, Flag, BranchMode } from "../Util";



/**
 * A chip-8 CPU emulator
 */
class CPU {



    private status: { [flag: string]: number} = {
        carry: 0,
        zero: 0,
        inter_dis: 0,
        decimal: 0,
        break: 0,
        overflow: 0,
        negative: 0
    };

    private REG_X: number;
    private REG_Y: number;
    private REG_SP: number;
    private REG_ACC: number;
    private REG_PC: number;

    private memory: number[];

    private opt_table: { [optcode: number]: (cycle: number) => number} = {
        [Instruction_OptCode_Table.LDA_IMD] : this.load(Register.REG_ACC, Mode.IMD),
        [Instruction_OptCode_Table.LDX_IMD]: this.load(Register.REG_X, Mode.IMD),
        [Instruction_OptCode_Table.LDY_IMD]: this.load(Register.REG_Y, Mode.IMD),
        [Instruction_OptCode_Table.LDA_ZP]: this.load(Register.REG_ACC, Mode.ZP),
        [Instruction_OptCode_Table.LDX_ZP]: this.load(Register.REG_X, Mode.ZP),
        [Instruction_OptCode_Table.LDY_ZP]: this.load(Register.REG_Y, Mode.ZP),
        [Instruction_OptCode_Table.LDA_ZPX]: this.load(Register.REG_ACC, Mode.ZPX),
        [Instruction_OptCode_Table.LDY_ZPX]: this.load(Register.REG_Y, Mode.ZPX),
        [Instruction_OptCode_Table.LDX_ZPY]: this.load(Register.REG_X, Mode.ZPY),
        [Instruction_OptCode_Table.LDA_ABS]: this.load(Register.REG_ACC, Mode.ABS),
        [Instruction_OptCode_Table.LDA_ABSX]: this.load(Register.REG_ACC, Mode.ABSX),
        [Instruction_OptCode_Table.LDA_ABSY]: this.load(Register.REG_ACC, Mode.ABSY),
        [Instruction_OptCode_Table.LDX_ABS]: this.load(Register.REG_X, Mode.ABS),
        [Instruction_OptCode_Table.LDX_ABSY]: this.load(Register.REG_X, Mode.ABSY),
        [Instruction_OptCode_Table.LDY_ABS]: this.load(Register.REG_Y, Mode.ABS),
        [Instruction_OptCode_Table.LDY_ABSX]: this.load(Register.REG_Y, Mode.ABSX),
        [Instruction_OptCode_Table.STA_ZP]: this.store(Register.REG_ACC, Mode.ZP),
        [Instruction_OptCode_Table.STA_ZPX]: this.store(Register.REG_ACC, Mode.ZPX),
        [Instruction_OptCode_Table.STA_ABS]: this.store(Register.REG_ACC, Mode.ABS),
        [Instruction_OptCode_Table.STA_ABSX]: this.store(Register.REG_ACC, Mode.ABSX),
        [Instruction_OptCode_Table.STA_ABSY]: this.store(Register.REG_ACC, Mode.ABSY),
        [Instruction_OptCode_Table.STX_ZP]: this.store(Register.REG_X, Mode.ZP),
        [Instruction_OptCode_Table.STX_ZPY]: this.store(Register.REG_X, Mode.ZPY),
        [Instruction_OptCode_Table.STX_ABS]: this.store(Register.REG_X, Mode.ABS),
        [Instruction_OptCode_Table.STY_ZP]: this.store(Register.REG_Y, Mode.ZP),
        [Instruction_OptCode_Table.STY_ZPX]: this.store(Register.REG_Y, Mode.ZPX),
        [Instruction_OptCode_Table.STY_ABS]: this.store(Register.REG_Y, Mode.ABS),
        [Instruction_OptCode_Table.TAX]: this.transfer(Register.REG_ACC, Register.REG_X),
        [Instruction_OptCode_Table.TXA]: this.transfer(Register.REG_X, Register.REG_ACC),
        [Instruction_OptCode_Table.TAY]: this.transfer(Register.REG_ACC, Register.REG_Y),
        [Instruction_OptCode_Table.TYA]: this.transfer(Register.REG_Y, Register.REG_ACC),
        [Instruction_OptCode_Table.TXS]: this.transfer(Register.REG_X, Register.REG_SP),
        [Instruction_OptCode_Table.TSX]: this.transfer(Register.REG_SP, Register.REG_X),
        [Instruction_OptCode_Table.ADC_IMD]: this.add(Mode.IMD),
        [Instruction_OptCode_Table.ADC_ZP]: this.add(Mode.ZP),
        [Instruction_OptCode_Table.ADC_ZPX]: this.add(Mode.ZPX),
        [Instruction_OptCode_Table.ADC_ABS]: this.add(Mode.ABS),
        [Instruction_OptCode_Table.ADC_ABSX]: this.add(Mode.ABSX),
        [Instruction_OptCode_Table.ADC_ABSY]: this.add(Mode.ABSY),
        [Instruction_OptCode_Table.AND_IMD]: this.logicalAnd(Mode.IMD),
        [Instruction_OptCode_Table.AND_ZP]: this.logicalAnd(Mode.ZP),
        [Instruction_OptCode_Table.AND_ZPX]: this.logicalAnd(Mode.ZPX),
        [Instruction_OptCode_Table.AND_ABS]: this.logicalAnd(Mode.ABS),
        [Instruction_OptCode_Table.AND_ABSX]: this.logicalAnd(Mode.ABSX),
        [Instruction_OptCode_Table.AND_ABSY]: this.logicalAnd(Mode.ABSY),
        [Instruction_OptCode_Table.EOR_IMD]: this.logicalEor(Mode.IMD),
        [Instruction_OptCode_Table.EOR_ZP]: this.logicalEor(Mode.ZP),
        [Instruction_OptCode_Table.EOR_ZPX]: this.logicalEor(Mode.ZPX),
        [Instruction_OptCode_Table.EOR_ABS]: this.logicalEor(Mode.ZPY),
        [Instruction_OptCode_Table.EOR_ABSX]: this.logicalEor(Mode.ABSX),
        [Instruction_OptCode_Table.EOR_ABSY]: this.logicalEor(Mode.ABSY),
        [Instruction_OptCode_Table.IOR_IMD]: this.logicalIor(Mode.IMD),
        [Instruction_OptCode_Table.IOR_ZP]: this.logicalIor(Mode.ZP),
        [Instruction_OptCode_Table.IOR_ZPX]: this.logicalIor(Mode.ZPX),
        [Instruction_OptCode_Table.IOR_ABS]: this.logicalIor(Mode.ZPY),
        [Instruction_OptCode_Table.IOR_ABSX]: this.logicalIor(Mode.ABSX),
        [Instruction_OptCode_Table.IOR_ABSY]: this.logicalIor(Mode.ABSY),
        [Instruction_OptCode_Table.BIT_ZP]: this.bitTest(Mode.ZP),
        [Instruction_OptCode_Table.BIT_ABS]: this.bitTest(Mode.ABS),
        [Instruction_OptCode_Table.INC_ZP]: this.incMemory(Mode.ZP),
        [Instruction_OptCode_Table.INC_ZPX]: this.incMemory(Mode.ZPX),
        [Instruction_OptCode_Table.INC_ABS]: this.incMemory(Mode.ABS),
        [Instruction_OptCode_Table.INC_ABSX]: this.incMemory(Mode.ABSX),
        [Instruction_OptCode_Table.INX]: this.incRegister(Register.REG_X),
        [Instruction_OptCode_Table.INY]: this.incRegister(Register.REG_Y),
        [Instruction_OptCode_Table.DEC_ZP]: this.decMemory(Mode.ZP),
        [Instruction_OptCode_Table.DEC_ZPX]: this.decMemory(Mode.ZPX),
        [Instruction_OptCode_Table.DEC_ABS]: this.decMemory(Mode.ABS),
        [Instruction_OptCode_Table.DEC_ABSX]: this.decMemory(Mode.ABSX),
        [Instruction_OptCode_Table.DEX]: this.decRegister(Register.REG_X),
        [Instruction_OptCode_Table.DEY]: this.decRegister(Register.REG_Y),
        [Instruction_OptCode_Table.SEC]: this.setFlag(Flag.C),
        [Instruction_OptCode_Table.SED]: this.setFlag(Flag.D),
        [Instruction_OptCode_Table.SEI]: this.setFlag(Flag.I),
        [Instruction_OptCode_Table.CLC]: this.clearFlag(Flag.C),
        [Instruction_OptCode_Table.CLD]: this.clearFlag(Flag.D),
        [Instruction_OptCode_Table.CLI]: this.clearFlag(Flag.I),
        [Instruction_OptCode_Table.ASL_ACC]: this.arithmaticShiftLeft(Mode.ACC),
        [Instruction_OptCode_Table.ASL_ZP]: this.arithmaticShiftLeft(Mode.ZP),
        [Instruction_OptCode_Table.ASL_ZPX]: this.arithmaticShiftLeft(Mode.ZPX),
        [Instruction_OptCode_Table.ASL_ABS]: this.arithmaticShiftLeft(Mode.ABS),
        [Instruction_OptCode_Table.ASL_ABSX]: this.arithmaticShiftLeft(Mode.ABSX),
        [Instruction_OptCode_Table.ROL_ACC]: this.arithmaticShiftLeft(Mode.ACC),
        [Instruction_OptCode_Table.ROL_ZP]: this.arithmaticShiftLeft(Mode.ZP),
        [Instruction_OptCode_Table.ROL_ZPX]: this.arithmaticShiftLeft(Mode.ZPX),
        [Instruction_OptCode_Table.ROL_ABS]: this.arithmaticShiftLeft(Mode.ABS),
        [Instruction_OptCode_Table.ROL_ABSX]: this.arithmaticShiftLeft(Mode.ABSX),
        [Instruction_OptCode_Table.LSR_ACC]: this.arithmaticShiftRight(Mode.ACC),
        [Instruction_OptCode_Table.LSR_ZP]: this.arithmaticShiftRight(Mode.ZP),
        [Instruction_OptCode_Table.LSR_ZPX]: this.arithmaticShiftRight(Mode.ZPX),
        [Instruction_OptCode_Table.LSR_ABS]: this.arithmaticShiftRight(Mode.ABS),
        [Instruction_OptCode_Table.LSR_ABSX]: this.arithmaticShiftRight(Mode.ABSX),
        [Instruction_OptCode_Table.ROR_ACC]: this.arithmaticShiftRight(Mode.ACC),
        [Instruction_OptCode_Table.ROR_ZP]: this.arithmaticShiftRight(Mode.ZP),
        [Instruction_OptCode_Table.ROR_ZPX]: this.arithmaticShiftRight(Mode.ZPX),
        [Instruction_OptCode_Table.ROR_ABS]: this.arithmaticShiftRight(Mode.ABS),
        [Instruction_OptCode_Table.ROR_ABSX]: this.arithmaticShiftRight(Mode.ABSX),
        [Instruction_OptCode_Table.NOP]: this.nop(),
        [Instruction_OptCode_Table.BCC]: this.branch(BranchMode.CC),
        [Instruction_OptCode_Table.BCS]: this.branch(BranchMode.CS),
        [Instruction_OptCode_Table.BEQ]: this.branch(BranchMode.EQ),
        [Instruction_OptCode_Table.BNE]: this.branch(BranchMode.NE),
        [Instruction_OptCode_Table.BPL]: this.branch(BranchMode.PL),
        [Instruction_OptCode_Table.BVC]: this.branch(BranchMode.VC)
    };


    // TODO: Complete constructor and initialization
    constructor() {
        this.memory = new Array<number> (0x10000);
        this.reset();
    }

    public reset(): void {
        this.REG_ACC = 0;
        this.REG_X = 0;
        this.REG_Y = 0;
        // Reset Stack pointer:
        this.REG_SP = 0x0100;
        // Reset Program counter:
        this.REG_PC = 0xFFFC;
        this.resetStatus();
        this.resetMemory();
    }


    private setArithmaticFlag (res: number): void {
        this.status.zero = res === 0 ? 1 : 0;
        this.status.negative = res >> 7 & 0x01;
    }

    private clearFlag(flagname: Flag): () => number {
        return () => {
            this.status[flagname] = 1;
            return 2;
        }
    }

    private setFlag(flagname: Flag): () => number {
        return () => {
            this.status[flagname] = 1;
            return 2;
        }
    }

  
    private branch(branchMode: BranchMode): () => number {
        return () => {
            const data = this.fetch().data;

            let exe_cycles = 2;

            switch (branchMode) {
                case BranchMode.CC:
                    if (!this.status[Flag.C]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                    break;

                case BranchMode.CS:
                    if (this.status[Flag.C]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                break;

                case BranchMode.EQ:
                    if (this.status[Flag.Z]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                    
                break;

                case BranchMode.NE:
                    if (!this.status[Flag.Z]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                break;

                case BranchMode.PL:
                    if (!this.status[Flag.N]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                break;

                case BranchMode.VC:
                    if (!this.status[Flag.O]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                break;

                case BranchMode.VS:
                    if (this.status[Flag.O]) {
                        const new_addr = this.getPC()+data;
                        this.updatePC(new_addr);
                        exe_cycles = new_addr > 0xFF? 4 : 3;
                    }
                break;
                default:
                    break;
            }

            return exe_cycles;
        }
    }

    private arithmaticShiftRight(mode: Mode): () => number {
        return () => {

            let exe_cycles = 2;

            const data = this.fetch().data;

            switch (mode) {
                case Mode.ACC:
                    this.status[Flag.C] = this.REG_ACC & 0x01;
                    this.REG_ACC = this.REG_ACC >> 1;
                    this.setArithmaticFlag(this.REG_ACC);
                    exe_cycles = 2;
                break;
                case Mode.ZP: {
                    
                    const readedZP = this.readByte(data);
                    const shiftedZP = readedZP >> 1;
                    this.writeToMemory(data, shiftedZP);
                    this.status[Flag.C] = readedZP & 0x01;
                    this.setArithmaticFlag(shiftedZP);
                    exe_cycles = 5;
                }
                    
                break;

                case Mode.ZPX: {
                    const zpxAddress = (data + this.REG_X) % 0xFF;
                    const readedZPX = this.readByte(zpxAddress);
                    const shiftedZPX = readedZPX >> 1;
                    this.writeToMemory(zpxAddress, shiftedZPX);
                    this.status[Flag.C] = readedZPX & 0x01;
                    this.setArithmaticFlag(shiftedZPX);
                    exe_cycles = 6;
                }
                    
                break;

                case Mode.ABS: {
                    const most_sig = this.fetch().data;
                    const abs_address = most_sig << 8 | data;
                    const readed_abs = this.readByte(abs_address);
                    const shiftedABS = readed_abs >> 1;
                    this.writeToMemory(abs_address, shiftedABS);
                    this.status[Flag.C] = readed_abs & 0x01;
                    this.setArithmaticFlag(shiftedABS);
                    exe_cycles = 6;
                }
                    
                break;

                case Mode.ABSX: {
                    const most_sig = this.fetch().data;
                    const abs_addressx = (most_sig << 8 | data) + this.REG_X;
                    const readed_absx = this.readByte(abs_addressx);
                    const shiftedABSX = readed_absx >> 1;
                    this.writeToMemory(abs_addressx, shiftedABSX);
                    this.status[Flag.C] = readed_absx & 0x01;
                    this.setArithmaticFlag(shiftedABSX);
                    exe_cycles = 7;
                }
                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }


    private arithmaticShiftLeft(mode: Mode): () => number {
        return () => {
            // const fetched = this.fetch(mode);
            // const data = fetched.data;

            const data = this.fetch().data;

            let exe_cycles = 2;

            switch (mode) {
                case Mode.ACC:
                    this.status[Flag.C] = this.REG_ACC >> 7;
                    this.REG_ACC = this.REG_ACC << 1;
                    this.setArithmaticFlag(this.REG_ACC);
                    exe_cycles = 2;
                break;
                case Mode.ZP: {
                    const readedZP = this.readByte(data);
                    const shiftedZP = readedZP << 1;
                    this.writeToMemory(data, shiftedZP);
                    this.status[Flag.C] = readedZP >> 7;
                    this.setArithmaticFlag(shiftedZP);
                    exe_cycles = 5;
                }
                    
                break;

                case Mode.ZPX: {
                    const readedZPX = this.readByte(data);
                    const shiftedZPX = readedZPX << 1;
                    this.writeToMemory(data, shiftedZPX);
                    this.status[Flag.C] = readedZPX >> 7;
                    this.setArithmaticFlag(shiftedZPX);
                    exe_cycles = 6;
                }
                    
                break;

                case Mode.ABS: {
                    // const most_sig = this.fetch().data;
                    // const abs_address = most_sig << 8 | data;
                    const readed_abs = this.readByte(data);
                    const shiftedABS = readed_abs << 1;
                    this.writeToMemory(data, shiftedABS);
                    this.status[Flag.C] = readed_abs >> 7;
                    this.setArithmaticFlag(shiftedABS);
                    exe_cycles = 6;
                }
                    
                break;

                case Mode.ABSX: {
                    // const most_sig = this.fetch().data;
                    // const abs_addressx = most_sig << 8 | data; + this.REG_X;
                    const readed_absx = this.readByte(data);
                    const shiftedABSX = readed_absx << 1;
                    this.writeToMemory(data, shiftedABSX);
                    this.status[Flag.C] = readed_absx >> 7;
                    this.setArithmaticFlag(shiftedABSX);
                    exe_cycles = 7;
                }
                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }
    private decRegister(reg: Register): () => number {
        return () => {
            this[reg]--;
            this.setArithmaticFlag(this[reg]);
            return 2;
        }
    }


    private incRegister(reg: Register): () => number {
        return () => {
            this[reg]++;
            this.setArithmaticFlag(this[reg]);
            return 2;
        }
    }

    private decMemory(mode: Mode): () => number {
        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;

            this.writeToMemory(data, this.readByte(data) - 1);
            this.setArithmaticFlag(this.readByte(data));

            let exe_cycles = 5;
            switch (mode) {
                case Mode.ZP:
                    exe_cycles = 5;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    exe_cycles = 6;
                break;

                case Mode.ABSX:
                    exe_cycles = 7;

                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }

    private incMemory(mode: Mode): () => number {
        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;

            this.writeToMemory(data, this.readByte(data) + 1);
            this.setArithmaticFlag(this.readByte(data));
            let exe_cycles = 0;

            switch (mode) {
                case Mode.ZP:
                    exe_cycles = 5;

                break;

                case Mode.ZPX:
                case Mode.ABS:
                    exe_cycles = 6;
                break;

                case Mode.ABSX:
                    exe_cycles = 7;
                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }

    private bitTest (mode: Mode): () => number {
        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;
            let exe_cycles = 0;

            let res = this.memory[data] && this.REG_ACC;
            

            switch (mode) {
                case Mode.ZP:
                    exe_cycles = 3;
                break;

                case Mode.ABS:
                    exe_cycles = 4;
                break;

                default:
                    break;
            }

            this.status[Flag.Z] = res == 0? 1 : 0;
            this.status[Flag.O] = res >> 6;
            this.status[Flag.N] = res >> 7;
            return exe_cycles;
        }
    }

    private nop (): () => number {
        return () => 2;

    }

    /**
     * perform exclusive or and consumes cycle
     * @param mode address mode
     */
    private logicalIor (mode: Mode) : () => number {
        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;
            const page_crossed = fetched.page_crossed;


            let exe_cycles = 0;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC || data;
                    exe_cycles = 2;
                break;

                case Mode.ZP:
                    exe_cycles = 3;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    this.REG_ACC = this.REG_ACC || this.memory[data];
                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    this.REG_ACC = this.REG_ACC || this.memory[data];
                    exe_cycles = page_crossed? 5 : 4;
                break;

                default:
                    break;
            }

            this.setArithmaticFlag(this.REG_ACC);

            return exe_cycles;
        }
    }

    /**
     * perform exclusive or and consumes cycle
     * @param mode address mode
     */
    private logicalEor (mode: Mode) : () => number {

        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;
            const page_crossed = fetched.page_crossed;


            let exe_cycles = 0;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC ^ data;
                    exe_cycles = 2;
                break;

                case Mode.ZP:
                    this.REG_ACC = this.REG_ACC ^ this.memory[data];
                    exe_cycles = 3;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    this.REG_ACC = this.REG_ACC ^ this.memory[data];
                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    this.REG_ACC = this.REG_ACC ^ this.memory[data];
                    exe_cycles = page_crossed ? 5 : 4;

                break;

                default:
                    break;
            }

            this.setArithmaticFlag(this.REG_ACC);

            return exe_cycles;
        }
    }

    /**
     * 
     * @param mode address mode for instruction
     * @returns function which perform instruction and consume cycle
     */
    private logicalAnd(mode: Mode) : () => number {
        return () => {
            const fetched = this.fetch(mode);
            const data = fetched.data;
            const page_crossed = fetched.page_crossed;


            let exe_cycles = 0;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC && data;
                    exe_cycles = 2;
                break;

                case Mode.ZP:
                    this.REG_ACC = this.REG_ACC && this.memory[data];
                    exe_cycles = 3;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    this.REG_ACC = this.REG_ACC && this.memory[data];
                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    this.REG_ACC = this.REG_ACC && this.memory[data];
                    exe_cycles = page_crossed? 5 : 4;
                break;

                default:
                    break;
            }

            this.setArithmaticFlag(this.REG_ACC);
            return exe_cycles;
        }
    }

    /**
     * 
     * @param src Register to read value from
     * @param dest Register to transfer value to
     */
    private transfer(src: Register, dest: Register): () => number {

        return () => {
            this[dest] = this[src];
            this.setArithmaticFlag(this[dest]);
            return 2;
        }
    }

    private subtractAndSetFlag(num1: number, num2: number): number {
        const sign1 = num1 >> 7 & 0x01;
        const sign2 = num2 >> 7 & 0x01;
        const res = num1 - num2 - (1 - this.status[Flag.C]);
        const sign_res = res >> 7 & 0x01;

        this.status[Flag.O] = (sign1 && !sign2 && !sign_res) || (!sign1 && sign2 && sign_res)? 1 : 0;
        this.status[Flag.C] = res <= 0xFF || this.status[Flag.O] ? 0 : 1;
        this.status[Flag.N] = sign_res;

        return (res & 0xFF);    
    }

    private addAndSetFlag(num1: number, num2: number): number {
        const sign1 = num1 >> 7 & 0x01;
        const sign2 = num2 >> 7 & 0x01;
        const res = num1 + num2 + this.status[Flag.C];
        const sign_res = res >> 7 & 0x01;

        this.status[Flag.O] = (sign1 && sign2 && !sign_res) || (!sign1 && !sign2 && sign_res)? 1 : 0;
        this.status[Flag.C] = res > 0xFF ? 1 : 0;
        this.status[Flag.N] = sign_res;


        return (res & 0xFF);
    }

    private subtract(mode: Mode): () => number {
        return () => {

            const fetched = this.fetch(mode);
            const data = fetched.data;
            const page_crossed = fetched.page_crossed;


            let exe_cycles = 0;
    
            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.subtractAndSetFlag(data, this.REG_ACC);
                    exe_cycles = 2;
                break;

                case Mode.ZP:
                    this.REG_ACC = this.subtractAndSetFlag(this.memory[data], this.REG_ACC);

                    // Cycle for reading the memory
                    exe_cycles = 3;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    this.REG_ACC = this.subtractAndSetFlag(this.memory[data], this.REG_ACC);
                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    this.REG_ACC = this.subtractAndSetFlag(this.memory[data], this.REG_ACC);
                    exe_cycles = page_crossed? 5 : 4;
                break;

                default:
                break;
            }
            
            return exe_cycles;
        };
    }
    private add(mode: Mode): () => number {
        return () => {

            const fetched = this.fetch(mode);
            const address = fetched.data;
            const page_crossed = fetched.page_crossed;


            let exe_cycles = 0;
    
            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.addAndSetFlag(address, this.REG_ACC);

                    exe_cycles = 2;
                break;

                case Mode.ZP:
                    // Cycle for reading the memory
                    this.REG_ACC = this.addAndSetFlag(this.memory[address], this.REG_ACC);

                    exe_cycles = 3;
                break;

                case Mode.ZPX:
                case Mode.ABS:
                    this.REG_ACC = this.addAndSetFlag(this.memory[address], this.REG_ACC);

                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    this.REG_ACC = this.addAndSetFlag(this.memory[address], this.REG_ACC);
                    exe_cycles = page_crossed? 5 : 4;
                break;

                default:
                break;
            }

            
            return exe_cycles;
        };
    }

    /**
     * 
     * @param cycles cycles needed
     * @param reg register to store
     * @param mode address looking mode
     */
    private store(reg: Register, mode: Mode): () => number {

        return () => {
            const register = reg;
            const fetched = this.fetch(mode);
            const address = fetched.data;
            this.storeByte(address, register);
            let exe_cycles = 0;
    
            switch (mode) {
                case Mode.ZP:
                    exe_cycles = 3;
                break;
                case Mode.ZPX:
                case Mode.ZPY:
                case Mode.ABS:
                    exe_cycles = 4;
                break;

                case Mode.ABSX:
                case Mode.ABSY:
                    exe_cycles = 5;

                break;
                default:
                break;
            }
            return exe_cycles;
        };
    }
    private load(reg: Register, mode: Mode): () => number {
        
        return () => {
            const register = reg;
            // const data = this.fetch();

            const fetched = this.fetch(mode);

            const address = fetched.data;
            const page_crossed = fetched.page_crossed;
            const data = this.memory[address];

    
            let exe_cycles = 0;
    
            switch (mode) {
                case Mode.IMD:
                    this[register] = fetched.data;
                    exe_cycles = 2;
                break;
                case Mode.ZP:
                    this[register] = data;
                    exe_cycles = 3;
                break;
    
                // The emulation skip one cycle for calculating the sum, now it's 3 cycles
                // for ZPX load, and should be the same for ZPY mode
                case Mode.ZPX:
                case Mode.ZPY:
                    this[register] = data;
                    exe_cycles = 4;
                break;
    
                // Fetch 2-bytes (16 bits) address from pc first
                // Compose them up to a 16 bits address and read the value of memory at the address
                // 4 cycles in total
                case Mode.ABS:
                case Mode.ABSX:
                case Mode.ABSY:
                    this[register] = data;
                    exe_cycles = page_crossed ? 5 : 4;
                break;

                default:
                break;
            }
    
            this.setArithmaticFlag(this[reg]);
            return exe_cycles;
        };
    }


    private resetMemory(): void {
        this.memory.fill(0);
    }

    private resetStatus(): void {
        Object.assign(this.status, {
            carry: 0,
            zero: 0,
            inter_dis: 0,
            decimal: 0,
            break: 0,
            overflow: 0,
            negative: 0
        });
    }



    public execute(cycles: number): void {
        let exe_cycles = cycles;
        while (exe_cycles > 0) {
            const instruction = this.fetch().data;
            exe_cycles--;

            if (!(instruction in this.opt_table)) {
                throw new Error("Not correct optcode!!!");
            }
            // When calling a function from a object entry, this needs to rebind to class
            // Otherwise this will be the object itself (i.e. opt_table)
            const method = this.opt_table[instruction].bind(this);
            exe_cycles -= method();
        }
    }

    public getRegister(register: Register): number {
        return this[register];
    }



    public getStatus(flag: string): number {
        return this.status[flag];
    }

    private updatePC(value: number): void {
        this.REG_PC = value;
    }

    private fetch(mode?: Mode) {

        if (!mode) {
            const data = this.memory[this.REG_PC];
            this.REG_PC++;
            return {
                "data": data,
                "page_crossed": false
            };
        }
        

        switch (+mode) {
            case Mode.ACC: {
                return {
                    "data": this.REG_ACC,
                    "page_crossed": false
                }
            }
            case Mode.IMD :{
                const data = this.memory[this.REG_PC];
                this.REG_PC++;
                return {
                    "data": data,
                    "page_crossed": false
                };
            }
                
            case Mode.ZP: {
                const zp_address = this.memory[this.REG_PC];
                this.REG_PC++;
                return {
                    "data":  zp_address,
                    "page_crossed": false
                }; 
            }

            case Mode.ZPX: {
                const zp_address = this.memory[this.REG_PC] + this.REG_X;
                this.REG_PC++;
                return {
                    "data":  zp_address & 0xFF,
                    "page_crossed": false
                };
            }

            case Mode.ZPY: {
                const address = this.memory[this.REG_PC] + this.REG_Y;
                this.REG_PC++;
                return {
                    "data":  address & 0xFF,
                    "page_crossed": false
                };
            }

            case Mode.ABS: {
                const abs_address = this.memory[this.REG_PC+1] << 8 | this.memory[this.REG_PC];
                this.REG_PC += 2;
                return {
                    "data":  abs_address,
                    "page_crossed": abs_address > 0xFF? true : false
                };
            }

            case Mode.ABSX: {
                const abs_address = (this.memory[this.REG_PC+1] << 8 | this.memory[this.REG_PC]) + this.REG_X;
                this.REG_PC += 2;
                return {
                    "data":  abs_address,
                    "page_crossed": abs_address > 0xFF? true : false
                };
            }

            case Mode.ABSY: {
                const abs_address = (this.memory[this.REG_PC+1] << 8 | this.memory[this.REG_PC]) + this.REG_Y;
                this.REG_PC += 2;
                return {
                    "data":  abs_address,
                    "page_crossed": abs_address > 0xFF? true : false
                };
            }

            
        
            default:
                break;
        }
    }
    // private fetch() {
    //     return this.fetch(Mode.IMD);
    // }

    

    private readByte(address: number) {
        const data = this.memory[address];
        // this.REG_PC++;
        return data;
    }

    /**
     * 
     * @param address address to store
     * @param cycles current remaining cycle
     * @param register register which stores the value to write to memory
     */
    private storeByte(address: number, register: Register) {
        this.writeToMemory(address, this[register])
    }

    /**
     * 
     * @param address address to store to
     * @param cycles cycles remaining
     * @param value value to write into memory
     */
    private writeToMemory(address: number, value: number) {
        this.memory[address] = value;
    }


    public log(): void {
        console.log("Printing all the status: ");
        Object.entries(this.status).map((entry) => {
            console.log(`${entry[0]}: ${entry[1]} \n`);
        });
        Object.entries(this).map((entry) => {
            if (entry[0] === "memory")
                return;
            console.log(`${entry[0]}: ${entry[1]} \n`);
        });
    }

    public getMemory(address: number): number {
        return this.memory[address];
    }

    public getPC(): number {
        return this.REG_PC;
    }

    // Set memory at specific address for purely testing
    public setMemory(address: number, value: number) {
        this.memory[address] = value;
    } 

    // Set specific register to a value for purely testing
    public setRegister(register: Register, value: number): void {
        this[register] = value;
    }

}


export {
    CPU
}