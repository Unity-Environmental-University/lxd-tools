import courseContent from "@publish/fixesAndUpdates/validations/courseContent";
import proxyServerLinkValidation from "@publish/fixesAndUpdates/validations/proxyServerLinkValidation";
import rubricSettings from "@publish/fixesAndUpdates/validations/rubricSettings";
import syllabusTests, {removeSameDayPostRestrictionTest} from "@publish/fixesAndUpdates/validations/syllabusTests";
import discussionThreading from "@publish/fixesAndUpdates/validations/discussionThreading";
import courseSettings from "@publish/fixesAndUpdates/validations/courseSettings";
import assignments from "@publish/fixesAndUpdates/validations/assignments";
import courseSpecific from "@publish/fixesAndUpdates/validations/courseSpecific";
import references from "@publish/fixesAndUpdates/validations/references";
import aiLinkValidation from "@publish/fixesAndUpdates/validations/aiLinkValidation";
//import {dontUseThisValidation} from "@publish/fixesAndUpdates/dontUseThis";

export default [
    ...courseContent,
    ...courseSettings,
    ...courseSpecific,
    ...references,
    ...rubricSettings,
    ...syllabusTests,
    ...assignments,
    proxyServerLinkValidation,
    aiLinkValidation,
    discussionThreading,
//   dontUseThisValidation
]