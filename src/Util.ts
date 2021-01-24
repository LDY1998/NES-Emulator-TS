

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
    STX_ZP = 0x86,
    STX_ZPY = 0x96,
    STX_ABS = 0x8E,
    STY_ZP = 0x84,
    STY_ZPX = 0x94,
    STY_ABS = 0x8C,
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
    ADC_ABSY = 0x79,
    AND_IMD =  0x29,
    AND_ZP = 0x25,
    AND_ZPX = 0x35,
    AND_ABS = 0x2D,
    AND_ABSX = 0x3D,
    AND_ABSY = 0x39,
    EOR_IMD = 0x49,
    EOR_ZP = 0x45,
    EOR_ZPX = 0x55,
    EOR_ABS = 0x4D,
    EOR_ABSX = 0x5D,
    EOR_ABSY = 0x59,
    IOR_IMD = 0x09,
    IOR_ZP = 0x05,
    IOR_ZPX = 0x15,
    IOR_ABS = 0x0D,
    IOR_ABSX = 0x1D,
    IOR_ABSY = 0x19,
    BIT_ZP = 0x24,
    BIT_ABS = 0x2C,
    INC_ZP = 0xE6,
    INC_ZPX = 0xF6,
    INC_ABS = 0xEE,
    INC_ABSX = 0xFE,
    INX = 0xE8,
    INY = 0xC8,
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





const recursive_log = (obj: Object) => {
    Object.entries(obj).filter((entry) => entry[0] !== "memory").map((entry) => {
        if (typeof entry[1] === "object" && entry[1] !== null) {
            recursive_log(entry[1]);
        } else {
            console.log(`${entry[0]}: ${entry[1]} \n`);
        }
    })
}

export {
    recursive_log,
    Register,
    Mode,
    Instruction_OptCode_Table
}