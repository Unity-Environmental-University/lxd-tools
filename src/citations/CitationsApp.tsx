import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/citations/store";
import {getWorkingCourseData} from "@/citations/courseDataSlice";
import {useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import Modal from "@/ui/widgets/Modal";

export type CitationsAppProps = {

}

export default function CitationsApp() {

    const courseData = useSelector(getWorkingCourseData);
    const dispatch = useDispatch();

    return <>

    </>

}