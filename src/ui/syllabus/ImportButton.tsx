import {Button} from "react-bootstrap";
import {useState} from "react";
import {handleImportClick} from "@/ui/syllabus/handleImportClick";

export function ImportButton({name = "Import Wk1 Mats", useSlug = false}) {
    const [loading, setLoading] = useState(false);
    let title = "Import the Week 1 Learning mats into the syllabus"
    if (useSlug){
        title = "Choose a page to import into the syllabus"
    }

    return (
        <Button 
            title={title}
            disabled={loading}
            onClick={async e => {
                setLoading(true);
                let slug:string | null = "week-1-learning-materials"
                if(useSlug){
                    slug = prompt("This tool will grab videos & dropdowns from the page with the slug you enter, if present. A page slug is between 'pages/' and the first '?'\n\nExample: https://unity.instructure.com/courses/7740758/pages/week-1-learning-materials-and-overview?module_item_id=136520398 has slug week-1-learning-materials-and-overview")
                    if(slug === null){
                        setLoading(false)
                        return;
                    }
                }
                    console.log("Import Syllabus clicked", e);
                if(slug){
                    await handleImportClick(slug);
                }
                else{
                    await handleImportClick();
                }
                console.log("About to reload");
                location.reload();  
            }}
        >
            {loading ? "..." : name}
        </Button>
    );
}
// TODO there might be some edge cases for lmats pages that don't use a dropdown?
// TODO users might prefer a carousel over listing the videos out?
// TODO replace stock line with titles of the dropdowns from the lmats page