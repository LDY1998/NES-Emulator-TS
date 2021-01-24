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

    private clearFlag(flagname: Flag): (cycles: number) => number {
        return (cycles: number) => {
            this.status[flagname] = 1;
            return cycles - 1;
        }
    }

    private setFlag(flagname: Flag): (cycles: number) => number {
        return (cycles: number) => {
            this.status[flagname] = 1;
            return cycles - 1;
        }
    }

  
    private branch(branchMode: BranchMode): (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (branchMode) {
                case BranchMode.CC:
                    if (!this.status[Flag.C]) {
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                    }
                    break;

                case BranchMode.CS:
                    if (this.status[Flag.C]) {
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                    }
                break;

                case BranchMode.EQ:
                    if (this.status[Flag.Z])
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                break;

                case BranchMode.NE:
                    if (!this.status[Flag.Z])
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                break;

                case BranchMode.PL:
                    if (!this.status[Flag.N])
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                break;

                case BranchMode.VC:
                    if (!this.status[Flag.O])
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                break;

                case BranchMode.VS:
                    if (this.status[Flag.O])
                        exe_cycles = this.updatePC(exe_cycles, this.getPC()+data);
                break;
                default:
                    break;
            }

            return exe_cycles;
        }
    }


    private arithmaticShiftLeft(mode: Mode): (cycles: number) => number {
        return (cycles: number) => {

            let exe_cycles = cycles;

            switch (mode) {
                case Mode.ACC:
                    this.status[Flag.C] = this.REG_ACC >> 7;
                    this.REG_ACC = this.REG_ACC << 1;
                    this.setArithmaticFlag(this.REG_ACC);
                    exe_cycles = exe_cycles - 1;
                break;
                case Mode.ZP: {
                    const value = this.fetch(cycles);
                    const data = value.data;
                    exe_cycles = value.cycles;
                    const readedZP = this.readByte(data, exe_cycles);
                    const shiftedZP = readedZP.data << 1;
                    exe_cycles = this.writeToMemory(data, readedZP.cycles, shiftedZP);
                    this.status[Flag.C] = readedZP.data >> 7;
                    this.setArithmaticFlag(shiftedZP);

                }
                    
                break;

                case Mode.ZPX: {
                    const value = this.fetch(cycles);
                    const data = value.data;
                    exe_cycles = value.cycles;
                    const zpxAddress = (data + this.REG_X) % 0xFF;
                    const readedZPX = this.readByte(zpxAddress, exe_cycles);
                    const shiftedZPX = readedZPX.data << 1;
                    exe_cycles = this.writeToMemory(readedZPX.data, readedZPX.cycles, shiftedZPX);
                    this.status[Flag.C] = readedZPX.data >> 7;
                    this.setArithmaticFlag(shiftedZPX);
                }
                    
                break;

                case Mode.ABS: {
                    const value = this.fetch(cycles);
                    const data = value.data;
                    exe_cycles = value.cycles;
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    const shiftedABS = readed_abs.data << 1;
                    exe_cycles = this.writeToMemory(abs_address, readed_abs.cycles, shiftedABS);
                    this.status[Flag.C] = readed_abs.data >> 7;
                    this.setArithmaticFlag(shiftedABS);
                }
                    
                break;

                case Mode.ABSX: {
                    const value = this.fetch(cycles);
                    const data = value.data;
                    exe_cycles = value.cycles;
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    const shiftedABSX = readed_absx.data << 1;
                    exe_cycles = this.writeToMemory(abs_addressx, readed_absx.cycles, shiftedABSX);
                    this.status[Flag.C] = readed_absx.data >> 7;
                    this.setArithmaticFlag(shiftedABSX);
                }
                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }
    private decRegister(reg: Register): (cycles: number) => number {
        return (cycles: number) => {
            this[reg]--;
            this.setArithmaticFlag(this[reg]);
            return cycles - 1;
        }
    }


    private incRegister(reg: Register): (cycles: number) => number {
        return (cycles: number) => {
            this[reg]++;
            this.setArithmaticFlag(this[reg]);
            return cycles - 1;
        }
    }

    private decMemory(mode: Mode): (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (mode) {
                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    exe_cycles = this.writeToMemory(data, readedZP.cycles, readedZP.data-1);
                    this.setArithmaticFlag(readedZP.data-1);
                break;

                case Mode.ZPX:
                    const zpxAddress = (data + this.REG_X) % 0xFF;
                    const readedZPX = this.readByte(zpxAddress, exe_cycles);
                    exe_cycles = this.writeToMemory(readedZPX.data, readedZPX.cycles, readedZPX.data-1);
                    this.setArithmaticFlag(readedZPX.data-1);
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    exe_cycles = this.writeToMemory(abs_address, readed_abs.cycles, readed_abs.data-1);
                    this.setArithmaticFlag(readed_abs.data-1);
                break;

                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readed_absx.data;
                    exe_cycles = this.writeToMemory(abs_addressx, readed_absx.cycles, readed_absx.data-1);
                    this.setArithmaticFlag(readed_absx.data-1);

                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }

    private incMemory(mode: Mode): (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (mode) {
                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    exe_cycles = this.writeToMemory(data, readedZP.cycles, readedZP.data+1);
                    this.setArithmaticFlag(readedZP.data+1);
                break;

                case Mode.ZPX:
                    const zpxAddress = (data + this.REG_X) % 0xFF;
                    const readedZPX = this.readByte(zpxAddress, exe_cycles);
                    exe_cycles = this.writeToMemory(readedZPX.data, readedZPX.cycles, readedZPX.data+1);
                    this.setArithmaticFlag(readedZPX.data+1);
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    exe_cycles = this.writeToMemory(abs_address, readed_abs.cycles, readed_abs.data+1);
                    this.setArithmaticFlag(readed_abs.data+1);
                break;

                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readed_absx.data;
                    exe_cycles = this.writeToMemory(abs_addressx, readed_absx.cycles, readed_absx.data+1);
                    this.setArithmaticFlag(readed_absx.data+1);

                break;

                default:
                    break;
            }


            return exe_cycles;
        }
    }

    private bitTest (mode: Mode): (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            let res = 0;

            switch (mode) {
                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    res = this.REG_ACC && readedZP.data;
                    exe_cycles = readedZP.cycles;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    res = this.REG_ACC && readed_abs.data;
                    exe_cycles = readed_abs.cycles;
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

    private nop (): (cycles: number) => number {
        return (cycles: number) => cycles - 1;

    }

    /**
     * perform exclusive or and consumes cycle
     * @param mode address mode
     */
    private logicalIor (mode: Mode) : (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC || data;
                    exe_cycles - 1;
                break;

                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readedZP.data;
                    exe_cycles = readedZP.cycles;
                break;

                case Mode.ZPX:
                    const readedZPX = this.readByte((data + this.REG_X) % 0xFF, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readedZPX.data;
                    exe_cycles = readedZPX.cycles;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readed_abs.data;
                    exe_cycles = readed_abs.cycles;
                break;

                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readed_absx.data;
                    exe_cycles = readed_absx.cycles;
                break;

                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = (data << 8 | least_sigy.data) + this.REG_Y;
                    exe_cycles = least_sigy.cycles;
                    const readed_absy = this.readByte(abs_addressy, exe_cycles);
                    this.REG_ACC = this.REG_ACC || readed_absy.data;
                    exe_cycles = readed_absy.cycles;
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
    private logicalEor (mode: Mode) : (cycles: number) => number {

        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC ^ data;
                    exe_cycles - 1;
                break;

                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    this.REG_ACC = this.REG_ACC ^ readedZP.data;
                    exe_cycles = readedZP.cycles;
                break;

                case Mode.ZPX:
                    const readedZPX = this.readByte((data + this.REG_X) % 0xFF, exe_cycles);
                    this.REG_ACC = this.REG_ACC ^ readedZPX.data;
                    exe_cycles = readedZPX.cycles;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    this.REG_ACC = this.REG_ACC ^ readed_abs.data;
                    exe_cycles = readed_abs.cycles;
                break;

                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    this.REG_ACC = this.REG_ACC ^ readed_absx.data;
                    exe_cycles = readed_absx.cycles;
                break;

                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = (data << 8 | least_sigy.data) + this.REG_Y;
                    exe_cycles = least_sigy.cycles;
                    const readed_absy = this.readByte(abs_addressy, exe_cycles);
                    this.REG_ACC = this.REG_ACC ^ readed_absy.data;
                    exe_cycles = readed_absy.cycles;
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
    private logicalAnd(mode: Mode) : (cycles: number) => number {
        return (cycles: number) => {
            const value = this.fetch(cycles);

            const data = value.data;
            let exe_cycles = value.cycles;

            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.REG_ACC && data;
                    exe_cycles - 1;
                break;

                case Mode.ZP:
                    const readedZP = this.readByte(data, exe_cycles);
                    this.REG_ACC = this.REG_ACC && readedZP.data;
                    exe_cycles = readedZP.cycles;
                break;

                case Mode.ZPX:
                    const readedZPX = this.readByte((data + this.REG_X) % 0xFF, exe_cycles);
                    this.REG_ACC = this.REG_ACC && readedZPX.data;
                    exe_cycles = readedZPX.cycles;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = least_sig.cycles;
                    const readed_abs = this.readByte(abs_address, exe_cycles);
                    this.REG_ACC = this.REG_ACC && readed_abs.data;
                    exe_cycles = readed_abs.cycles;
                break;

                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = (data << 8 | least_sigx.data) + this.REG_X;
                    exe_cycles = least_sigx.cycles;
                    const readed_absx = this.readByte(abs_addressx, exe_cycles);
                    this.REG_ACC = this.REG_ACC && readed_absx.data;
                    exe_cycles = readed_absx.cycles;
                break;

                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = (data << 8 | least_sigy.data) + this.REG_Y;
                    exe_cycles = least_sigy.cycles;
                    const readed_absy = this.readByte(abs_addressy, exe_cycles);
                    this.REG_ACC = this.REG_ACC && readed_absy.data;
                    exe_cycles = readed_absy.cycles;
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
    private transfer(src: Register, dest: Register): (cycles: number) => number {

        return (cycles: number) => {
            this[dest] = this[src];
            this.setArithmaticFlag(this[dest]);
            return cycles - 1;
        }
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

    private add(mode: Mode): (cycles: number) => number {
        return (cycles: number) => {

            const value = this.fetch(cycles);
            const data = value.data;

            let exe_cycles = value.cycles;
    
            switch (mode) {
                case Mode.IMD:
                    this.REG_ACC = this.addAndSetFlag(data, this.REG_ACC);
                break;

                case Mode.ZP:
                    const readed = this.readByte(data, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readed.data, this.REG_ACC);
                    // Cycle for reading the memory
                    exe_cycles = readed.cycles;
                break;

                case Mode.ZPX:
                    const readedx = this.readByte((data + this.REG_X) && 0xFF, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readedx.data, this.REG_ACC);
                    exe_cycles = readedx.cycles;
                break;

                case Mode.ZPY:
                    const readedy = this.readByte((data + this.REG_Y) && 0xFF, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readedy.data, this.REG_ACC);
                    exe_cycles = readedx.cycles;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    const readed_abs = this.readByte(abs_address, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_abs.data, this.REG_ACC);
                    exe_cycles = readed_abs.cycles;
                break;
                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = data << 8 | least_sigx.data;
                    const readed_absx = this.readByte((abs_addressx + this.REG_X) && 0xFFFF, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_absx.data, this.REG_ACC);
                    exe_cycles = readed_absx.cycles;
                break;

                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = data << 8 | least_sigy.data;
                    const readed_absy = this.readByte((abs_addressy + this.REG_X) && 0xFFFF, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_absy.data, this.REG_ACC);
                    exe_cycles = readed_absy.cycles;
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
    private store(reg: Register, mode: Mode): (cycles: number) => number {

        return (cycles: number) => {
            const register = reg;
            const value = this.fetch(cycles);
            const data = value.data;

            let exe_cycles = value.cycles;
    
            switch (mode) {
                case Mode.ZP:
                    exe_cycles = this.storeByte(data, exe_cycles, register);
                break;
                case Mode.ZPX:
                    exe_cycles = this.storeByte((data + this.REG_X) % 0xFF, exe_cycles, register);
                break;
                case Mode.ZPY:
                    exe_cycles = this.storeByte((data + this.REG_Y) % 0xFF, exe_cycles, register);
                break;
                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    exe_cycles = this.storeByte(abs_address, least_sig.cycles, register);
                break;
                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = data << 8 | least_sigx.data;
                    exe_cycles = this.storeByte(abs_addressx, least_sigx.cycles, register);
                break;
                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = data << 8 | least_sigy.data;
                    exe_cycles = this.storeByte(abs_addressy, least_sigy.cycles, register);
                break;
                default:
                break;
            }
            return exe_cycles;
        };
    }
    private load(reg: Register, mode: Mode): (cycles:number) => number {
        
        return (cycles: number) => {
            const register = reg;
            const value = this.fetch(cycles);
            const data = value.data;
    
            let exe_cycles = value.cycles;
    
    
            switch (mode) {
                case Mode.IMD:
                    this[register] = data;
                    exe_cycles = value.cycles;
                break;
                case Mode.ZP:
                    const zp_value = this.readByte(data % 0x00FF, exe_cycles);
                    this[register] = zp_value.data;
                    exe_cycles = zp_value.cycles;
                break;
    
                // The emulation skip one cycle for calculating the sum, now it's 3 cycles
                // for ZPX load, and should be the same for ZPY mode
                case Mode.ZPX:
                    const zpx_value = this.readByte((data + this.REG_X) % 0xFF, exe_cycles);
                    this[register] = zpx_value.data;
                    exe_cycles = zpx_value.cycles;
                break;
                case Mode.ZPY:
                    const zpy_value = this.readByte((data + this.REG_Y) % 0xFF, exe_cycles);
                    this[register] = zpy_value.data;
                    exe_cycles = zpy_value.cycles;
                break;
    
                // Fetch 2-bytes (16 bits) address from pc first
                // Compose them up to a 16 bits address and read the value of memory at the address
                // 4 cycles in total
                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    const abs_value = this.readByte(abs_address, least_sig.cycles);
                    this[register] = abs_value.data;
                    exe_cycles = abs_value.cycles;
                break;
                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = data << 8 | least_sigx.data;
                    const abs_valuex = this.readByte(abs_addressx + this.REG_X, least_sigx.cycles);
                    this[register] = abs_valuex.data;
                    exe_cycles = abs_valuex.cycles;
                break;
    
                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = data << 8 | least_sigy.data;
                    const abs_valuey = this.readByte(abs_addressy + this.REG_Y, least_sigy.cycles);
                    this[register] = abs_valuey.data;
                    exe_cycles = abs_valuey.cycles;
                break;
                default:
                break;
            }
    
            this.setArithmaticFlag(this[reg]);
            return exe_cycles - 1;
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
            const fetched = this.fetch(exe_cycles);
            const instruction = fetched.data;
            exe_cycles = fetched.cycles;

            if (!(instruction in this.opt_table)) {
                throw new Error("Not correct optcode!!!");
            }
            // When calling a function from a object entry, this needs to rebind to class
            // Otherwise this will be the object itself (i.e. opt_table)
            const method = this.opt_table[instruction].bind(this);
            exe_cycles = method(exe_cycles);
        }
    }

    public getRegister(register: Register): number {
        return this[register];
    }



    public getStatus(flag: string): number {
        return this.status[flag];
    }

    private updatePC(cycles: number, value: number): number {
        this.REG_PC = value;
        return cycles - 1;
    }

    private fetch(cycles: number) {
        const data = this.memory[this.REG_PC];
        this.REG_PC++;
        return  {
            "data": data,
            "cycles": cycles-1
        };
    }

    private readByte(address: number, cycles: number) {
        const data = this.memory[address];
        // this.REG_PC++;
        return {
            "data": data,
            "cycles": cycles - 1
        }
    }

    /**
     * 
     * @param address address to store
     * @param cycles current remaining cycle
     * @param register register which stores the value to write to memory
     */
    private storeByte(address: number, cycles: number, register: Register) {
        return this.writeToMemory(address, cycles, this[register])
    }

    /**
     * 
     * @param address address to store to
     * @param cycles cycles remaining
     * @param value value to write into memory
     */
    private writeToMemory(address: number, cycles: number, value: number) {
        this.memory[address] = value;
        return cycles - 1;
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