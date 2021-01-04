


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
    LDY_ZP = 0xA4
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
        [Instruction_OptCode_Table.LDA_IMD] : this.loadAccImd,
        [Instruction_OptCode_Table.LDX_IMD]: this.loadXImd,
        [Instruction_OptCode_Table.LDY_IMD]: this.loadYImd,
        [Instruction_OptCode_Table.LDA_ZP]: this.loadAccZP,
        [Instruction_OptCode_Table.LDX_ZP]: this.loadXZP,
        [Instruction_OptCode_Table.LDY_ZP]: this.loadYZP,
        0x00: () => {throw new Error("Not correct optcode!!!");}
    };


    // TODO: Complete constructor and initialization
    constructor() {
        this.memory = new Array<number> (0x10000);
        this.reset();
    }

    private reset(): void {
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
        const exe_cycles = value.cycles;

        switch (mode) {
            case Mode.IMD:
                this[register] = data;
                break;
            case Mode.ZP:
                this[register] = this.memory[data];
                break;
            default:
                break;
        }

        this.setLoadFlag(reg);
        this.REG_PC++;

        return exe_cycles - 1;
    }
    private loadImd(cycles: number, reg: Register): number {
        const value = this.fetch(cycles);
        const data = value.data;
        const register = reg;
        const exe_cycles = value.cycles;

        this[register] = data;
        
        this.setLoadFlag(reg);

        this.REG_PC++;

        return exe_cycles - 1;
    }

    private loadZeroPage(cycles: number, reg: Register): number {
        const value = this.fetch(cycles);
        const data = value.data;
        const register = reg;
        const exe_cycles = value.cycles;

        this[register] = this.memory[data];
        
        this.setLoadFlag(reg);

        this.REG_PC++;

        return exe_cycles - 1;
    }

    private loadAccImd(cycles: number): number {
        // return this.loadImd(cycles, Register.REG_ACC);
        return this.load(cycles, Register.REG_ACC, Mode.IMD);
    }

    
    private loadXImd(cycles: number): number {
        return this.loadImd(cycles, Register.REG_X);
    }

    private loadYImd(cycles: number): number {
        return this.loadImd(cycles, Register.REG_Y);
    }

    private loadAccZP(cycles: number): number {
        return this.loadZeroPage(cycles, Register.REG_ACC);
    }
    
    private loadXZP(cycles: number): number {
        return this.loadZeroPage(cycles, Register.REG_X);
    }

    private loadYZP(cycles: number): number {
        return this.loadZeroPage(cycles, Register.REG_Y);
    }

    private resetMemory(): void {
        this.memory.fill(0);
    }

    private resetStatus(): void {
        // this.status["carry"] = 0;
        // this.status["zero"] = 0;
        // this.status["inter_dis"] = 0;
        // this.status["decimal"] = 0;
        // this.status["break"] = 0;
        // this.status["overflow"] = 0;
        // this.status["negative"] = 0;
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

    private fetch(cycles: number) {
        const data = this.memory[this.REG_PC];
        this.REG_PC++;
        return  {
            "data": data,
            "cycles": cycles-1
        };
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


}


export {
    CPU,
    Instruction_OptCode_Table
}