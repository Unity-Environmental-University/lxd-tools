import React, {useState} from "react";
import { readProfileFromPage, renderProfile } from "@publish/fixesAndUpdates/profileRenderer";
import { findProfilePageSlug, getProfilePage, restrictBlueprintPage } from "@publish/fixesAndUpdates/courseDataStore";
import {IModuleData, IUserData} from '@ueu/ueu-canvas/canvasDataDefs';
import {useEffectAsync} from "../../../ui/utils";
import {FacultyProfile} from "./FacultyProfile";
import {FacultyProfileSearch} from "./FacultyProfileSearch";
import {Col, Row} from "react-bootstrap";
import {Course} from '@ueu/ueu-canvas/course/Course';


import {IAssignmentGroup} from "@ueu/ueu-canvas/content/types";
import {IProfile} from "@ueu/ueu-canvas/type";

type SectionDetailsProps = {
    section?: Course | null,
    blueprintCourse?: Course | null,
    onUpdateFrontPageProfile?(profile: IProfile): void,
    facultyProfileMatches?: (IProfile & {user:IUserData})[] | null,
    onClose?: () => void,
}

export function SectionDetails({
                                   section,
                                   blueprintCourse,
                                   onClose,
                                   onUpdateFrontPageProfile,
                                   facultyProfileMatches
                               }: SectionDetailsProps) {
    const [modules, setModules] = useState<IModuleData[]>([])
    const [assignmentGroups, setAssignmentGroups] = useState<IAssignmentGroup[]>([])
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageProfile, setFrontPageProfile] = useState<IProfile | null>(null)
    const [info, setInfo] = useState<string | null>(null)
    const [infoClass, setInfoClass] = useState<string>('alert-primary')
    const [profileSlug, setProfileSlug] = useState<string | null>(null)
    const [profileSlugError, setProfileSlugError] = useState<string | null>(null)
    const [blueprintPageId, setBlueprintPageId] = useState<number | null>(null)

    useEffectAsync(async () => {
        await onSectionChange();
        await refreshProfileSlug();
    }, [section, blueprintCourse]);

    async function refreshProfileSlug() {
        if (!section || !blueprintCourse) {
            setProfileSlug(null);
            setProfileSlugError(null);
            setBlueprintPageId(null);
            return;
        }
        // Resolved from the blueprint, not the section: the section's own copy
        // shares the slug but has a different page_id, and blueprint locking
        // (restrictBlueprintPage) only accepts the blueprint's own page_id.
        const result = await findProfilePageSlug(blueprintCourse.id);
        if (result.status === "found") {
            setProfileSlug(result.slug);
            setProfileSlugError(null);
            setBlueprintPageId(result.blueprintPageId);
            const targetPage = await getProfilePage(section.id, result.slug);
            if (targetPage) {
                setFrontPageProfile(readProfileFromPage(targetPage.body));
            }
        } else {
            setProfileSlug(null);
            setBlueprintPageId(null);
            setProfileSlugError(result.status === "none" ? "No profile page found" : `Multiple profile pages: ${result.candidates.join(", ")}`);
        }
    }


    async function onSectionChange() {
        /* clear out values, so we don't end up rendering last window's data */
        setInstructors([]);
        setModules([]);
        setAssignmentGroups([]);
        setFrontPageProfile(null);
        setInfo(null);
        if (!section) return;

        await Promise.all([
            async () => setModules(await section.getModules()),
            async () => setInstructors(await getInstructors(section) ?? []),
            async () => setAssignmentGroups(await section.getAssignmentGroups({
                queryParams: {
                    include: ['assignments']
                }
            }))
        ].map(func => func()))
    }

    async function getInstructors(section: Course) {
        const fetchInstructors = await section.getInstructors();
        //Replaced logical-AND with IF to please linter
        if(fetchInstructors) setInstructors(fetchInstructors);
        return fetchInstructors;
    }

    function error(message: string) {
        broadcast(message, 'alert-error')
    }

    function broadcast(message: string, infoClass: string = 'alert-primary') {
        setInfo(message);
        setInfoClass(infoClass);
    }

    function message(message: string) {
        setInfo(message);
        setInfoClass('alert-primary')
    }

    function success(message: string) {
        setInfo(message);
        setInfoClass('alert-success')
    }

    async function applyProfile(profile: IProfile & {user: IUserData}) {
        if (!section) return;
        if (!profileSlug) return error(profileSlugError ?? "No profile page found");
        const targetPage = await getProfilePage(section.id, profileSlug);
        if (!targetPage) return error(`Profile page "${profileSlug}" not found`);

        message('Applying new profile')
        const newText = renderProfile(targetPage.body, profile);
        // Section copies are locked by default; unlock the blueprint's page for
        // this one write and always re-lock afterward (see restrictBlueprintPage).
        if (blueprintPageId && blueprintCourse) {
            await restrictBlueprintPage(blueprintCourse.id, blueprintPageId, false);
        }
        try {
            await targetPage.updateContent(newText);
        } finally {
            if (blueprintPageId && blueprintCourse) {
                await restrictBlueprintPage(blueprintCourse.id, blueprintPageId, true);
            }
        }
        const newProfile = readProfileFromPage(newText);
        setFrontPageProfile(newProfile)
        if (onUpdateFrontPageProfile && newProfile) onUpdateFrontPageProfile(newProfile);
        success("Profile updated")
    }


    return (section && (<div>
        <h3>Section Details
            <button onClick={onClose}>X</button>
        </h3>
        <p><a href={section.courseUrl} target={'_blank'} className={'course-link'}>{section.name}</a></p>
        <p>
            {profileSlug
                ? <em>Profile target page: {profileSlug}</em>
                : <em className={'text-danger'}>{profileSlugError}</em>}
        </p>
        {info && <div className={`alert ${infoClass}`}>{info}</div>}
        <Row>
            <div className={'col-sm-8'}>
                {frontPageProfile && <FacultyProfile profile={frontPageProfile}/>}
            </div>
            <div className={'col-sm-4'}>
                <div className={'col'}>
                    <h4>Modules</h4>
                    {modules.map((module) => (<div key={module.id} className={'row'}>
                        <div className={'col-xs-12'}>{module.name}</div>
                    </div>))}
                </div>
                <div className={'col'}>
                    <AssignmentGroups assignmentGroups={assignmentGroups}/>
                </div>
            </div>
        </Row>
        <Row><Col>
            <FacultyProfileSearch
                onProfileSelect={applyProfile}
                user={instructors && instructors[0]}
            />
        </Col></Row>
        <Row><Col>
            {facultyProfileMatches && facultyProfileMatches.map((profile, i) => (
                <FacultyProfile profile={profile}
                                key={i}
                                setProfileButton={async () => await applyProfile(profile)}/>
            ))}
        </Col></Row></div>))
}


interface IAssignmentGroupsProps {
    assignmentGroups: IAssignmentGroup[]
}

function AssignmentGroups({assignmentGroups}: IAssignmentGroupsProps) {
    return <div>
        <h4>Assignment Groups</h4>
        {
            assignmentGroups.map((group) => (
                <div key={group.id} className={'row'}>
                    <div className={'col-xs-9'}>{group.name}</div>
                    <div className={'col-xs-3'}>{group.group_weight}%</div>
                    <ul>
                        {group.assignments?.map((assignment) => (
                            <li>{assignment.name}</li>
                        ))}
                    </ul>
                </div>
            ))
        }
    </div>
}