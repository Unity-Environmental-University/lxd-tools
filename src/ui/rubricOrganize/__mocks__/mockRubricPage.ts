
export function createMockRubricPage(document: Document = window.document): HTMLElement {
  // Create main container
  const rubrics = document.createElement('div');
  rubrics.id = 'rubrics';
  rubrics.className = 'raw_listing';

  // Create rubric container
  const rubricContainer = document.createElement('div');
  rubricContainer.id = 'rubric_4824290';
  rubricContainer.className = 'rubric_container rubric editing';

  // Create rubric title section
  const rubricTitle = document.createElement('div');
  rubricTitle.className = 'rubric_title';

  // Title input
  const titleLabel = document.createElement('label');
  titleLabel.className = 'rubric-title-label';
  titleLabel.innerHTML = `
    Title:
    <input 
      id="rubric-title" 
      type="text" 
      class="no-margin-bottom" 
      name="title" 
      value="Week 3 Discussion: Redox and Enjoy the View" 
      style="width: 200px;" 
      maxlength="255"
    >
  `;
  rubricTitle.appendChild(titleLabel);

  // Create rubric table
  const table = document.createElement('table');
  table.className = 'rubric_table';

  // Create table head
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th scope="col">Criteria</th>
      <th scope="col">Ratings</th>
      <th scope="col" class="toggle_for_hide_points">Pts</th>
    </tr>
  `;

  // Create table body with criteria
  const tbody = document.createElement('tbody');
  const criteriaData = [
    {
      id: '_5575',
      title: 'Initial Post',
      description: 'Detailed description of initial post requirements',
      longDescription: `
        -identifies natural redox reaction
        -discusses how chosen redox reaction functions
        -includes reaction's complete balanced equation
        -includes picture of reaction
        -Integrates sources relevant to the discussion and cites using APA style in-text citations with a reference section.
        -Uses at least one learning material and one additional source
      `
    },
    // Add more criteria as needed
  ];

  criteriaData.forEach(criteria => {
    const criterionRow = document.createElement('tr');
    criterionRow.id = `criterion${criteria.id}`;
    criterionRow.className = 'criterion';
    criterionRow.innerHTML = `
      <td class="criterion_description hover-container pad-box-micro">
        <div class="criterion_description_container">
          <div class="description_content">
            <span role="text">
              <span class="description description_title">${criteria.title}</span>
              <div class="long_description small_description">${criteria.longDescription}</div>
            </span>
          </div>
          <div class="links editing">
            <a href="#" class="edit_criterion_link" role="button">
              <i class="icon-edit standalone-icon"></i>
              <span class="screenreader-only">Edit criterion description</span>
            </a>
            <a href="#" class="delete_criterion_link" role="button">
              <i class="icon-trash standalone-icon"></i>
              <span class="screenreader-only">Delete criterion row</span>
            </a>
          </div>
        </div>
      </td>
      <td style="padding: 0;" aria-label="criterion ratings">
        <div class="ratings">
          <!-- Ratings content can be added here if needed -->
        </div>
      </td>
      <td class="toggle_for_hide_points">
        <input type="text" class="criterion_points" value="10">
      </td>
    `;
    tbody.appendChild(criterionRow);
  });

  // Assemble the table
  table.appendChild(thead);
  table.appendChild(tbody);

  // Create save button
  const saveButton = document.createElement('button');
  saveButton.className = 'btn save_button btn-primary';
  saveButton.textContent = 'Save Rubric';

  // Assemble the entire structure
  rubricContainer.appendChild(rubricTitle);
  rubricContainer.appendChild(table);
  rubricContainer.appendChild(saveButton);
  rubrics.appendChild(rubricContainer);

  return rubrics;
}

// Optional: Create a function to inject the mock rubric into the document
export function injectMockRubric(document: Document = window.document): HTMLElement {
  const mockRubric = createMockRubricPage(document);
  document.body.appendChild(mockRubric);
  return mockRubric;
}