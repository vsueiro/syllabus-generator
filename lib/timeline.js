(function () {
  class Timeline {
    constructor(days, element) {
      this.markup = ``;
      this.days = days;
      this.element = element;

      this.element.innerHTML = `
      ${legend()}
      ${chart()}`;
    }

    legend() {
      return `
        <div class="legend">
          <div>
            <div class="block" data-class="Yes"></div>
            <span>Class day</span>
          </div>
          <div>
            <div class="block" data-class="No"></div>
            <span>No class</span>
          </div>
          <div>
            <div class="block" data-event="Presentation"></div>
            <span>Presentation day</span>
          </div>
          <div>
            <div class="block" data-event="Final Exam"></div>
            <span>Final exam day</span>
          </div>
        </div>`;
    }

    chart() {
      // Get unique steps
      const steps = [...new Set(this.days.map((day) => day.Step))];

      // Begin HTML markup
      let rows = `<div class="chart rows">`;

      // For each step
      for (let step of steps) {
        // Get first day of that step
        const details = this.days.find((day) => day.Step === step);

        let blocks = ``;

        for (let day of this.days) {
          if (day.Step === step) {
            let block = `
              <a
                href="#date-${day.Date}"
                class="block"
                data-class="${day.Class}"
                data-event="${day.Event}"
                data-day="${new Date(
                  `${day.Date}T12:00:00Z`
                ).toLocaleDateString("en-us", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}"
              ></a>`;

            blocks += block;
          }
        }

        let row = `
          <div class="row">
            <div class="info">
              <p>${details.Heading}</p>
              <p>${details.Description}</p>
            </div>
            <div class="blocks">
              ${blocks}
            </div>
          </div>
        `;

        rows += row;
      }

      rows += "</div>";

      return rows;
    }
  }

  // Find all timeline placeholders
  let elements = document.querySelectorAll(".timeline");

  // For each timeline
  for (let element of elements) {
    // Get Google Spreadsheet details

    // Define API URL
    const api = "https://sheets.vsueiro.com/api/read";
    const id = element.dataset.id;
    const range = element.dataset.range;
    const json = `${api}?id=${id}&range=${range}`;

    // Load data
    fetch(json)
      .then((data) => data.json())
      .then((days) => {
        // Initialize
        new Timeline(days, element);
      });
  }
})();