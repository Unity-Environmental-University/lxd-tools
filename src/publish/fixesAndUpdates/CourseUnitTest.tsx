import React, {useState} from "react";
import {Course} from "../../canvas/index";
import {UnitTestResult} from "./publishUnitTests";
import {useEffectAsync} from "../../ui/utils";
import './CourseUnitTest.scss'

type UnitTestSectionProps = {
    course: Course,
    refreshCourse: () => Promise<any>,
    tests: CourseUnitTest[]
}
export type CourseUnitTest = {
    name: string,
    description: string,
    run:  (course: Course) => Promise<UnitTestResult>
}

export function UnitTestSection({course, tests, refreshCourse}: UnitTestSectionProps) {
    return <div className={'container'}>
        <h2>Course Settings and Content Tests</h2>
        {tests.map((test) => <UnitTestRow
            key={test.name}
            course={course}
            test={test}
            refreshCourse={refreshCourse}
        />)}
    </div>
}

type UnitTestRowProps = {
    course: Course,
    test: CourseUnitTest,
    refreshCourse: () => Promise<any>
}

function UnitTestRow({test, course, refreshCourse}: UnitTestRowProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UnitTestResult>()

    async function reRun() {
        await refreshCourse();
        setResult(await test.run(course))
    }

    useEffectAsync(async () => {
        setResult(await test.run(course));
    }, [course, test])

    function statusMessage(result:UnitTestResult|undefined) {
        if(loading) return "running..."
        if(!result) return "No result. An error may have occurred."
        if(result.success) return "Succeeded!"
        return result.message;
    }

    return <div className={'row test-row'}>
        <div className={'col-sm-3'}>{test.name}</div>
        <div className={'col-sm-4'}>{test.description}</div>
        <div className={'col-sm-4'}>{statusMessage(result)}</div>
        <div className={'col-sm-1'}>
            {!result && <span className={'badge badge-info'}>Running</span>}
            {result?.success && <span className={'badge badge-success'}>OK!</span>}
            {result && !result.success && <span className={'badge badge-warning'}>Failed</span>}
        </div>
    </div>
}

