// x-y axis section

// for the x-y axis graph
const svgWidth = 1000, svgHeight = 600;
const margin = { top: 10, right: 20, bottom: 10, left: 20 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Select the svg element and set its viewBox and preserveAspectRatio
const svg = d3.select("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet"); // This ensures the SVG scales correctly

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
  .domain([0, 10]) // Set the x-domain to scale your data appropriately
  .range([0, width]);

  const y = d3.scaleLinear()
  .domain([0, 10]) // Reverse the domain for the y-axis
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

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data and create the dots with tooltips
d3.json('filtered_data.json').then(function(data) {
    // Create the dots with tooltip interaction
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

// Load the data and create the dots with force simulation
d3.json('filtered_data.json').then(function(data) {
    // Define a force simulation
    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => x(d.x_score)).strength(0.2))
        .force("y", d3.forceY(d => y(d.y_score)).strength(0.2))
        .force("collide", d3.forceCollide(6)); // Use a radius just larger than your dots

    // Call tick on the simulation to update positions
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






// Filters section

// Rating filter section modification
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




// Initialize selectedNeighborhoods array to track user selections
let selectedNeighborhoods = [];


// Function to dynamically generate neighborhood checkboxes after data is loaded
function generateNeighborhoodCheckboxes(data) {
    // Extract unique neighborhood names and sort them
    let neighborhoods = Array.from(new Set(data.map(d => d.neighborhood).filter(n => n && n.trim().length > 0))).sort();
  
    // Clear previous checkboxes (if any)
    const container = document.getElementById('neighborhood-filters');
    container.innerHTML = '';

    // Add the "Neighborhoods" title
    const title = document.createElement('h4');
    title.className = 'filter-title'; // Add class name here
    title.textContent = 'Neighborhoods';
    container.appendChild(title);

    // Create a div to hold the checkboxes and append it below the rating div
    const checkboxDiv = document.createElement('div');
  
    // Iterate over neighborhoods to create checkboxes
    neighborhoods.forEach(neighborhoodName => {
        const wrapper = document.createElement('div'); // Wrapper for better layout control
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

    // Append the entire checkboxDiv to the container
    container.appendChild(checkboxDiv);
}



let globalData; // Assume this is filled with data from 'filtered_data.json'

// Global variable to track the selected rating
let currentRating = 0;

// Function to update the chart based on selected rating and neighborhoods
function updateChart() {

    let filteredData = globalData;
    if (currentRating) {
        filteredData = filteredData.filter(d => d.rating >= currentRating);
    }
    
    if (selectedNeighborhoods.length) {
        filteredData = filteredData.filter(d => selectedNeighborhoods.includes(d.neighborhood));
    }

    // Redraw dots with the new filtered data
    drawDots(filteredData);
    
    // Remove existing dots
    d3.selectAll(".dot").remove();

    // Add new dots based on the filtered data
    g.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x_score))
        .attr("cy", d => y(d.y_score))
        .attr("r", 5)
        .attr("fill", "hotpink") // Or any other color
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

// Attach event listeners to rating buttons
ratings.forEach(function(rating) {
    d3.select(`.rating-button[data-rating="${rating}"]`)
        .on("click", function() {
            // Update the current rating and update the chart
            currentRating = rating;
            updateChart();
        });
});


function drawDots(filteredData) {
    // Remove existing dots
    g.selectAll(".dot").remove();

    // Add new dots based on the filtered data
    g.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x_score))
        .attr("cy", d => y(d.y_score))
        .attr("r", 5)
        .attr("fill", "hotpink") // Or any other color
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


// Attach event listeners to neighborhood checkboxes
document.getElementById('neighborhood-filters').addEventListener('change', function(event) {
    if (event.target.classList.contains('neighborhood-checkbox')) {
        const neighborhood = event.target.value;
        const checked = event.target.checked;
        // Update selected neighborhoods and update the chart
        if (checked) {
            selectedNeighborhoods.push(neighborhood);
        } else {
            selectedNeighborhoods = selectedNeighborhoods.filter(n => n !== neighborhood);
        }
        updateChart();
    }
});


// Function to initialize the filter sections with titles
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

// Call this function to initialize the filter sections when the page loads
initializeFilterSections();

// Load data, initialize globalData, and generate checkboxes
d3.json('filtered_data.json').then(function(data) {
    globalData = data;
    generateNeighborhoodCheckboxes(data);
    updateChart();
});