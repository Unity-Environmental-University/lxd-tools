import {Button} from "react-bootstrap";


export function ImportButton() {
    return (
        <Button 
            title={"Import the Week 1 Learning mats into the syllabus"}
            onClick={e => console.log("Import Syllabus clicked", e)}
        >
            Import Wk1 Mats
        </Button>
    );
}