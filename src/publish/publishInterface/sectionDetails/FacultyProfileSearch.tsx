import {getFacultyPages, getPotentialFacultyProfiles, getProfileFromPage, IProfile} from "../../../canvas/profile";
import React, {FormEvent, useReducer, useState} from "react";
import {collectionLutDispatcher, listDispatcher} from "../../../reducerDispatchers";
import {Col, Form} from "react-bootstrap";
import {FacultyProfile} from "./FacultyProfile";
import {IUserData} from "../../../canvas/canvasDataDefs";

interface IFacultyProfileSearchProps {
    onProfileSelect(profile: IProfile): Promise<void>
    user?: IUserData | undefined,
    minSearchLength?: number
}

export function FacultyProfileSearch({onProfileSelect, minSearchLength = 5, user}: IFacultyProfileSearchProps) {
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

    return <Col><h2>Faculty Profile Matches</h2>
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
        </Form>
    </Col>
}