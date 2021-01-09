


enum Register {
    REG_X = "REG_X",
    REG_Y = "REG_Y",
    REG_SP = "REG_SP",
    REG_ACC = "REG_ACC",
    REG_PC = "REG_PC"
}

enum Instruction_OptCode_Table {
    LDA_IMD = 0xA9,
    LDX_IMD = 0xA2,
    LDY_IMD = 0xA0,
    LDA_ZP = 0xA5,
    LDX_ZP = 0xA6,
    LDY_ZP = 0xA4,
    LDA_ZPX = 0XB5,
    LDY_ZPX = 0xB4,
    LDX_ZPY = 0xB6,
    LDA_ABS = 0xAD,
    LDA_ABSX = 0xBD,
    LDA_ABSY = 0xB9,
    LDX_ABS = 0xAE,
    LDX_ABSY = 0xBE,
    LDY_ABS = 0xAC,
    LDY_ABSX = 0xBC,
    STA_ZP = 0x85,
    STA_ZPX = 0x95,
    STA_ABS = 0x8D,
    STA_ABSX = 0x9D,
    STA_ABSY = 0x99,
    TAX = 0xAA,
    TAY = 0xA8,
    TSX = 0xBA,
    TXA = 0x8A,
    TXS = 0x9A,
    TYA = 0x98,
    ADC_IMD = 0x69,
    ADC_ZP = 0x65,
    ADC_ZPX = 0x75,
    ADC_ABS = 0x6D,
    ADC_ABSX = 0x7D,
    ADC_ABSY = 0x79
}


enum Mode {
    IMD,
    ZP,
    ZPX,
    ZPY,
    ABS,
    ABSX,
    ABSY,
    IDX,
    IDY
}
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


    private setLoadFlag (register: Register): void {
        this.status.zero = this[register] === 0 ? 1 : 0;
        this.status.negative = this[register] >> 7 & 0x01;
    }


    /**
     * 
     * @param src Register to read value from
     * @param dest Register to transfer value to
     */
    private transfer(src: Register, dest: Register): (cycles: number) => number {

        return (cycles: number) => {
            this[dest] = this[src];
            this.setLoadFlag(dest);
            return cycles - 1;
        }
    }


    private addAndSetFlag(num1: number, num2: number): number {
        const sign1 = num1 >> 7 & 0x01;
        const sign2 = num2 >> 7 & 0x01;
        const res = num1 + num2 + this.status["carry"];
        const sign_res = res >> 7 & 0x01;

        this.status["overflow"] = (sign1 && sign2 && !sign_res) || (!sign1 && !sign2 && sign_res)? 1 : 0;
        this.status["carry"] = res > 0xFF ? 1 : 0;
        this.status["negative"] = sign_res;


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
                    const readed = this.getMemory(data, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readed.data, this.REG_ACC);
                    // Cycle for reading the memory
                    exe_cycles = readed.cycle;
                break;

                case Mode.ZPX:
                    const readedx = this.getMemory((data + this.REG_X) && 0xFF, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readedx.data, this.REG_ACC);
                    exe_cycles = readedx.cycle;
                break;

                case Mode.ZPY:
                    const readedy = this.getMemory((data + this.REG_Y) && 0xFF, exe_cycles);
                    this.REG_ACC = this.addAndSetFlag(readedy.data, this.REG_ACC);
                    exe_cycles = readedx.cycle;
                break;

                case Mode.ABS:
                    const least_sig = this.fetch(exe_cycles);
                    const abs_address = data << 8 | least_sig.data;
                    const readed_abs = this.getMemory(abs_address, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_abs.data, this.REG_ACC);
                    exe_cycles = readed_abs.cycle;
                break;
                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = data << 8 | least_sigx.data;
                    const readed_absx = this.getMemory((abs_addressx + this.REG_X) && 0xFFFF, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_absx.data, this.REG_ACC);
                    exe_cycles = readed_absx.cycle;
                break;

                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = data << 8 | least_sigy.data;
                    const readed_absy = this.getMemory((abs_addressy + this.REG_X) && 0xFFFF, least_sig.cycles);
                    this.REG_ACC = this.addAndSetFlag(readed_absy.data, this.REG_ACC);
                    exe_cycles = readed_absy.cycle;
                break;
                default:
                break;
            }

            
            return exe_cycles;
        };
    }



    private getMemory(address: number, cycles: number) {
        return {
            "data": this.memory[address],
            "cycle": cycles - 1
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
                    const abs_address = data | least_sig.data;
                    exe_cycles = this.storeByte(abs_address, least_sig.cycles, register);
                break;
                case Mode.ABSX:
                    const least_sigx = this.fetch(exe_cycles);
                    const abs_addressx = data | least_sigx.data;
                    exe_cycles = this.storeByte(abs_addressx, least_sigx.cycles, register);
                break;
                case Mode.ABSY:
                    const least_sigy = this.fetch(exe_cycles);
                    const abs_addressy = data | least_sigy.data;
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
    
            this.setLoadFlag(reg);
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
        this.REG_PC++;
        return {
            "data": data,
            "cycles": cycles - 1
        }
    }

    private storeByte(address: number, cycles: number, register: Register) {
        this.memory[address] = this[register];
        this.REG_PC++;
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
    CPU,
    Instruction_OptCode_Table,
    Register
}