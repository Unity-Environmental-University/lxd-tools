import {returnMockAsyncGen} from "@/__mocks__/utils";
import {ICourseData} from "@/canvas/courseTypes";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";


const isBlueprint = jest.fn();
 const genBlueprintDataForCode = jest.fn();
 const getSections = jest.fn();
 const getTermNameFromSections = jest.fn();
 const cachedGetAssociatedCoursesFunc = jest.fn();
 const retireBlueprint = jest.fn();
 const getBlueprintsFromCode = jest.fn();
 const lockBlueprint = jest.fn();
 const setAsBlueprint = jest.fn();
 const unSetAsBlueprint = jest.fn();

 const sectionDataGenerator = returnMockAsyncGen<ICourseData>([mockCourseData]);

 export {
     isBlueprint,
     genBlueprintDataForCode,
     getSections,
     getTermNameFromSections,
     cachedGetAssociatedCoursesFunc,
     retireBlueprint,
     getBlueprintsFromCode,
     lockBlueprint,
     setAsBlueprint,
     unSetAsBlueprint,
     sectionDataGenerator,
 }
