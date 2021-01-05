import { expect } from "chai";
import { CPU, Instruction_OptCode_Table, Register } from "../src/Processor/CPU";



describe("CPU Testing", () => {

    console.log(`Before all`);

    const cpu = new CPU();

    beforeEach(function () {
        console.log(`BeforeTest: ${this.currentTest.title}: \n`);
    });

    afterEach(function () {
        cpu.reset();
        console.log(`AfterTest: ${this.currentTest.title}: \n`);
    })

    describe("Tests for loading", () => {

        const setInstructionAndExecute = (instruction: Instruction_OptCode_Table, value: number, cycles: number) => {
            cpu.setMemory(cpu.getPC(), instruction);
            cpu.setMemory(cpu.getPC()+1, value);
            cpu.execute(cycles);
        };

        describe("Loading immediate", () => {

            it("Loading immediate positive", () => {
                setInstructionAndExecute(Instruction_OptCode_Table.LDA_IMD, 0x01, 2);
                expect(cpu.getPC()).equal(0xFFFC+2);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
            });

            it("Loading immediate negative", () => {
                setInstructionAndExecute(Instruction_OptCode_Table.LDA_IMD, 0xF1, 2);
                expect(cpu.getPC()).equal(0xFFFC+2);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
            });

            afterEach(() => {
                cpu.reset();
            });
        });
    });

});