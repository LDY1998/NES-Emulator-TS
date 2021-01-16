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
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_X)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
                expect(cpu.getStatus("zero")).equal(0);
            });

            it("Loading ZP Y negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDY_ZP);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setMemory(0xF1, 0xF1);
                cpu.execute(3);
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_Y)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
                expect(cpu.getStatus("zero")).equal(0);
            });

            
        });

        describe("Loading ZPX/Y", () => {

            it("Loading ZPX positive", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDY_ZPX);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setRegister(Register.REG_X, 0x01);
                cpu.setMemory(0xF2, 0x01);
                cpu.execute(3);
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_X)).equal(0x01);
                expect(cpu.getRegister(Register.REG_Y)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
                expect(cpu.getStatus("zero")).equal(0);
            });

            it("Loading ZPY negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDX_ZPY);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setRegister(Register.REG_Y, 0x01);
                cpu.setMemory(0xF2, 0xF1);
                cpu.execute(3);
                expect(cpu.getPC()).equal(initial_pc+2);
                expect(cpu.getRegister(Register.REG_Y)).equal(0x01);
                expect(cpu.getRegister(Register.REG_X)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
                expect(cpu.getStatus("zero")).equal(0);
            });

            
        });

        describe("Loading ABS", () => {

            it("Loading ABS positive", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDA_ABS);
                cpu.setMemory(cpu.getPC()+1, 0xF1);
                cpu.setMemory(cpu.getPC()+2, 0x01);
                cpu.setMemory(0xF101, 0x01);
                cpu.execute(4);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_ACC)).equal(0x01);
                expect(cpu.getStatus("negative")).equal(0);
                expect(cpu.getStatus("zero")).equal(0);
            });

            it("Loading ABS negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDY_ABS);
                cpu.setMemory(cpu.getPC()+1, 0x01);
                cpu.setMemory(cpu.getPC()+2, 0x01);
                cpu.setMemory(0x0101, 0xF1);
                cpu.execute(4);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_Y)).equal(0xF1);
                expect(cpu.getStatus("negative")).equal(1);
                expect(cpu.getStatus("zero")).equal(0);
            });

            
        });

        describe("Loading ABSX/Y", () => {
            it("Loading ABSX negative", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDY_ABSX);
                cpu.setMemory(cpu.getPC()+1, 0x00);
                cpu.setMemory(cpu.getPC()+2, 0x01);
                cpu.setRegister(Register.REG_X, 0x01);
                cpu.setMemory(0x02, 0x80);
                cpu.execute(4);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_Y)).equal(0x80);
                expect(cpu.getStatus("negative")).equal(1);
                expect(cpu.getStatus("zero")).equal(0);
            });

            it("Loading ABSY zero", () => {
                cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.LDX_ABSY);
                cpu.setMemory(cpu.getPC()+1, 0x00);
                cpu.setMemory(cpu.getPC()+2, 0x01);
                cpu.setRegister(Register.REG_X, 0x01);
                cpu.setMemory(0x02, 0x00);
                cpu.execute(4);
                expect(cpu.getPC()).equal(initial_pc+3);
                expect(cpu.getRegister(Register.REG_Y)).equal(0);
                expect(cpu.getStatus("negative")).equal(0);
                expect(cpu.getStatus("zero")).equal(1);
            });
        });
    });


    describe("Store testing", () => {


        it("Storing ZP", () => {
            cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.STA_ZP);
            cpu.setMemory(cpu.getPC()+1, 0x01);
            cpu.setRegister(Register.REG_ACC, 0x80);
            cpu.execute(3);
            expect(cpu.getPC()).equal(initial_pc+2);
            expect(cpu.getMemory(0x01)).equal(0x80);
            expect(cpu.getStatus("negative")).equal(0);
        });

        it("Storeing ZPX", () => {
            cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.STY_ZPX);
            cpu.setMemory(cpu.getPC()+1, 0x01);
            cpu.setRegister(Register.REG_Y, 0x80);
            cpu.setRegister(Register.REG_X, 0x01);
            cpu.execute(3);
            expect(cpu.getPC()).equal(initial_pc+2);
            expect(cpu.getMemory(0x02)).equal(0x80);
            expect(cpu.getStatus("negative")).equal(0);
        });

        it("Storeing ZPY", () => {
            cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.STX_ZPY);
            cpu.setMemory(cpu.getPC()+1, 0x01);
            cpu.setRegister(Register.REG_X, 0x80);
            cpu.setRegister(Register.REG_Y, 0x01);
            cpu.execute(3);
            expect(cpu.getPC()).equal(initial_pc+2);
            expect(cpu.getMemory(0x02)).equal(0x80);
            expect(cpu.getStatus("negative")).equal(0);
        });

        it("Storing ABS", () => {
            cpu.setMemory(cpu.getPC(), Instruction_OptCode_Table.STA_ABS);
            cpu.setMemory(cpu.getPC()+1, 0x01);
            cpu.setMemory(cpu.getPC()+2, 0x01);
            cpu.setRegister(Register.REG_ACC, 0x80);
            cpu.execute(4);
            expect(cpu.getPC()).equal(initial_pc+3);
            expect(cpu.getMemory(0x0101)).equal(0x80);
            expect(cpu.getStatus("negative")).equal(0);
        });

    });

    describe("Testing Transfer", () => {
        it("Transfer x to sp", () => {
            cpu.setRegister(Register.REG_X, 0x01);
            cpu.setMemory(initial_pc, Instruction_OptCode_Table.TXS);
            cpu.execute(2);
            expect(cpu.getRegister(Register.REG_SP)).equal(0x01);
        })
    })

});