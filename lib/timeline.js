function highlight(id) {
  // Get element
  const element = document.getElementById(id);

  // Apply style
  element.classList.add("highlighted");

  // Remove style after 2s
  setTimeout(function () {
    element.classList.remove("highlighted");
  }, 2000);
}

(function () {
  // Define global variable to store the data
  let days;

  // Define global variable to load the markdown parser into
  let markdown;

  class Timeline {
    constructor(days, element) {
      this.markup = ``;
      this.days = days;
      this.element = element;

      this.element.innerHTML = this.legend() + this.chart();
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
            // Get current date
            const now = new Date();

            const YYYY = now.toLocaleString("default", { year: "numeric" });
            const MM = now.toLocaleString("default", { month: "2-digit" });
            const DD = now.toLocaleString("default", { day: "2-digit" });

            // Format as YYYY-MM-DD, since now.toISOString() messes timezones
            const today = `${YYYY}-${MM}-${DD}`;

            // Create id
            const id = `date-${day.Date}`;

            // Get formatted date, like “Mon, Jan 31”
            const weekDay = new Date(
              `${day.Date}T12:00:00Z`
            ).toLocaleDateString("en-us", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            let block = `
              <a
                href="#${id}"
                class="block"
                data-today="${day.Date === today ? "Yes" : "No"}"
                data-class="${day.Class}"
                data-event="${day.Event}"
                data-day="${day.Date === today ? "Today" : weekDay}"
                onclick="highlight('${id}')"
              ></a>`;

            blocks += block;
          }
        }

        let row = `
          <div class="row">
            <div class="info">
              ${markdown.makeHtml(details.Heading)}
              ${markdown.makeHtml(details.Tagline)}
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

  class Table {
    constructor(days, step, element) {
      this.days = days;
      this.step = step;
      this.element = element;

      this.element.innerHTML = `

        ${this.heading()}

      <table>
        <thead>
          ${this.header()}
        </thead>
        <tbody>
          ${this.rows()}
        </tbody>
      </table>`;
    }

    heading() {
      // Get first day on desired step
      const details = this.days.find((day) => day.Step === this.step);

      let p = ``;

      if (details.Description) {
        p = markdown.makeHtml(details.Description);
      } else {
        p = markdown.makeHtml(details.Tagline);
      }

      return `
        <h4>${details.Heading}</h4>
        ${p}
      `;
    }

    header() {
      return `
      <tr>
        <th>Date</th>
        <th>Preparation</th>
        <th>Content</th>
        <th>Materials</th>
      </tr>
    `;
    }

    rows() {
      let rows = ``;

      for (let day of this.days) {
        if (day.Step === this.step) {
          let row = `
            <tr id="date-${day.Date}">
              <td>
                ${new Date(`${day.Date}T12:00:00Z`).toLocaleDateString(
                  "en-us",
                  {
                    // weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </td>
              <td>${markdown.makeHtml(day.Preparation) || ""}</td>
              <td>${markdown.makeHtml(day.Content) || ""}</td>
              <td>${markdown.makeHtml(day.Materials) || ""}</td>
            </tr>`;

          rows += row;
        }
      }

      return rows;
    }
  }

  // Load markdown parser
  let script = document.createElement("script");

  script.setAttribute(
    "src",
    "https://cdn.jsdelivr.net/npm/showdown@2/dist/showdown.min.js"
  );
  document.body.appendChild(script);
  script.addEventListener(
    "load",
    function () {
      // Initialize timeline and tables after dependency is loaded

      // Update global variable with instance
      markdown = new showdown.Converter();

      // Find all timeline placeholders
      let timelines = document.querySelectorAll(".timeline");

      // For each timeline
      for (let element of timelines) {
        // Get Google Spreadsheet details

        // Define API URL
        const api = "https://sheets.vsueiro.com/api/read";
        const id = element.dataset.id;
        const range = element.dataset.range;
        const json = `${api}?id=${id}&range=${range}`;

        // Load data
        fetch(json)
          .then((data) => data.json())
          .then((data) => {
            // Store data as a global variable
            days = data;

            // Initialize chart
            new Timeline(days, element);

            // Find all table placeholders
            let tables = document.querySelectorAll(".table");

            // For each timeline
            for (let element of tables) {
              const step = element.dataset.step;

              // Initialize table
              new Table(days, step, element);
            }

            // Trigger GitHub’s native heading anchors
            anchors.add();
          });
      }
    },
    false
  );
})();
