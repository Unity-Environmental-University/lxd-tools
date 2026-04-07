# LXD Chrome Extension

This extension is for use by Unity Environmental University Learning Experience Designers working in Canvas.

---

Source repository: https://github.com/Unity-Environmental-University/lxd-tools

---

## Installation

1. Clone this repository
   - If you have GitHub Desktop installed, select **Code** → **Open with GitHub Desktop**
   - Otherwise, select **Code** → **Download ZIP**, then extract the zip and place the folder somewhere easy to find
2. Load the extension into Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer Mode** (toggle in the top-right corner)
   - Click **Load unpacked** and select the folder where you placed the extension files

Full walkthrough: https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/

## Updating

1. If you are using GitHub Desktop, pull the latest version of this repository
2. If you downloaded a ZIP:
   - Download a fresh ZIP and extract it
   - Replace all files in your original installation folder with the new ones, keeping the same filenames
3. Go to `chrome://extensions` and click the **Update** button at the top of the page

GitHub Desktop download: https://desktop.github.com/

---

## Features

### Extension Popup

Click the extension icon in your browser toolbar (or press **Alt+Shift+F**) to open the popup panel. From here you can:

- **Search for courses** by course code and jump directly to them in Canvas
- **Filter by subaccount** (Distance Education, Distance Education Development, Unity College)
- **Open Salesforce reports** with one click:
  - Undergrad Section Check
  - Grad Section Check
  - Unique Course Offerings by Term
- **Save your OpenAI API key** (used by AI-powered features in the extension — see Advanced Options)

---

### Course Navigation Buttons

When viewing any Canvas course, the extension adds buttons to the top of the page:

| Button       | What it does                                                    |
| ------------ | --------------------------------------------------------------- |
| **DEV**      | Opens the DEV\_ version of this course in a new tab             |
| **BP**       | Opens the Blueprint version of this course in a new tab         |
| **BPs**      | Shows a list of all available Blueprint versions of this course |
| **SECTIONS** | Opens all student sections linked to this Blueprint             |

These buttons try to take you to the same page you are currently on (e.g., the same assignment or discussion) in the corresponding course version. If a matching page is not found, the course home page opens instead.

---

### Quick Course Search (Keyboard Shortcut)

Press **Alt+Shift+F** to open a quick-search dialog. You can type:

| Query               | Result                                                       |
| ------------------- | ------------------------------------------------------------ |
| `DEV_TEST000`       | Navigate directly to that course                             |
| `w2a`               | Open all assignments in Week 2                               |
| `w2q`               | Open all quizzes in Week 2                                   |
| `w2d`               | Open all discussions in Week 2                               |
| `w3d2`              | Go to the second discussion in Week 3                        |
| `w1d0`              | Go to the course Introduction (usually Week 1, Discussion 0) |
| `DEV_TEST000\|w3q1` | Go to the first quiz in Week 3 of a different course         |

---

### Links Button

On any Canvas content page (pages, assignments, discussions), a **Links** button appears in the header. Clicking it opens all external links and file links embedded in that page in new tabs at once — useful for quickly checking that all resources in a lesson are accessible.

---

### Modules Page

When viewing the Modules page of a course, the extension adds two buttons to the header:

- **Lock All** _(Blueprint courses only)_ — Locks every module item in the Blueprint with a single click. The page reloads automatically when done.
- **Adjust Due Dates** — Prompts you for a number of days, then shifts all assignment due dates in the course by that amount. Useful when copying a course to a new term.

---

### Rubric Reordering

When editing a rubric, the extension adds reordering controls to each rubric criterion row:

- **↑ / ↓ buttons** to move a criterion up or down
- **Drag and drop** rows to reorder them directly (the dragged row turns semi-transparent, and a blue border shows the drop target)

The reorder controls appear when you enter edit mode and disappear when you save or cancel.

---

### SpeedGrader — Rubric Score Exports

On the Canvas SpeedGrader page, the extension adds export buttons to the gradebook header:

| Button                  | What it exports                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Rubrics: Assignment** | Rubric scores for the current assignment → `Rubric Scores {AssignmentName}.csv`                                  |
| **Rubrics: Section**    | Rubric scores for all assignments in the course → `Rubric Scores {CourseCode}.csv`                               |
| **...** (three dots)    | Opens a date-range picker to export scores for a specific term window → `{CourseCode}-{StartDate}-{EndDate}.csv` |

A loading indicator appears while the export is being generated.

---

### Syllabus — Import Week 1 Materials

On the Course Syllabus page, an **Import Wk1 Mats** button appears above the "Week 1 Learning Materials" section. Clicking it:

1. Reads the course's "Week 1 Learning Materials" page
2. Extracts all video embeds and learning material boxes from that page
3. Replaces the existing syllabus content in that section with the imported materials
4. Resizes embedded video iframes to fit the syllabus layout

The page reloads automatically after a successful import.

---

### Large Image Warning

When editing a Canvas page that contains a banner image wider than 2000px, the extension displays a prominent warning around the image. A **Try Resize** button appears — clicking it attempts to resize the image to 1200px wide.

---

### Home Tile Image Generator

On a course's Module Home section, a **Generate Home Tiles** button appears. This tool automatically creates marketing thumbnail images for the course:

- **Use Course Image** checkbox — uses the course's banner image as the source (checked by default)
- **Module Number** field — specify a module number as the image source (use `0` for the course-level image)
- Click **Generate** to produce two image files:
  - `{CourseCode}DetailImage.png` (1920px wide)
  - `{CourseCode}ListImage.png` (600px wide)
- A **Salesforce Image Download** button is also available to extract and download course images in Salesforce-compatible formats

---

### Version Update Notice

If a newer version of the extension is available, a banner appears on Canvas course pages alerting you:

> _You are not running the latest version (X.X.X) of the extension. You are running Y.Y.Y._

Follow the [Updating](#updating) steps above to get the latest version.

---

### Admin Panel

On course Settings and publishing pages, an **Admin** button opens a modal with tools for bulk operations across multiple courses:

- **Search courses** by code or name, with filters for Blueprints, Legacy BPs, Dev copies, and Sections
- **Select and run validations** to check course content against defined standards
- **View results** showing which courses passed or failed, with direct links to each course
- **Sync Blueprint** — trigger a Blueprint sync from the server for any Blueprint course

---

### Faculty Reporting

On Canvas account/admin pages, a **Reporting** button opens a modal where you can:

- Select one or more terms
- Find all instructors active in those terms
- View a list of courses for those terms

---

## Keyboard Shortcuts

| Shortcut        | Action                                         |
| --------------- | ---------------------------------------------- |
| **Alt+Shift+F** | Open the extension popup / quick course search |
