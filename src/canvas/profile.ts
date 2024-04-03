import assert from "assert";
import {IUserData} from "./canvasDataDefs";
import {Course, Page} from "./index";


let facultyCourseCached: Course | null = null;

async function getFacultyCourse() {
    const facultyCourse = facultyCourseCached ?? await Course.getByCode('Faculty Bios');
    facultyCourseCached = facultyCourse;
    assert(facultyCourse);
    return facultyCourse;
}

async function getFacultyPages(searchTerm: string) {
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

    let profiles = pages.map((page) => getProfileFromPageHtml(page.body, user), true)
    // profiles = winnow(profiles, [
    //     (profile) => profile.body !== null,
    //     (profile) => profile.displayName != null,
    //     (profile) => profile.imageLink != null,
    // ])

    if(profiles.length > 0) {
        for(let profile of profiles) {
            profile.displayName ??= user.name;
        }
    }
    return profiles;
}

export interface IProfile {
    user: IUserData,
    body?: string | null,
    displayName?: string | null,
    image?: HTMLImageElement | null,
    imageLink?: string | null
}

function getProfileFromPageHtml(html:string, user: IUserData): IProfile {
    const el = document.createElement('div')
    el.innerHTML = html;

    const displayName = getDisplayName(el);
    const body = getProfileBody(el);
    const image = getImageLink(el);

    return {
        user,
        body,
        displayName,
        image,
        imageLink: image?.src
    }
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
 */
function winnow<T=string>(originalList: T[], winnowFuncs: WinnowFunc<T>[], returnLastNonEmptySet=false) {
    let copyList = [...originalList];
    if(copyList.length === 1) return copyList; //already at 1 element
    let lastSet = [...copyList];
    for(let winnowFunc of winnowFuncs) {
        lastSet = [...copyList];
        copyList = copyList.filter(winnowFunc);
        if(copyList.length === 1) break;
    }
    if(copyList.length === 0 && returnLastNonEmptySet) return lastSet;
    return copyList;
}

function parentElement(el:Element, tagName:string) {
  while (el && el.parentElement) {
      el = el.parentElement;
      if (el.tagName && el.tagName.toLowerCase() == tagName) {
          return el;
      }
  }
}

export { getPotentialFacultyProfiles, winnow }