import "./publish.scss"
import React, {useState} from 'react';
import {useEffectAsync} from "@/ui/utils";

import {CourseUpdateInterface} from "./fixesAndUpdates/CourseUpdateInterface";
import {IUserData} from "@canvas/canvasDataDefs";
import {AdminApp} from "@/admin/AdminApp";
import {PublishInterface} from "./publishInterface/PublishInterface";
import {Alert, Row} from "react-bootstrap";
import {Course} from "@canvas/course/Course";
import {IMultiSelectOption} from "@/ui/widgets/MuliSelect";
import { runtime } from "webextension-polyfill";

import {fetchJson} from "@/canvas/fetch/fetchJson";
import {DIST_REPO_MANIFEST} from "@/publish/consts";
import validations from "@publish/fixesAndUpdates/validations";
import {Provider} from "react-redux";
import {store} from "@publish/publishInterface/videoUpdater/data/store";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export type ValidationOption = CourseValidation & IMultiSelectOption

function PublishApp() {

    const [course, setCourse] = useState<Course>();
    const [parentCourse, setParentCourse] = useState<Course>();
    const [user, setUser] = useState<IUserData>();

    async function getCourse(force:boolean = false) {
        if (!course || force) {
            const tempCourse = await Course.getFromUrl();
            if (tempCourse) {
                setCourse(tempCourse)
                setParentCourse(await tempCourse.getParentCourse())
            }
        }
    }
    useEffectAsync(getCourse, [])
    useEffectAsync(async() => {
        const user = await fetchJson('/api/v1/users/self') as IUserData;
        setUser(user);
    }, []);




    return(user && <div>
        <Provider store={store}>
            <CourseUpdateInterface
                course={course}
                parentCourse={parentCourse}
                allValidations={validations}
                refreshCourse={() => getCourse(true)
            }/>
            <PublishInterface course={course} user={user}/>
            <AdminApp course={course} allValidations={validations}/>
            <Row>
                <UpdateNeeded/>
            </Row>
        </Provider>
    </div>)
}


export function UpdateNeeded() {
    const currentVersion = runtime.getManifest().version;
    const [latestVersion, setLatestVersion] = useState<string|undefined>();

    useEffectAsync(async () => {
        if(!latestVersion)  setLatestVersion(await getLatestVersionNumber());
    }, [])



    return latestVersion && versionCompare(
        latestVersion,
        currentVersion
    ) > 0 && <Alert>You are not running the latest version ({latestVersion}) of the extension. You are running {currentVersion}.</Alert>
}

export function versionCompare(a:string, b:string) {
    const aSplit = a.split('.');
    const bSplit = b.split('.');
    for (let i = 0; i < Math.max(aSplit.length, bSplit.length); i++) {
        const aInt = parseInt(aSplit[i] ?? '0');
        const bInt = parseInt(bSplit[i] ?? '0');
        if(aInt === bInt) continue;
        return aInt - bInt;
    }
    return 0;
}

export async function getLatestVersionNumber() {
    const manifest = await fetchJson(DIST_REPO_MANIFEST) as { version: string };
    return manifest.version;
}
export default PublishApp

