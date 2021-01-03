


enum Register {
    REG_X = "REG_X",
    REG_Y = "REG_Y",
    REG_SP = "REG_SP",
    REG_ACC = "REG_ACC",
    REG_PC = "REG_PC"
}


/**
 * A chip-8 CPU emulator
 */
class CPU {


    private status: { [flag: string]: number};

    private REG_X: number;
    private REG_Y: number;
    private REG_SP: number;
    private REG_ACC: number;
    private registers: number[];

    private REG_PC: number;
    private REG_PC_NEW: number;

    private memory: number[];

    private opt_table: { [optcode: number]: (cycle: number) => number};

    private opt_code: number;

    // TODO: Complete constructor and initialization
    constructor() {
        this.memory = new Array<number> (0x10000);
        this.reset();
        this.opt_table = {
            0xA9: this.loadAcc,
            0xA2: this.loadX
        };
    }

    private reset(): void {
        this.REG_ACC = 0;
        this.REG_X = 0;
        this.REG_Y = 0;
        // Reset Stack pointer:
        this.REG_SP = 0x0100;
        // Reset Program counter:
        this.REG_PC = 0xFFFC;
        this.REG_PC_NEW = 0xFFFC;
        this.resetStatus();
        this.resetMemory();
    }


    private loadAcc(cycles: number): number {
        return this.load(cycles, Register.REG_ACC);
    }

    
    private loadX(cycles: number): number {
        return this.load(cycles, Register.REG_X);
    }

    private load(cycles: number, reg: Register) {
        const value = this.fetch(cycles);
        const data = value.data;
        const register = reg;
        const exe_cycles = value.cycles;

        this[register] = data;
        this.status.zero = this[register] === 0 ? 1 : 0;
        this.status.negative = this[register] >> 7 & 0x01;

        this.REG_PC++;

        return exe_cycles - 1;
    }

    private resetMemory(): void {
        this.memory.fill(0);
    }

    private resetStatus(): void {
        this.status["carry"] = 0;
        this.status["zero"] = 0;
        this.status["inter_dis"] = 0;
        this.status["decimal"] = 0;
        this.status["break"] = 0;
        this.status["overflow"] = 0;
        this.status["negative"] = 0;
    }



    private execute(cycles: number): void {
        let exe_cycles = cycles;
        while (exe_cycles > 0) {
            const fetched = this.fetch(exe_cycles);
            const instruction = fetched.data;
            exe_cycles = fetched.cycles;
            exe_cycles = this.opt_table[instruction](exe_cycles);
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






}