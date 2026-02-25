import {getCourseGenerator} from '@ueu/ueu-canvas/course';
import {IMultiSelectOption, optionize} from "../ui/widgets/MuliSelect";
import React, {FormEventHandler, useEffect, useState} from "react";
import {Form, Spinner} from "react-bootstrap";
import {Course} from '@ueu/ueu-canvas/course/Course';
import {Account, RootAccountNotFoundError} from "@ueu/ueu-canvas/Account";

interface ISearchCoursesProps {
    onlySearchBlueprints: boolean,
    includeLegacyBps: boolean,
    setIsSearching: (value: boolean) => void,
    setFoundCourses: (value: (Course & IMultiSelectOption)[]) => void,
}

export function SearchCourses({
    setFoundCourses,
    onlySearchBlueprints,
    includeLegacyBps,
}: ISearchCoursesProps) {

    const [courseSearchString, setCourseSearchString] = useState('');
    const [seekCourseCodes, setSeekCourseCodes] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    function updateCourseSearchString() {
        let replaceString = courseSearchString.replaceAll(/(\w+)\t(\d+)\s*/gs, '$1$2,')
        replaceString = replaceString.replaceAll(/(\w+\d+,)\1+/gs, '$1')
        setCourseSearchString(replaceString.replace(/,$/, ''))
    }

    const search: FormEventHandler = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isSearching) return;
        updateCourseSearchString();
        const rootAccount = await Account.getRootAccount();
        if (typeof rootAccount === 'undefined') throw new RootAccountNotFoundError();
        const accountIds = [rootAccount.id];
        setIsSearching(true)
        let courses: (Course & IMultiSelectOption)[] = [];
        for (const code of seekCourseCodes) {

            const config = onlySearchBlueprints ? {
                queryParams: {blueprint: true,}
            } : undefined;
            const generator = getCourseGenerator(code, accountIds, undefined,config);

            for await (const course of generator) {
                const [optionCourse] = optionize(
                    [course],
                    course => course.id,
                    course => course.parsedCourseCode ?? course.name ?? course.id.toString()
                );
                courses = [...courses, optionCourse].toSorted((a, b) => (a.baseCode ?? a.name).localeCompare(b.baseCode ?? b.name));
                if (onlySearchBlueprints) courses = courses.filter(course => course.isBlueprint())
                setFoundCourses(courses);

            }
        }
        setIsSearching(false);
    }

    useEffect(() => {

        const strings = courseSearchString.split(',').map(string => string.trimEnd());
        //Filter out dupes
        const courseCodes = strings.filter((value, index, array) => array.indexOf(value) === index);
        // if (onlySearchBlueprints && !includeLegacyBps) {
        //     courseCodes = courseCodes.map(bpify)
        // }
        setSeekCourseCodes(courseCodes)
    }, [courseSearchString]);


    return <Form onSubmit={search}>
        <input type={'text'} value={courseSearchString}
               onChange={(e) => setCourseSearchString(e.target.value)}></input>
        <button type="submit" disabled={isSearching}>
            {isSearching ? (
                <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    &nbsp;Searching…
                </>
            ) : (
                "Get Courses"
            )}
        </button>

    </Form>
}