import weeklyObjectivesTest from "@publish/fixesAndUpdates/validations/courseContent/weeklyObjectivesTest";
import courseProjectOutlineTest from "@publish/fixesAndUpdates/validations/courseContent/courseProjectOutlineTest";
import codeAndCodeOfCodeTest from "@publish/fixesAndUpdates/validations/courseContent/codeAndCodeOfCodeTest";
import overviewDiscMornToNightTest from "@publish/fixesAndUpdates/validations/courseContent/overviewDiscMornToNightTest";
import removeGradeTable from "@publish/fixesAndUpdates/validations/courseContent/removeGradeTable";
import footerOnFrontPageTest from "@publish/fixesAndUpdates/validations/courseContent/footerOnFrontPageTest";
import {
    moduleElementsAreRequiredValidation
} from "@publish/fixesAndUpdates/validations/courseContent/moduleElementsAreRequired";
import {updateSupportPage} from "@publish/fixesAndUpdates/validations/courseContent/updateSupportPage";
import technologyForSuccess from "@publish/fixesAndUpdates/validations/courseContent/technologyForSuccess";
import studentHandbookTest from "@publish/fixesAndUpdates/validations/courseContent/studentHanbookTest";


export default [
    courseProjectOutlineTest,
    weeklyObjectivesTest,
    codeAndCodeOfCodeTest,
    overviewDiscMornToNightTest,
    removeGradeTable,
    footerOnFrontPageTest,
    moduleElementsAreRequiredValidation,
    updateSupportPage,
    technologyForSuccess,
    studentHandbookTest
]