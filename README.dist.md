# LXD Chrome Extension Distribution  


This is for use by Unity Environmental University Learning Experience Designers.

-----
Src repository at https://github.com/Unity-Environmental-University/lxd-tools

-----

## Installation
1) Clone this repository
   * If you have installed gitHub Desktop (link below), select "Code" and "Open with GitHub Desktop"
   * If you are not using gitHub Desktop, select "Code" and "Download Zip"
   * Extract the zip and place the folder somewhere easily memorable and accessible
3) Follow these instructions to load an unpacked extension: https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/
   * If you cloned this repository instead of downloading and extracting the zip, select _this folder_ (the one you cloned the repository in, where this file is now) when loading the unpacked extension

## Updating

1) If you are using git/gitHub, pull the latest version of this repository
2) If you are not, follow these steps:
   * Select "Clone" and "Download Zip"
   * Unzip the downloaded folder and replace all filed in the folder where you first installed these tools. *Make sure the replacements have the same exact name as the original files*
2) Go to chrome://extensions and click the "Update" button at the top of the page.

You can find gitHub Desktop here: https://desktop.github.com/

## Usage

### Quick Course Search
Press alt-shift-f to open a dialog window where you can type the course code (e.g. DEV_TEST000) to go to a specific course.

You can also open all assignments within a week of the course by typing w[week number]a.
So, w2a would open all assignments in week2.
You can replace the 'a' with a 'q' for quizzes, and a 'd' for discussions.

You can navigate to a specific assignment by typing its number after. So, w3d2 would go to the second discussion in week 3.

The introduction should almost always be w1d0.

You can go to a specific assignment in a different course by typing:
[course code]|[wXaY]

For example, **DEV_TEST000|w3q1** would go to the first quiz in week 3 of DEV_TEST000
### Course Navigation Buttons

Each course now has several buttons at the top to take you to different versions of the course.

**DEV** - Opens the DEV_ version of the course

**BP** - Opens the BP_ version

**SECTIONS** - Opens all sections currently associated with the BP

Each of these buttons will attempt to open the assignment or page you are currently on in the corresponding course.
So, for example, clicking the DEV button on the Course Project Overview of a section should open the Course Project Overview
in the DEV course. If the corresponding item can not be found, the front page of the course will be opened.