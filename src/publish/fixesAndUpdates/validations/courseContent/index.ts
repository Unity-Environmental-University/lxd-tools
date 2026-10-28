
import {
    moduleElementsAreRequiredValidation
} from "@publish/fixesAndUpdates/validations/courseContent/moduleElementsAreRequired";

import { courseOverviewLanguageTest } from "@publish/fixesAndUpdates/validations/courseContent/courseOverviewTest";
import { homepageButtonsTest } from "./homepageButtonsTest";

export default [
	courseOverviewLanguageTest,
	moduleElementsAreRequiredValidation,
	homepageButtonsTest,
]
