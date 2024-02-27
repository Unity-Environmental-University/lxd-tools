import {Course, formDataify} from "../../canvas";
import assert from "assert";

(async() => {
  const course = await Course.getFromUrl(document.documentURI);
  if(!course) return;
  let header = document.querySelector('.right-of-crumbs');
  let bp = await Course.getByCode(`BP_${course.baseCode}`);
  if (!course) return;

  if(header && course && course.isBlueprint) {

    let sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Open Sections";
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => {

      let sections = await course.getAssociatedCourses();
    if (sections) sections.forEach(section => window.open(section.courseUrl));


    })
    let parentCourse = await course.getParentCourse();
    if(parentCourse) {
      let parentBtn = document.createElement('btn');

      parentBtn.classList.add('btn');
      parentBtn.innerHTML = "DEV";
      header?.append(parentBtn);

      parentBtn.addEventListener('click', async () => {
        if(parentCourse) {
          window.open(parentCourse.courseUrl);
        }
      })
    }


  } else if (bp && header) {
    assert(bp);
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    header.append(bpBtn);
    bpBtn.addEventListener('click', async () => {
      if(window) {
        window.open(bp?.courseUrl);
      }
    })

  }
  console.log(formDataify({
    a: "a",
    b : 1,
    c: {
      red: 'FF0000',
      green: '00FF00',
      blue: '0000FF',
      total: [255, 255, 0]
    },
    d: ['rabbit', 'cat', 'dog']

  }))



})();