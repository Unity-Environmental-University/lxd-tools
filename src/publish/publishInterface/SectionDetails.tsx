import {IProfile, renderProfileIntoCurioFrontPage} from "../../canvas/profile";
import React, {useState} from "react";
import {IAssignmentGroup, IModuleData, IUserData} from "../../canvas/canvasDataDefs";
import {useEffectAsync} from "../../ui/utils";
import {Button} from "react-bootstrap";
import {Course} from "../../canvas/course/index";

type SectionDetailsProps = {
    section?: Course | null,
    onUpdateFrontPageProfile? (profile:IProfile): void,
    facultyProfileMatches?: IProfile[] | null,
    onClose?: () => void,
}

export function SectionDetails({section, onClose, onUpdateFrontPageProfile, facultyProfileMatches}: SectionDetailsProps) {
    const [modules, setModules] = useState<IModuleData[]>([])
    const [assignmentGroups, setAssignmentGroups] = useState<IAssignmentGroup[]>([])
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageProfile, setFrontPageProfile] = useState<IProfile | null>(null)
    const [info, setInfo] = useState<string|null>(null)
    const[infoClass, setInfoClass] = useState<string>('alert-primary')

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

    function error(message:string) {
        broadcast(message, 'alert-error')
    }

    function broadcast(message:string, infoClass: string = 'alert-primary') {
        setInfo(message);
        setInfoClass(infoClass);
    }

    function message(message:string) {
        setInfo(message);
        setInfoClass('alert-primary')
    }

    function success(message:string) {
        setInfo(message);
        setInfoClass('alert-success')
    }
    async function applyProfile(profile:IProfile) {
        if(!section) return;
        let frontPage = await section.getFrontPage();
        if(!frontPage) return;
        message('Applying new profile')
        const newText = renderProfileIntoCurioFrontPage(frontPage.body, profile);
        await frontPage.updateContent(newText);
        const newProfile = await section.getFrontPageProfile();
        setFrontPageProfile(newProfile)
        if (onUpdateFrontPageProfile) onUpdateFrontPageProfile(newProfile);
        success("Profile updated")
    }

    return (section && (<div>
        <h3>Section Details<button onClick={onClose}>X</button>
        </h3>
        <p><a href={section.courseUrl} target={'_blank'} className={'course-link'}>{section.name}</a></p>
        {info && <div className={`alert ${infoClass}`}>{info}</div>}
        <div className={'row'}>
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
            <div className={'row'}>
                <div className={'col'}>
                    <h2>Faculty Profile Matches</h2>
                    {facultyProfileMatches && facultyProfileMatches.map((profile, i) => (
                        <FacultyProfile profile={profile} key={i} setProfileButton={async () => await applyProfile(profile)}/>
                    ))}

                </div>
            </div>
        </div>
    </div>))
}

type FacultyProfileProps = {
    profile: IProfile
    setProfileButton?: ((e:React.MouseEvent)=>void) | null
}

function FacultyProfile({profile, setProfileButton}: FacultyProfileProps) {
    return (
        <div className={'row'} style={{border: "1px solid black", boxShadow: "10 10 2 #888"}}>
            <div className={'col-xs-3'}>
                <h4>Image</h4>
                {profile.imageLink ? <img style={{width: '100px'}} src={profile.imageLink}></img> :
                    <h3>No Image</h3>}
                <h4>Display Name</h4>
                <p>{profile.displayName ?? "[No Display Name Found]"}</p>
                {profile.sourcePage && <p><a href={profile.sourcePage.htmlContentUrl} target={'_blank'}>Source Page</a></p>}
            </div>
            <div className={'col-xs-9 rawHtml'}>
                {profile.bio ?? "[No bio found on page]"}
            </div>
            {setProfileButton &&
            <div className={'col-xs-12'}>
                <Button onClick={setProfileButton}>Use this for profile</Button>
            </div>}
        </div>)
}