import {bpify} from "./index";


test("bpify test", () => {
    expect(bpify('ANIM103')).toBe('BP_ANIM103')
    expect(bpify('DEV_ANIM103')).toBe('BP_ANIM103')
    expect(bpify('DE-24-May_ANIM103')).toBe('BP_ANIM103')
    expect(bpify('DE8W06.03.24_ANIM103')).toBe('BP_ANIM103')
    expect(bpify('DE-24-May ANIM103')).toBe('BP_ANIM103')
    expect(bpify('DE8W06.03.24 ANIM103')).toBe('BP_ANIM103')
})