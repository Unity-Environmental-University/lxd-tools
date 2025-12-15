import {Button} from "react-bootstrap";
import React from "react";

import {IProfile} from "@canvas/type";

interface IFacultyProfileProps {
    profile: IProfile,
    setProfileButton?: ((e: React.MouseEvent) => void) | null,
    key?: number
}

export function FacultyProfile({profile, setProfileButton, key}: IFacultyProfileProps) {
    return (
        <div className={'row'} style={{border: "1px solid black", boxShadow: "10 10 2 #888"}}>
            <div className={'col-xs-3'}>
                <h4>Image</h4>
                {profile.imageLink ? <img style={{width: '100px'}} src={profile.imageLink}></img> :
                    <h3>No Image</h3>}
                <h4>Display Name</h4>
                <p>{profile.displayName ?? "[No Display Name Found]"}</p>
                {profile.sourcePage &&
                    <p><a href={profile.sourcePage.htmlContentUrl} target={'_blank'}>Source Page</a></p>}
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