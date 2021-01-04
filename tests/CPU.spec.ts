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
        console.log(`BeforeTest: ${this.currentTest.title}: \n`);
    })

    describe("Tests for loading", () => {

        describe("Loading immediate", () => {

            it("Loading immediate positive", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_IMD);
                cpu.setMemory(cpu.getPC()+1, 0x01);
                cpu.execute(2);
                expect(cpu.getPC()).equal(0xFFFC+2);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
            });

            it("Loading immediate negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_IMD);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.execute(2);
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