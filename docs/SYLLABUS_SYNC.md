# Syllabus Sync

Syllabus Sync brings a course's syllabus up to date with the current syllabus template while keeping everything that belongs to the course. Use it when updating a course to keep the syllabus current.

It is the **Sync Syllabus** button next to the **Update Start Date** button.

> ### Summary
>
> **Using Sync**
>
> 1. Click **Sync Syllabus** in the Content Fixes window. A green "synced successfully" box appears and clears itself; a blue box stays.
> 2. Open the syllabus (**View syllabus**) and look it over.
> 3. If something is wrong, click **Undo sync** (in the blue box or at the top of the syllabus page). If it looks right, click **Looks good**.
> 4. Sync replaces everything except the course specific information.
> 5. Undo only works from the same browser, for the most recent sync, within 7 days. If a red error box appears instead, nothing was changed; see [If an error message appears](#if-an-error-message-appears).
>
> **Editing the course information table** (in the syllabus editor, at the top of the page)
>
> - **Edit the table, not the syllabus text.** The text on the page is filled in from the table, so anything typed over it is lost.
> - Don't rename, add, or delete rows. The left column names (`course-title`, `textbook`, and so on) are how values are found.
> - **Lists are typed on one line with `|` between items.** Outcomes become a numbered list (don't type the numbers); the textbook becomes a bulleted list when it has more than one item.
> - **`||` and `|||` make sub-bullets** (textbook only): `Lab kit | Supplies || Gloves || Goggles`.
> - A `|` can't be part of an item's text; use a dash or comma.
> - **Links, bold, and italics work in the textbook only.** Links must start with `http://`, `https://`, or `mailto:`. Everything else shows as plain text.
> - Term and dates are updated by the **Update Start Date** tool, so they rarely need typing by hand.

## What it does

Sync takes the template syllabus (undergraduate, graduate, or Career Edge) and rebuilds the syllabus from it. All course-specific information is retained:

| Kept from the DEV course | Where it lives |
| --- | --- |
| The **course information table** (title, term, dates, credits, description, outcomes, textbook) | A table at the top of the syllabus, see below |
| The **banner image** | The image at the top of the syllabus |
| The **Instructor Name: See Homepage** line | The first box, with the link to the course's own home page |
| The **Week 1 Learning Materials Preview** box | Its own box lower in the syllabus |

Anything else in the syllabus outside those four places is replaced by the template's version.

## Before syncing

The syllabus must already have the course specific data table(only visible in edit mode) and have a **Week 1 Learning Materials Preview** box. If either is missing, sync can't tell which parts belong to the course and stops without changing anything.

Skim the syllabus once beforehand to know what to compare against afterward.

## What to expect

1. Click **Sync Syllabus**.
2. After a moment, a green box at the top of the window says **"Syllabus synced successfully."** It clears itself after a few seconds. A blue box stays below it (see [Undoing a sync](#undoing-a-sync)).
3. Open the syllabus page and refresh it. The template's current wording should be there, with the course's title, term, dates, credits, description, outcomes, textbook, banner image, and Week 1 materials in place.

Check each of those spots. A missing value or anything that looks off will show up here (see [Editing course information](#editing-course-information)).

## Undoing a sync

Sync saves to Canvas right away, and Canvas doesn't keep a version history for syllabi. To make a bad result recoverable, Sync keeps a copy of the previous syllabus in the browser that ran the sync.

After a sync:

1. A box above the Sync button says when Sync ran and offers **View syllabus** (opens in a new tab), **Undo sync**, and **Dismiss**.
2. The syllabus page shows a similar box at the top, with **Undo sync** and **Looks good**. Look the syllabus over. If something is wrong, click **Undo sync** and the syllabus returns to how it was before the sync. If it looks right, click **Looks good** to clear the box.

Things to know:

- Only the most recent sync is kept. Syncing another course replaces the copy.
- The copy is kept in the browser that ran the sync. It isn't available from another computer or browser profile, and clearing the browser's site data deletes it.
- It is deleted automatically after 7 days, or as soon as **Looks good** or **Dismiss** is clicked.
- If the syllabus was edited after the sync, Undo says so and asks before continuing, because undoing discards those edits.
- If the message says undo isn't available, the browser couldn't save the copy.

## Editing course information

The course information table holds the details that are different for every course. Students see these values filled in as part of the syllabus (title and term in the top box, the description and outcomes under their headings, the textbook list under Textbook). The table itself is hidden from students.

**To change one of these details, edit the table, not the syllabus text.** The words on the syllabus page are filled in from the table when the page loads, so anything typed over them in the page is lost the next time the page loads or the syllabus is synced.

### Finding the table

Open the syllabus, click **Edit**, and look at the top of the page. The table has two columns: a name on the left and the course's value on the right.

| Left column (don't change) | What goes in the right column |
| --- | --- |
| `course-title` | Course number and title, e.g. `BIOL 201: Ecology` |
| `course-term` | The term code, e.g. `DE5W11.16.26` |
| `course-dates` | The class dates, e.g. `November 16 - December 20` |
| `credits` | A number, e.g. `3` |
| `course-description` | The course description, as plain text |
| `course-outcomes` | The outcomes, separated by `\|` (see below) |
| `textbook` | The textbook and required materials (see below) |

Do not rename the names in the left column, add rows, or delete rows. The syllabus finds each value by that name.

Term and dates are also updated by the **Update Start Date** tool, so they rarely need to be typed by hand.

### The quirks

**Lists use the pipe character `|`.** A table cell can't hold a bulleted list, so lists are typed on one line with `|` between the items. The syllabus turns them into a real list when it displays.

- **Outcomes** become a *numbered* list. `Define key terms | Analyze a data set | Design an experiment` displays as items 1, 2, and 3. Don't type the numbers.
- **Textbook** becomes a *bulleted* list when there is more than one item. A single item is shown as plain text, not a list.
- A `|` can't be used inside an item, because it is read as a break between items. Use a dash or a comma instead.
- Spaces around the `|` don't matter.

**Sub-bullets use `||` and `|||`.** More pipes mean a deeper level. The number of pipes is how far in the item sits: `|` is a top-level item, `||` is indented one level, `|||` is indented two.

```
Lab kit: order form | Required supplies || Gloves || Goggles | Textbook
```

displays as:

- Lab kit: order form
- Required supplies
  - Gloves
  - Goggles
- Textbook

An item can only be one level deeper than the item before it. Nesting is for the textbook only; outcomes are always one flat numbered list.

**Links work in the textbook, and only there.** Add links in the textbook cell as usual (with the link button in the editor). Bold and italics are kept too. Links must start with `http://`, `https://`, or `mailto:`. In the description and outcomes, links and formatting are removed and only the text is shown.

**Keep it simple.** The cells show plain text (plus links, bold, and italics in the textbook). Colors, font sizes, images, and other formatting aren't carried over, so there is no point in adding them.

**An empty cell shows nothing.** If a value is missing, its spot on the syllabus is blank rather than showing an error. If part of the syllabus looks empty, check that its row in the table has a value.

**Hidden from students, visible to editors.** The table doesn't appear when the syllabus is displayed, but it is visible in the editor.

## If an error message appears

A failed sync shows a red **Syllabus sync failed** box at the top of the window, above the **Show All Tests** button. It says what went wrong and that the syllabus was not changed. Sync never writes a partial result, and no undo backup is kept for a failed sync.

The box has two buttons: **Copy details** copies the course name and id, the time, and the error text, which is what to send to Learning Technology if the problem can't be fixed from the table below. **Dismiss** closes the box.

| Message | What it means | What to do |
| --- | --- | --- |
| **This course's syllabus is missing its course meta table (table[data-course-meta]) and/or "Week 1 Learning Materials Preview" box. Nothing was changed.** | The syllabus doesn't have the course information table, the Week 1 Learning Materials Preview box, or both (the message lists which). Sync needs both to know what belongs to the course. | Open the syllabus in edit mode. Check that the course information table is at the top and that the box titled **Week 1 Learning Materials Preview** is there and spelled that way. If either is missing, add it (or ask Learning Technology to migrate the syllabus), then try again. |
| **Couldn't find this course's syllabus.** | The course's syllabus is empty or couldn't be loaded. | Open the syllabus page and make sure it has content. If it's empty, paste a saved copy back in (or copy one from a similar course), then try again. If it has content, refresh and try again. |
| **Couldn't find the template syllabus (template course ...).** | The template course for this type of course has no syllabus (or it couldn't be read). The number is the template course's id. | Nothing is wrong with the course. Send the message to Learning Technology so the template can be checked. |
| **No template course found.** | The tool couldn't tell whether this is an undergraduate, graduate, or Career Edge course, so it doesn't know which template to use. | Check the course code in the course's name or settings. If it looks right, tell Learning Technology. |
| **Error changing syllabus in course: ...** followed by other text | Canvas refused or failed the save, often a permissions or network problem. | Refresh the page and try once more. If it fails again, use **Copy details** and send it to Learning Technology. The syllabus should be unchanged, but check it before moving on. |
| Any other text in the red box | An unexpected problem while loading the course, the template, or the syllabus. | Refresh and try once more. If it fails again, use **Copy details** and send it to Learning Technology. |

### After a sync, something looks wrong

- **A value is missing or wrong** (title, dates, outcomes, textbook). Edit it in the course information table as described above. The table is the single source for those values.
- **The Instructor Name link goes to the wrong course.** Open the syllabus in edit mode and set the link on that line to the course's home page.
- **Something that was in the syllabus is gone.** Only the four kept parts survive a sync. Use **Undo sync** (see above) to restore the previous syllabus, or add the content back.
- **A list looks flat when sub-bullets were expected, or `|` characters show on the page.** The theme may not have loaded yet(though it's pretty dependable); refresh once. If `||` still shows as plain text, tell Learning Technology.
