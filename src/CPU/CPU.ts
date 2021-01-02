





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

    private opt_table: { [optcode: number]: Function};

    private opt_code: number;

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
        this.REG_SP = 0;
        // Reset Program counter:
        this.REG_PC = 0x8000 - 1;
        this.REG_PC_NEW = 0x8000 - 1;
        this.memory.fill(0);
        this.resetStatus();
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






}