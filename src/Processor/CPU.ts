


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
    LDX_ZPY = 0xB6
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
    // private REG_PC_NEW: number;

    private memory: number[];

    private opt_table: { [optcode: number]: (cycle: number) => number} = {
        [Instruction_OptCode_Table.LDA_IMD] : this.loadImd(Register.REG_ACC),
        [Instruction_OptCode_Table.LDX_IMD]: this.loadImd(Register.REG_X),
        [Instruction_OptCode_Table.LDY_IMD]: this.loadImd(Register.REG_Y),
        [Instruction_OptCode_Table.LDA_ZP]: this.loadZP(Register.REG_ACC),
        [Instruction_OptCode_Table.LDX_ZP]: this.loadZP(Register.REG_X),
        [Instruction_OptCode_Table.LDY_ZP]: this.loadZP(Register.REG_Y),
        [Instruction_OptCode_Table.LDA_ZPX]: this.loadZPX(Register.REG_ACC),
        [Instruction_OptCode_Table.LDY_ZPX]: this.loadZPX(Register.REG_Y),
        [Instruction_OptCode_Table.LDX_ZPY]: this.loadZPY(Register.REG_X),
        0x00: () => {throw new Error("Not correct optcode!!!");}
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
        // this.REG_PC_NEW = 0xFFFC;
        this.resetStatus();
        this.resetMemory();
    }


    private setLoadFlag (register: Register): void {
        this.status.zero = this[register] === 0 ? 1 : 0;
        this.status.negative = this[register] >> 7 & 0x01;
    }



    private load(cycles: number, reg: Register, mode: Mode): number {
        const value = this.fetch(cycles);
        const data = value.data;
        const register = reg;
        let exe_cycles = value.cycles;

        switch (mode) {
            case Mode.IMD:
                this[register] = data;
            break;
            case Mode.ZP:
                const zp_value = this.readZP(data, exe_cycles);
                this[register] = zp_value.data;
                exe_cycles = zp_value.cycles;
            break;

            // The emulation skip one cycle for calculating the sum, now it's 3 cycles
            // for ZPX load, and should be the same for ZPY mode
            case Mode.ZPX:
                const zpx_value = this.readZP((data + this.REG_X) % 0xFF, exe_cycles);
                this[register] = zpx_value.data;
                exe_cycles = zpx_value.cycles;
            break;
            case Mode.ZPY:
                const zpy_value = this.readZP((data + this.REG_Y) % 0xFF, exe_cycles);
                this[register] = zpy_value.data;
                exe_cycles = zpy_value.cycles;
            break;
            default:
                break;
        }

        this.setLoadFlag(reg);
        return exe_cycles - 1;
    }

    private loadZP(register: Register): (cycles: number) => number {
        const func = (cycles: number) => { return this.load(cycles, register, Mode.ZP)}
        return func.bind(this);
    }

    private loadImd(register: Register): (cycles: number) => number {
        const func = (cycles: number) => { return this.load(cycles, register, Mode.IMD)}
        return func.bind(this);
    }

    private loadZPX(register: Register): (cycles: number) => number {
        const func = (cycles: number) => { return this.load(cycles, register, Mode.ZPX)}
        return func.bind(this);
    }

    private loadZPY(register: Register): (cycles: number) => number {
        const func = (cycles: number) => { return this.load(cycles, register, Mode.ZPY)}
        return func.bind(this);
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

    private readZP(address: number, cycles: number) {
        const data = this.memory[address];
        this.REG_PC++;
        return {
            "data": data,
            "cycles": cycles - 1
        }
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