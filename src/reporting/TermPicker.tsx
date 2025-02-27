import React, {useMemo, useState} from "react";
import {ITermData} from "@canvas/term/Term";
import {Card, CardTitle, Form, Row, Spinner} from "react-bootstrap";
import Select from "react-select";
import {useTerms} from "@/reporting/hooks/useTerms";

export type TermPickerProps = {
    onPickTerms: (terms: ITermData[]) => void;
};



export const TermPicker = ({onPickTerms}: TermPickerProps) => {
    const [activeTerms, setActiveTerms] = useState<ITermData[]>([]);
    const [showOngoingOnly, setShowOngoingOnly] = useState<boolean>(false);
    const {terms, status} = useTerms({maxFetch: 20});

    const now = Date.now();

    const sortedTerms = useMemo(() => {
        if (!terms) return [];
        return [...terms]
            .filter(term => !showOngoingOnly || (new Date(term.start_at).getTime() <= now && now <= new Date(term.end_at).getTime()))
            .sort(showOngoingTermsFirst);
    }, [terms, showOngoingOnly]);

    const handleSelect = (selectedOptions: any) => {
        const selectedTerms = sortedTerms.filter(term => selectedOptions.some((opt: any) => opt.value === term.id));
        setActiveTerms(selectedTerms);
        onPickTerms(selectedTerms);
    };

    return (
        <Card>
            <CardTitle className="p-3">Select Terms</CardTitle>
            <Card.Body>
                <Row>
                    <Form.Group controlId="termField">
                        <Form.Label>
                            Terms: {status === "loading" ? <Spinner animation="border" size="sm"/> : terms?.length ?? 0}
                        </Form.Label>
                        <div className="d-flex align-items-center mb-2">
                            <Form.Check
                                type="switch"
                                label="Show Ongoing Terms Only"
                                checked={showOngoingOnly}
                                onChange={() => setShowOngoingOnly(!showOngoingOnly)}
                            />
                        </div>
                        <Select
                            isMulti
                            options={sortedTerms.map(term => ({value: term.id, label: term.name}))}
                            onChange={handleSelect}
                            placeholder="Select terms..."
                        />
                    </Form.Group>
                </Row>
            </Card.Body>
        </Card>
    );
};

export const showOngoingTermsFirst = (a: ITermData, b: ITermData) => {
    const now = Date.now();

    const startA = new Date(a.start_at).getTime();
    const endA = new Date(a.end_at).getTime();
    const startB = new Date(b.start_at).getTime();
    const endB = new Date(b.end_at).getTime();

    const isOngoingA = startA <= now && now <= endA;
    const isOngoingB = startB <= now && now <= endB;

    if (isOngoingA && !isOngoingB) return -1;
    if (!isOngoingA && isOngoingB) return 1;

    return Math.abs(startA - now) - Math.abs(startB - now);
}