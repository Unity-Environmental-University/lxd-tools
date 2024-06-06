import {Temporal} from "temporal-polyfill";
import {sleep} from "./index";

describe('Testing basic sleep function', () => {

    it('sleeps for the right amount of time', async ()=> {
        const durations = [
            50,
            60
        ]
        for(let i = 0; i < 10; i++) {
            for (let duration of durations) {
                const time = Date.now();
                await sleep(duration);
                const after = Date.now();
                const elapsed = after - time;
                console.log(duration, elapsed);
                expect(elapsed - duration).toBeLessThan(20)
                expect(elapsed - duration).toBeGreaterThanOrEqual(-5)

            }
        }

    })


})