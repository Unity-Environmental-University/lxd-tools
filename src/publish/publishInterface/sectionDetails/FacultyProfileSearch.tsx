import {getFacultyPages, getProfileFromPage} from '@ueu/ueu-canvas/profile';
import React, {FormEvent, useState} from "react";
import {Button, Form} from "react-bootstrap";
import {FacultyProfile} from "./FacultyProfile";
import {IUserData} from '@ueu/ueu-canvas/canvasDataDefs';
import {IProfile} from "@ueu/ueu-canvas/type";

interface IFacultyProfileSearchProps {
    onProfileSelect(profile: IProfile): Promise<void>
    user: IUserData,
    minSearchLength?: number
}

export function FacultyProfileSearch({onProfileSelect, minSearchLength = 3, user}: IFacultyProfileSearchProps) {
    const [search, setSearch] = useState('');
    const [
        profiles,
        setProfiles
    ] = useState<IProfile[]>( []);



    async function searchForProfiles(e: FormEvent) {
        e.preventDefault();
        if(search.length < minSearchLength) return;
        const pages = await getFacultyPages(search);
        setProfiles(pages.map(page => getProfileFromPage(page, user)))
    }

    return <><h2>Faculty Profile Matches</h2>
        {
            profiles && profiles.map((profile, i) => (
                <FacultyProfile profile={profile} key={i}
                                setProfileButton={async () => await onProfileSelect(profile)}/>
            ))
        }
        <Form
            onSubmit={searchForProfiles}
        >
            <Form.Label>Search</Form.Label>
            <Form.Control
                type={'text'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for additional profiles'
            />
            {search.length < minSearchLength && <h5>Search must be at least {minSearchLength} characters</h5>}
            <Button onClick={searchForProfiles} disabled={search.length < minSearchLength}>Submit</Button>
        </Form>
    </>
}