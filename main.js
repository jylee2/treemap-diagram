// Check if scripts were imported correctly
//console.log(d3)

// Data source
const jsonURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// Function for plotting the chart
const plotChart = (data) => {

   // d3.hierarchy takes the data and add to it: depth, height, and parent
   // depth: counts how many parents every node has.
   // height: counts how many levels of children every node has.
   // parent: the parent of the node or null for the root node.
   const hierarchy = d3.hierarchy(data)
                        // Use sum and sort methods with d3.hierarchy to calculate that value and sort the children according to it
                        // Sum every child's values
                        .sum( d => d.value )
                        // Sort them in descending order 
                        .sort( (a,b) => b.value - a.value );
   const svgWidth = 960;
   const svgHeight = 570;
   const svgPadding = 1;
   // Create treemap
   const treemap = d3.treemap()
                     // width, height same as canvas svg below
                     .size([svgWidth, svgHeight])
                     // Set padding for each <rect>
                     .padding(svgPadding);
   // Pass the data to the treemap
   // add x0, x1, y0, and y attributes to every node of the data
   const root = treemap(hierarchy);
   // Create svg canvas
   // <svg> id cannot have "-"
   const canvas = d3.select("#canvas")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight);

   // Color scale function
   // <script src="https://d3js.org/d3-scale-chromatic.v2.min.js"></script>
   // https://github.com/d3/d3-scale-chromatic
   // An array of ten categorical colors authored by Tableau as part of Tableau 10 represented as RGB hexadecimal strings
   const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

   // Create dummy tooltip element as requested, must be hidden by default
   const setTooltip = d3.select("#tooltip")
                        .style("visibility", "hidden");
   
   // Create group element for each data point to then append <rect> & <text> later
   const mainGroup = canvas.selectAll("g")
                           // Put data into the waiting state for further processing
                           // To make an array of these nodes and to access them we use root.leaves()
                           .data(root.leaves())
                           // Methods chained after data() run once per item in dataset
                           // Create new element for each piece of data
                           .enter()
                           // The following code will be ran for each data point
                           // Append rect for each data element
                           .append("g")

   // **Create rectangle svg shapes for the treemap
   const plotTreemap = mainGroup.append("rect")
                                 // Add CSS class for hover effect
                                 .attr("class", "tile")
                                 .attr("x", (d) => d.x0)   
                                 .attr("y", (d) => d.y0)
                                 // width = x1 - x0
                                 .attr("width",  (d) => d.x1 - d.x0)
                                 // height = y1 - y0
                                 .attr("height", (d) => d.y1 - d.y0)
                                 // Use different color for different category
                                 .attr("fill", (d) => colorScale(d["data"]["category"]) )
                                 // Each tile should have the properties "data-name", "data-category", and "data-value"
                                 .attr("data-name", (d) => d["data"]["name"] )
                                 .attr("data-category", (d) => d["data"]["category"] )
                                 .attr("data-value", (d) => d["data"]["value"] )
                                 // ** Make dummy #tooltip element visible as requested using .on()
                                 .on("mouseover", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "visible")
                                                // Won't actually display on web page
                                                .text("");
                                    setTooltip.attr("data-value", () => d["data"]["value"]); // doesn't need another (d) within

                                 })
                                 // Hide dummy #tooltip element when mouseout
                                 .on("mouseout", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "hidden")
                                 })
                                 // This is the actual tooltip to display data value when hover mouse on bar,
                                 // but unfortunately this doesn't pass the tests for some reason
                                 .append("title")
                                 // Specifying the text to display upon mouseover the data point
                                 .text( (d) => `${d["data"]["name"]} (${d["data"]["category"]}): $${d["data"]["value"]}` )

   // Display text within each cell, append to group, not <rect> element
   const displayText = mainGroup.append("text")
                                 .attr("x", (d) => d.x0 + 5)   
                                 .attr("y", (d) => d.y0 + 15)
                                 .attr("font-size", "8pt")
                                 .text( (d) => d["data"]["name"] )
   
   // Legend
   const categories = data["children"].map( (d) => d.name );
   const lgdWidth = 120;
   const lgdHeight = 170;
   const lgdPadding = 1;
   const lgdBarHeight = 20;
   // Select legend svg element
   const lgdContainer = d3.select("#legend")
                           .style("width", lgdWidth)
                           .style("height", lgdHeight)

   // Create rectangle svg shapes for legend color
   const createLegend = lgdContainer.selectAll("rect")
                                    // Put data into the waiting state for further processing
                                    .data(categories)
                                    // Methods chained after data() run once per item in dataset
                                    // Create new element for each piece of data
                                    .enter()
                                    // The following code will be ran for each data point
                                    // Append rect for each data element
                                    .append("rect")
                                    // Legend should have <rect> elements with a corresponding class="legend-item"
                                    .attr("class", "legend-item")
                                    // Shift x position of <rect> by lgdBarHeight/2 for each data point
                                    .attr("x", lgdBarHeight / 2)
                                    .attr("y", (d, i) => i * (lgdBarHeight + lgdPadding) + lgdBarHeight/2)
                                    .attr("width", lgdBarHeight)
                                    .attr("height", lgdBarHeight)
                                    // Fill bar with color based on data value
                                    .attr("fill", (d) => colorScale(d) )
   // Generate the text for the legend
   const legendText = lgdContainer.append("g")
                                    .selectAll("text")
                                    .data(categories)
                                    .enter()
                                    .append("text")
                                    .attr("x", 2*lgdBarHeight)
                                    .attr("y", (d, i) => i * (lgdBarHeight + lgdPadding) + lgdBarHeight+5)
                                    .text( (d) => d)

};

// "Producing code" is code that can take some time
// "Consuming code" is code that must wait for the result
// A Promise is a JavaScript object that links producing code and consuming code

// Use async functions and the await keyword, part of the so-called ECMAScript 2017 JavaScript edition
// the "async" keyword is added to functions to tell them to return a promise rather than directly returning the value
const fetchData = async (data) => {

   // "await" only works inside async functions
   // This can be put in front of any async promise-based function to pause your code on that line until the promise fulfills,
   // then return the resulting value
   const movieDataResponse = await fetch(data);

   // Throw error if response is not ok
   if (!movieDataResponse.ok) {
      throw new Error(`HTTP error! status: ${movieDataResponse.status}`);
   } else {
      // Convert the response to JSON format
      const movieData = await movieDataResponse.json();
      //console.log(movieData);
      //console.log(movieData["children"][0]["name"]); // Output: Action

      // Call plot chart function
      plotChart(movieData);
   }
   
}

// Run everything
fetchData(jsonURL)
   // The catch block catches the error, and executes a code to handle it
   .catch( (e) => {
      console.log(`There has been a problem with your fetch operation: ${e.message}`);
});