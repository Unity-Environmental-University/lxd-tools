import {Course} from "../canvas/index";
import {IProfile} from "../canvas/profile";
import React, {useState} from "react";
import {IAssignmentGroup, IModuleData, IUserData} from "../canvas/canvasDataDefs";
import {useEffectAsync} from "../ui/utils";
import {Button} from "react-bootstrap";

type SectionDetailsProps = {
    section: Course | null,
    facultyProfileMatches: IProfile[] | null,
    onClose?: () => void,
}

export function SectionDetails({section, onClose, facultyProfileMatches}: SectionDetailsProps) {
    const [modules, setModules] = useState<IModuleData[]>([])
    const [assignmentGroups, setAssignmentGroups] = useState<IAssignmentGroup[]>([])
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageProfile, setFrontPageProfile] = useState<IProfile | null>(null)


    useEffectAsync(async () => {
        await onSectionChange();
    }, [section]);


    async function onSectionChange() {
        /* clear out values so we don't end up rendering last window's data */
        setInstructors([]);
        setModules([]);
        setAssignmentGroups([]);
        setFrontPageProfile(null);
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

    return (section && (<div>
        <h3>{section.name}
            <button onClick={onClose}>X</button>
        </h3>
        <p>{instructors.map(instructor => instructor.name).join(',')}</p>
        <div className={'row'}>
            <div className={'col-sm-8'}>
                {facultyProfileMatches && facultyProfileMatches.map((profile, i) => (
                    <div key={i} className={'row'} style={{border: "1px solid black", boxShadow: "10 10 2 #888"}}>
                        <div className={'col-xs-3'}>
                            <h4>Image</h4>
                            {profile.imageLink ? <img style={{width: '100px'}} src={profile.imageLink}></img> :
                                <h3>No Image</h3>}
                            <h4>Display Name</h4>
                            <p>{profile.displayName ?? "[No Display Name Found]"}</p>
                        </div>
                        <div className={'col-xs-9 rawHtml'}>
                            {profile.bio ?? "[No bio found on page]"}
                        </div>
                        <div className={'col-xs-12'}>
                            <Button disabled={true}>Use this for profile</Button>
                        </div>

                    </div>))}

            </div>
            <div className={'col-sm-4'}>
                <div className={'col'}>
                    <h4>Modules</h4>
                    {modules.map((module) => (<div key={module.id} className={'row'}>
                        <div className={'col-xs-12'}>{module.name}</div>
                    </div>))}
                </div>
                <div className={'col'}>
                    <h4>Assignment Groups</h4>
                    {assignmentGroups.map((group) => (
                        <div key={group.id} className={'row'}>
                            <div className={'col-xs-9'}>{group.name}</div>
                            <div className={'col-xs-3'}>{group.group_weight}%</div>
                            <ul>
                                {group.assignments?.map((assignment) => (
                                    <li>{assignment.name}</li>
                                ))}
                            </ul>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    </div>))
}