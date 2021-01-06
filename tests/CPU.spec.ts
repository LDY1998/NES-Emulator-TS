import { expect } from "chai";
import { CPU, Instruction_OptCode_Table, Register } from "../src/Processor/CPU";



describe("CPU Testing", () => {

    console.log(`Before all`);

    const cpu = new CPU();


    const initial_pc = 0xFFFC;

    beforeEach(function () {
        console.log(`BeforeTest: ${this.currentTest.title}: \n`);
    });

    afterEach(function () {
        cpu.reset();
        console.log(`AfterTest: ${this.currentTest.title} \n`);
    });

    describe("Tests for loading", () => {

        describe("Loading immediate", () => {

            it("Loading immediate positive", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_IMD);
                cpu.setMemory(cpu.getPC()+1, 0x01);
                cpu.execute(2);
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
            });

            it("Loading immediate negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_IMD);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.execute(2);
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
            });


            
        });

        describe("Loading ZP", () => {

            it("Loading ZP X positive", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDX_ZP);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setMemory(0xF1, 0x01);
                cpu.execute(3);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_X)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
                expect(cpu.getStatus("zero")).equal(0);
            });

            it("Loading ZP Y negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDY_ZP);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setMemory(0xF1, 0xF1);
                cpu.execute(3);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_Y)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
                expect(cpu.getStatus("zero")).equal(0);
            });

            
        });
    });

});