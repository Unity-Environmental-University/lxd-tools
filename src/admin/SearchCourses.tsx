import {getCourseGenerator} from "../canvas/course/index";
import {IMultiSelectOption, optionize} from "../ui/widgets/MuliSelect";
import React, {FormEventHandler, useEffect, useState} from "react";
import {bpify} from "./index";
import {Form} from "react-bootstrap";
import {Course} from "../canvas/course/Course";
import {Account} from "@/canvas/Account";

interface ISearchCoursesProps {
    onlySearchBlueprints: boolean,
    setIsSearching: (value: boolean) => void,
    setFoundCourses: (value: (Course & IMultiSelectOption)[]) => void,
}

export function SearchCourses({
    setFoundCourses,
    onlySearchBlueprints,
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

        const accountIds = [(await Account.getRootAccount()).id];
        setIsSearching(true)
        let courses: (Course & IMultiSelectOption)[] = [];
        for (let code of seekCourseCodes) {

            const generator = getCourseGenerator(code, accountIds);

            for await (let course of generator) {
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
        let courseCodes = strings.filter((value, index, array) => array.indexOf(value) === index);
        if (onlySearchBlueprints) courseCodes = courseCodes.map(bpify)
        setSeekCourseCodes(courseCodes)
    }, [courseSearchString]);


    return <Form onSubmit={search}>
        <input type={'text'} value={courseSearchString}
               onChange={(e) => setCourseSearchString(e.target.value)}></input>
        <button>Get Courses</button>
    </Form>
}