import {exec} from "node:child_process";

const result = await exec('git add .', {}, ((error, stdout, stderr)=>console.log(stdout)));
//console.log(result.stdout)

export default {}