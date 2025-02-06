import React, {useMemo} from "react";
import {ITermData} from "@canvas/term/Term";
import {useSelector} from "react-redux";
import {RootReportingState} from "@/reporting/data/reportingStore";
import {Form} from "react-bootstrap";

export type TermPickerProps = {
    onPickTerm: (term: ITermData) => void;
}
export const TermPicker = ({onPickTerm}: TermPickerProps) => {
    const [activeTerm, setActiveTerm] = React.useState<ITermData | undefined>();
    const {terms, status} = useSelector((state: RootReportingState) => state.term);

    const sortedTerms = useMemo(() => {
        if (!terms) return [];
        const now = Date.now();
        return [...terms].sort((a, b) => {
            const startA = new Date(a.start_at).getTime();
            const endA = new Date(a.end_at).getTime();
            const startB = new Date(b.start_at).getTime();
            const endB = new Date(b.end_at).getTime();

            const isOngoingA = startA <= now && now <= endA;
            const isOngoingB = startB <= now && now <= endB;

            if (isOngoingA && !isOngoingB) return -1;
            if (!isOngoingA && isOngoingB) return 1;

            return Math.abs(startA - now) - Math.abs(startB - now);
        });
    }, [terms]);


    const activeTermId = useMemo(() => {
        if (!activeTerm) return undefined;
        return activeTerm.name;
    }, [activeTerm])

    return <>
        <Form.Group controlId={"themeField"}>
            <Form.Label id="themeLabel">Theme</Form.Label>
            <Form.Control as={"select"} multiple value={activeTermId}></Form.Control>
            {terms?.map((term: ITermData) => <option
                key={term.name}
                value={term.name}
            >{term.name}</option>)}
        </Form.Group>
    </>
}