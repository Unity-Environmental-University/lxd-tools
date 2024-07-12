import {IProfile, renderProfileIntoCurioFrontPage} from "../../../canvas/profile";
import React, {useState} from "react";
import {IModuleData, IUserData} from "../../../canvas/canvasDataDefs";
import {useEffectAsync} from "../../../ui/utils";
import {FacultyProfile} from "./FacultyProfile";
import {FacultyProfileSearch} from "./FacultyProfileSearch";
import {Col, Row} from "react-bootstrap";
import {Course} from "../../../canvas/course/Course";


import {IAssignmentGroup} from "@/canvas/content/types";

type SectionDetailsProps = {
    section?: Course | null,
    onUpdateFrontPageProfile?(profile: IProfile): void,
    facultyProfileMatches?: (IProfile & {user:IUserData})[] | null,
    onClose?: () => void,
}

export function SectionDetails({
                                   section,
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

    useEffectAsync(async () => {
        await onSectionChange();
    }, [section]);


    async function onSectionChange() {
        /* clear out values, so we don't end up rendering last window's data */
        setInstructors([]);
        setModules([]);
        setAssignmentGroups([]);
        setFrontPageProfile(null);
        setInfo(null);
        if (!section) return;

        await Promise.all([
            async () => setFrontPageProfile(await section.getFrontPageProfile()),
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
        fetchInstructors && setInstructors(fetchInstructors)
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
        let frontPage = await section.getFrontPage();
        if (!frontPage) return;
        message('Applying new profile')
        const newText = renderProfileIntoCurioFrontPage(frontPage.body, profile);
        await frontPage.updateContent(newText);
        const newProfile = await section.getFrontPageProfile();
        setFrontPageProfile(newProfile)
        if (onUpdateFrontPageProfile) onUpdateFrontPageProfile(newProfile);
        success("Profile updated")
    }


    return (section && (<div>
        <h3>Section Details
            <button onClick={onClose}>X</button>
        </h3>
        <p><a href={section.courseUrl} target={'_blank'} className={'course-link'}>{section.name}</a></p>
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
                <FacultyProfile profile={profile} key={i}
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