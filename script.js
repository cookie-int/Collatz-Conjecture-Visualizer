let isFullscreen = false;
let currentSequence = [];

function generateSequence() {
  const input = document.getElementById("numberInput").value;
  let num = parseInt(input);

  if (isNaN(num) || num <= 0) {
    alert("Please enter a valid positive integer.");
    return;
  }

  currentSequence = [];
  currentSequence.push(num);

  while (num !== 1) {
    num = num % 2 === 0 ? num / 2 : 3 * num + 1;
    currentSequence.push(num);
  }

  displaySequence(currentSequence);
  drawGraph(currentSequence);

  // Show fullscreen and reset buttons after sequence generation
  document.getElementById("fullscreenBtn").style.display = "inline-block";
  document.getElementById("resetBtn").style.display = "inline-block";
}

function displaySequence(sequence) {
  const outputDiv = document.getElementById("sequenceOutput");
  const graphContainer = document.querySelector(".graph-container");

  outputDiv.style.display = "block";
  graphContainer.style.display = "block";

  outputDiv.innerHTML = sequence
    .map(
      (num) =>
        `<span style="padding: 10px; font-size: 1.2rem; color: #007bff;">${num}</span>`
    )
    .join("");

  // Display number of steps
  outputDiv.innerHTML += `<div style="margin-top: 10px; font-size: 1rem; color: #ffffff;">Total Steps: ${
    sequence.length - 1
  }</div>`;
}

document.getElementById("fullscreenBtn").addEventListener("click", function () {
  const graphContainer = document.querySelector(".graph-container");
  if (!document.fullscreenElement) {
    graphContainer.requestFullscreen();
    this.textContent = "Exit Fullscreen";
    isFullscreen = true;
  } else {
    document.exitFullscreen();
    this.textContent = "View Fullscreen";
    isFullscreen = false;
  }
});

function resetGraph() {
  drawGraph(currentSequence);
}

function drawGraph(sequence) {
  const svg = d3.select("#collatzGraph");
  svg.selectAll("*").remove();

  const margin = { top: 20, right: 30, bottom: 50, left: 40 },
    width = svg.node().clientWidth - margin.left - margin.right,
    height = svg.node().clientHeight - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, sequence.length - 1])
    .range([0, width]);
  const y = d3
    .scaleLog()
    .domain([1, d3.max(sequence)])
    .range([height, 0])
    .base(10);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(Math.min(sequence.length, 10)));
  g.append("g").attr("class", "y axis").call(d3.axisLeft(y).ticks(10, "~s"));

  const line = d3
    .line()
    .x((d, i) => x(i))
    .y((d) => y(d))
    .curve(d3.curveMonotoneX);

  const path = g
    .append("path")
    .datum(sequence)
    .attr("fill", "none")
    .attr("stroke", "#007bff")
    .attr("stroke-width", 2)
    .attr("d", line);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "#333") // Darker background for better contrast
    .style("color", "#000000") // Font color changed to black for coordinates
    .style("border", "1px solid #ddd")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("visibility", "hidden");

  const circles = g
    .selectAll("circle")
    .data(sequence)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => x(i))
    .attr("cy", (d) => y(d))
    .attr("r", 4)
    .attr("fill", "#ff5722")
    .attr("stroke", "#007bff")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      const index = sequence.indexOf(d);
      d3.select(this).attr("r", 8);
      tooltip
        .html(`Step: ${index}<br>Value: ${d}`)
        .style("visibility", "visible")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 4);
      tooltip.style("visibility", "hidden");
    });

  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", (event) => {
      const newXScale = event.transform.rescaleX(x);
      const newYScale = event.transform.rescaleY(y);

      // Update circles
      circles
        .attr("cx", (d, i) => newXScale(i))
        .attr("cy", (d) => newYScale(d));

      // Update path
      path.attr(
        "d",
        line.x((d, i) => newXScale(i)).y((d) => newYScale(d))
      );

      // Update axes
      g.select(".x.axis").call(d3.axisBottom(newXScale));
      g.select(".y.axis").call(d3.axisLeft(newYScale));
    });

  svg.call(zoom);
}
