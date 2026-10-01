//import {dontUseThisValidation} from "@publish/fixesAndUpdates/dontUseThis";

import { kalturaSizeTests } from "./kalturaSizeFix";
import courseContent from "./courseContent";

export default [
	kalturaSizeTests,
	...courseContent,
  //...references,
  //   dontUseThisValidation
];
