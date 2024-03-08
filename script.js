// x-y axis section

// for the x-y axis graph
const svgWidth = 1000, svgHeight = 600;
const margin = { top: 10, right: 20, bottom: 10, left: 20 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// select svg element and set its viewbox
const svg = d3.select("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet"); // This ensures the SVG scales correctly

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// score and x/y axis position
const x = d3.scaleLinear()
  .domain([0, 10])
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, 10])
  .range([0, height]);

// x and y axis labels
const xAxis = d3.axisBottom(x)
  .tickFormat(d => d === 0 ? 'Western' : d === 10 ? 'Eastern' : '');

const yAxis = d3.axisLeft(y)
  .tickFormat(d => d === 0 ? 'Light' : d === 10 ? 'Heavy' : '');

g.append("g")
  .attr("transform", `translate(0,${height / 2})`)
  .call(xAxis)
  .append("text")
  .attr("y", margin.bottom)
  .attr("x", width)
  .attr("text-anchor", "end")
  .text("Eastern");

g.append("g")
  .attr("transform", `translate(${width / 2},0)`)
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "-3.5em")
  .attr("text-anchor", "end")
  .text("Light");


// create tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data and create dots with tooltips
d3.json('filtered_data.json').then(function(data) {
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x_score))
      .attr("cy", d => y(d.y_score))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .on("mouseover", function(event, d) {
          tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
          tooltip.html(d.name)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
      });
});

// create dots with force simulation
d3.json('filtered_data.json').then(function(data) {
    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => x(d.x_score)).strength(0.2))
        .force("y", d3.forceY(d => y(d.y_score)).strength(0.2))
        .force("collide", d3.forceCollide(6));

    // call tick on the simulation to update positions
    simulation.on("tick", () => {
        g.selectAll(".dot")
          .data(data)
          .join("circle")
          .attr("class", "dot")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 5)
          .attr("fill", "hotpink");
    });
});





// filters section

// to track user selected neighborhoods
let selectedNeighborhoods = [];

let globalData;

// to track the selected rating
let currentRating = 0;


// rating filter section
const ratingDiv = d3.select("#filters").append("div").attr("id", "rating-filters");
const ratings = [3.5, 4, 4.5];

ratings.forEach(function(rating) {
    ratingDiv.append("button")
        .attr("class", "rating-button")
        .attr("data-rating", rating)
        .html(`${rating} Stars`)
        .on("click", function() {
            updateChart(rating);
        });
});


// dynamically generate neighborhood checkboxes after data is loaded
function generateNeighborhoodCheckboxes(data) {
    // get neighborhood names & sort
    let neighborhoods = Array.from(new Set(data.map(d => d.neighborhood).filter(n => n && n.trim().length > 0))).sort();
  
    // clear previous checkboxes
    const container = document.getElementById('neighborhood-filters');
    container.innerHTML = '';

    // "Neighborhoods" title
    const title = document.createElement('h4');
    title.className = 'filter-title'; // Add class name here
    title.textContent = 'Neighborhoods';
    container.appendChild(title);

    // neighborhood section
    const checkboxDiv = document.createElement('div');
  
    // create checkboxes for neighborhoods
    neighborhoods.forEach(neighborhoodName => {
        const wrapper = document.createElement('div'); // wrapper for better layout control
        wrapper.className = 'filter-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'neighborhood-checkbox';
        checkbox.value = neighborhoodName;
        checkbox.id = 'checkbox-' + neighborhoodName;

        const label = document.createElement('label');
        label.htmlFor = 'checkbox-' + neighborhoodName;
        label.textContent = neighborhoodName;
  
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        checkboxDiv.appendChild(wrapper);
    });

    // append to container
    container.appendChild(checkboxDiv);
}


// update chart based on selected rating and neighborhoods
function updateChart() {

    let filteredData = globalData;
    if (currentRating) {
        filteredData = filteredData.filter(d => d.rating >= currentRating);
    }
    
    if (selectedNeighborhoods.length) {
        filteredData = filteredData.filter(d => selectedNeighborhoods.includes(d.neighborhood));
    }

    // redraw dots with new filtered data
    drawDots(filteredData);
    
    // remove existing dots
    d3.selectAll(".dot").remove();

    // add new dots based on filtered data
    g.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x_score))
        .attr("cy", d => y(d.y_score))
        .attr("r", 5)
        .attr("fill", "hotpink")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(d.name)
                   .style("left", (event.pageX) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
        });
}

// attach event listeners to rating buttons
ratings.forEach(function(rating) {
    d3.select(`.rating-button[data-rating="${rating}"]`)
        .on("click", function() {
            // update current rating & chart
            currentRating = rating;
            updateChart();
        });
});


function drawDots(filteredData) {
    // remove existing dots
    g.selectAll(".dot").remove();

    // add new dots based on the filtered data
    g.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x_score))
        .attr("cy", d => y(d.y_score))
        .attr("r", 5)
        .attr("fill", "hotpink")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(d.name)
                   .style("left", (event.pageX) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
        });
}


// attach event listeners to neighborhood checkboxes
document.getElementById('neighborhood-filters').addEventListener('change', function(event) {
    if (event.target.classList.contains('neighborhood-checkbox')) {
        const neighborhood = event.target.value;
        const checked = event.target.checked;
        // update selected neighborhoods & chart
        if (checked) {
            selectedNeighborhoods.push(neighborhood);
        } else {
            selectedNeighborhoods = selectedNeighborhoods.filter(n => n !== neighborhood);
        }
        updateChart();
    }
});


// initialize filter sections with titles
function initializeFilterSections() {
    const ratingTitle = document.createElement('div');
    ratingTitle.className = 'filter-title';
    ratingTitle.textContent = 'Rating';
    document.getElementById('rating-filters').prepend(ratingTitle);

    const neighborhoodTitle = document.createElement('div');
    neighborhoodTitle.className = 'filter-title';
    neighborhoodTitle.textContent = 'Neighborhoods';
    document.getElementById('neighborhood-filters').prepend(neighborhoodTitle);
}

// initialize filter sections when the page loads
initializeFilterSections();

// load data, initialize global data, generate checkboxes
d3.json('filtered_data.json').then(function(data) {
    globalData = data;
    generateNeighborhoodCheckboxes(data);
    updateChart();
});