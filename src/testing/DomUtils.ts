export const paraify = (text: string) => `<p>${text}</p>`;
const fakeSyllabusSection = (header: string, ...lines: string[]) => `<div>
    <h3>${header}</h3>
    ${lines.map(t => `<p>${t}</p>`).join('')}
</div>`.replace(/\n\s+/g, '');
export const beforeAndAfterSet = (sectionName: string, beforeSections: string[], afterSections: string[]) => [
    [
        fakeSyllabusSection("Another Normal Section", "yaddaYaddaYadda"),
        fakeSyllabusSection(sectionName, ...beforeSections),
        fakeSyllabusSection("NotTheRightHeader", "...")
    ].join('').replace(/\n\s*/g, ''),
    [
        fakeSyllabusSection("Another Normal Section", "yaddaYaddaYadda"),
        fakeSyllabusSection(sectionName, ...afterSections),
        fakeSyllabusSection("NotTheRightHeader", "...")
    ].join('').replace(/\n\s*/g, '')
] as [string, string]