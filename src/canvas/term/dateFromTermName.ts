import {Temporal} from "temporal-polyfill";

export function dateFromTermName(termName:string) {
    const [newCode, month, day, year] = /DE\dW(\d+)\.(\d+)\.(\d+)/i.exec(termName) ?? [];
    if(newCode) {
        const yearInt = parseInt(year);
        return Temporal.PlainDate.from({
            month: parseInt(month),
            day: parseInt(day),
            year: yearInt < 100? 2000 + yearInt : yearInt
        })
    }

}


export default dateFromTermName;