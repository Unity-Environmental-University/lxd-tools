import assert from "assert";
import {IUserData} from "./canvasDataDefs";
import {parentElement} from "./canvasUtils";

import {Course} from "./course/Course";
import {Account} from "@/canvas/Account";
import {getSingleCourse} from "@/canvas/course";
import {Page} from "@/canvas/content/assignments/pages/Page";


let facultyCourseCached: Course;

export interface IProfile {
    user?: IUserData,
    bio?: string | null,
    displayName?: string | null,
    image?: HTMLImageElement | null,
    imageLink?: string | null,
    sourcePage?: Page | null,

}

export interface IProfileWithUser extends IProfile {
    user: IUserData
}

async function getFacultyCourse() {
    const facultyCourse = facultyCourseCached ?? await getSingleCourse('Faculty Bios', (await Account.getAll()).map(a => a.id));
    facultyCourseCached = facultyCourse;
    assert(facultyCourse);
    return facultyCourse;
}

export async function getFacultyPages(searchTerm: string) {
    const facultyCourse = await getFacultyCourse();
    return await facultyCourse.getPages({
        queryParams: {
            include: ['body'],
            search_term: searchTerm
        }
    })
}

async function getPotentialFacultyProfiles(user:IUserData) {
    let pages: Page[] = [];
    const [lastName, firstName] = user.name.split(' ')
    for(let query of [
        user.name,
        lastName,
        firstName,
    ]) {
        console.log(query);
        pages = await getFacultyPages(query);
        if(pages.length > 0) break;
    }

    let profiles = pages.map((page) => getProfileFromPage(page, user), true)

    if(profiles.length > 0) {
        for(let profile of profiles) {
            profile.displayName ??= user.name;
        }
    }
    return profiles;
}

export function getProfileFromPage(page:Page, user:IUserData) {
    const profile = getProfileFromPageHtml(page.body, user);
    profile.sourcePage = page;
    return profile;
}

function getProfileFromPageHtml(html:string, user: IUserData) {
    const el = document.createElement('div')
    el.innerHTML = html;

    const displayName = getDisplayName(el);
    const body = getProfileBody(el);
    const image = getImageLink(el);

    return {
        user,
        bio: body,
        displayName,
        image,
        imageLink: image?.src,
    } as IProfileWithUser
}
function getProfileBody(el:Element) {
    const h4s = el.querySelectorAll('h4');
    const instructorHeaders = Array.from(h4s).filter((el) => {
        return el.innerHTML.search(/instructor/i)
    })
    let potentials:string[] = [];
    for(let header of instructorHeaders) {
        const potentialParent = header.parentElement;
        if(potentialParent) {
            header.remove();
            potentials.push(potentialParent.innerHTML);
        }
    }

    potentials = winnow(potentials, [
        (potential) => potential.length > 0,
    ]);

    /* just guess if we can't find anything */
    if (potentials.length > 0) {
        return potentials[0];
    }
    return null;
}

function getDisplayName(el:Element) {
    let titles = Array.from(el.querySelectorAll('strong em'));

    if (titles.length === 0) {
        let enclosedImages = Array.from(el.querySelectorAll('p img'));

        titles = enclosedImages.map((el) => parentElement(el, 'p')?.nextElementSibling)
            .filter((el) => el instanceof Element) as Element[];
    }

    if (titles.length === 0) {
        let headings = Array.from(el.querySelectorAll('p strong'));
        let instructorHeaders = headings.filter(el => el.innerHTML.search(/Instructor/));
        titles = instructorHeaders.map((el) => el.previousElementSibling)
            .filter((el) => el instanceof Element) as Element[]
    }

    titles = titles.filter((title) => title.textContent && title.textContent.length > 0)
    if (titles.length > 0) return titles[0].textContent;
    return null;
}

/**
 * Finds all the image links in the content and returns the biggest.
 * @param el
 */
function getImageLink(el:Element) {
    let imgs = el.querySelectorAll('img');
    if(imgs.length === 0) return null;
    return Array.from(imgs)[1];
}

type WinnowFunc<T> = ((value:T, number?: number, array?: T[])=>boolean);
/**
 * Takes in a list of parameters and a set of filter functions. Runs filter functions until there are one or fewer elements,
 * or it runs out of filter functions. Returns post-filtered list.
 * @param originalList The list of items to run
 * @param winnowFuncs A list of filter functions, run in order
 * @param returnLastNonEmpty If true, will return the last non-empty array found if elements are winnowed to 0
 */
function winnow<T=string>(originalList: T[], winnowFuncs: WinnowFunc<T>[], returnLastNonEmpty=false) {
    let copyList = [...originalList];
    if(copyList.length === 1) return copyList; //already at 1 element
    let lastSet = [...copyList];
    for(let winnowFunc of winnowFuncs) {
        lastSet = [...copyList];
        copyList = copyList.filter(winnowFunc);
        if(copyList.length === 1) break;
    }
    if(copyList.length === 0 && returnLastNonEmpty) return lastSet;
    return copyList;
}

function getCurioPageFrontPageProfile(html:string, user?: IUserData):IProfile {
    const el = document.createElement('div');
    el.innerHTML = html;
    const header = getCurioHeader(el);
    const match = header.innerHTML.match(/Meet your instructor, ?(.*)!/i);
    const displayName = match ? match[1] : null;
    const bio = getCurioBio(el);
    const image = getCurioProfileImage(el);
    return {
        user,
        displayName,
        image,
        imageLink: image ? image.src : null,
        bio: bio?.innerHTML
   }
}

export function frontPageBio(profile:IProfile & {user:IUserData}) {
    return profile.bio + `<p>${profile.displayName} should be contacted during the term using Canvas Inbox,
 but can be reached after and before the term via their email address: ${profile.user.email}</p>`
    
}

export function renderProfileIntoCurioFrontPage(html: string, profile: IProfile & {user:IUserData}) {
    const el = document.createElement('div');
    el.innerHTML = html;
    if(profile.displayName) {
        const header = getCurioHeader(el);
        header.innerHTML = `Meet your instructor, ${profile.displayName}!`
    }

    if(profile.bio) {
        const bio = getCurioBio(el);
        if(bio) {
            const classes = bio.classList;
            if(!classes.contains('cbt-instructor-bio')) classes.add('cbt-instructor-bio')
            bio.innerHTML = frontPageBio(profile);
        }
    }

    if(profile.image) {
        const image = getCurioProfileImage(el);
        if(image) {
            image.src = profile.image.src;
            image.alt = profile.image.alt;
        }
    } else if (profile.imageLink) {
        const image = getCurioProfileImage(el);
        if(image) {
            image.src = profile.imageLink;
        }
    }
    return el.innerHTML;
}

function getCurioHeader(el:Element) {
    let h2s = Array.from(el.querySelectorAll('h2'));
    h2s = h2s.filter((h2) => h2.innerHTML.match(/Meet your instructor/i));
    assert(h2s.length === 1, "Can't find bio section of front page.");
    return h2s[0];

}
function getCurioProfileDiv(el:Element) {
    const header = getCurioHeader(el);
    const sectionEl = header.nextElementSibling;
    assert(sectionEl, "Body element of bio not found on page.")
    return sectionEl;

}

function getCurioBio(el:Element) {
    const profileDiv = getCurioProfileDiv(el);
    let bio = profileDiv.querySelector('.cbt-instructor-bio');
    if(bio && bio.innerHTML) return bio;
    let div = getCurioProfileDiv(el);
    const p = div.querySelector('p');
    return p?.parentElement;


}

function getCurioProfileImage(el:Element) {
    return getCurioProfileDiv(el).querySelector('img');

}

export {
    getPotentialFacultyProfiles,
    getCurioPageFrontPageProfile,
    winnow
}