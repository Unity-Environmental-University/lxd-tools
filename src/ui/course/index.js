import {Course} from "../../canvas";

(async() => {
  const course = await Course.getFromUrl(document.documentURI);
  let header = document.querySelector('.right-of-crumbs');
  let bp = await Course.getByCode(`BP_${course.baseCode}`);

  if (course.isBlueprint) {

    let sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Open Sections";
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => {

      let sections = await course.getAssociatedCourses();
      sections.forEach(section => window.open(section.courseUrl));

    })
    let parentBtn = document.createElement('btn');
    parentBtn.classList.add('btn');
    parentBtn.innerHTML = "DEV";
    header.append(parentBtn);
    parentBtn.addEventListener('click', async () => {

      let parentCourse = await course.getParentCourse();
      window.open(parentCourse.courseUrl);
    })
  } else {
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    header.append(bpBtn);
    bpBtn.addEventListener('click', async () => {
      if(window) {
        window.open(bp.courseUrl);
      }
    })

  }




})();