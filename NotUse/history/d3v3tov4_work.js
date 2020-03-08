//change from d3v3 to d3v4 can be found at
//https://github.com/d3/d3/blob/master/CHANGES.md

// add the h2 title
d3.select('body')
.append('h2')
.text('D3 try ' + window.location.href)
;
	
		
//http://bl.ocks.org/d3noob/8375092

var treeData=[
	{ idx: "A",
		name: "Dad",
		pushdu: 0,
		url: "https://view.officeapps.live.com/op/view.aspx?src=http%3A%2F%2Fepicanada.x10host.com%2Ffiles%2Fccdssdemo_A2.pptx",
		children:[							
					{ idx: "A1",
						name: "Son",
						pushdu: 0,
						children:[
							{idx: "A1A",
								name: "Grandson1",
								pushdu: 0,
								hide:0,
								children:[]
							},/*A1A*/
							{ idx: "A2",
								name: "Grandson2",
								pushdu: 0,
								children:[
								]
							}, /*A2*/
							{idx: "A1C",
								name: "Grandson3",
								pushdu: 0,
								hide:0,
								children:[										
								]
							}/*A1C*/
						]
					}, /*A1*/
		]
	}/*A*/		
];

	
// ************** Generate the tree diagram	 *****************

/*define the svg box and padding*/
var 
	margin = {top: 20, right: 120, bottom: 20, left: 120},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;




//******migration to D3V4 part 1, move the svg up
//add an svg into the first body element
var svg = d3.select("body").append("svg")
	//its size = the size of tree diagram + margins
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	//further in the svg add a group element
	.append("g")
	//push the g element right and down, starting at the edge of the margins
	.attr("transform", 
			"translate(" + margin.left + "," + margin.top + ")"
	  );

	//this is to get the treeDate, note that treeData[0] is the whole treeData, not just the first data element
	//the original data is in treeData, the root data contains more elements, e.g., x0, y0, etc which are not in the original treeData
	//!!! To save/get data from an array

var i = 0, duration = 750, root;



//******migration to D3V4 part 2, replace d3.layout.tree().size with d3.size
//var tree = d3.layout.tree().size([height, width]);//d3v3
var treemap = d3.tree().size([height, width]);//d3v4


/******migration to D3V4 part 3*/
var thetreeData= treeData[0]
//note that here, root is set to be a globle var, but seems that even set as local, it does not really matter
// root = treeData[0]; // v3
root = d3.hierarchy(thetreeData, function(d) { return d.children; }); //v4
root.x0 = height /2;
root.y0 = 0;

//console.log(root)


/******migration to D3V4 part 4, this part is new in v4
 * not seen in v3
*/
// Collapse after the second level, this is new in d3v4
// It is not necessary, it just collapse nodes beyond second level when initializing the tree diagram
// root.children.forEach(collapse);
// // Collapse the node and all it's children. It is also new in d3v4
// function collapse(d) {
// 	if(d.children) {
// 		d._children = d.children
// 		d._children.forEach(collapse)
// 		d.children = null
// 	}
// }
/***end ***migration to D3V4 part 4, this part is new in v4 */


	
//run the function 'update(source)' (source=root)
update(root);

	//the following is unknown, and may not be necessary
	//d3.select(self.frameElement).style("height", "500px");


//following are two core functions for the d3 tree structure

function update(source) {

	//source==root. root is an object (it is the first element of the data array treeData), which contains attributes/fields such as idx, name, and children
	//note that root is NOT an array but an object
	//the folloiwng tree.nodes() function is to flatten the data in root (i.e., from the parent, child structure to data element 0, 1, 2, ...)	
	//The data elements are accounted in reverse order, e.g., the deepest child data is the first element, whereas the utmost parent data is the last element
	//By the function tree.links,  links between pairs of parent-child node are defined 

/******migration to D3V4 part 5 */
	//var nodes = tree.nodes(root).reverse(),	links = tree.links(nodes); //v3
	var treeData2 = treemap(root);	//v4

		/* Although it seems that treeData2 and root 
			are the same, as shown in console.log, 
			they are different.
			treeData2 is an instantiation of the class treemap().  
			As such, treeData2 inherited the methods
				which were built in treemap(), e.g., 
				.descendants(), whereas the object 'root'
				does not have such methods
		*/
	// Compute the new tree layout.
	var nodes = treeData2.descendants(), links = treeData2.descendants().slice(1); //v4
////	var nodes = root.descendants(), links = root.descendants().slice(1); //test
/***end ***migration to D3V4 part 5 */
// console.log('root:*************')
// console.log(root)
// console.log('treeData2:*************')
// console.log(treeData2)
// console.log('? root === treeData2? *************')
// console.log(root===treeData2)
// console.log('nodes:*************')
// console.log(nodes)
// console.log('links:*************')
// console.log(links)

//the following shows that the nodes were reversely accounted in the array 'nodes' (i.e., the first node is A1C, which is the last node in the diagram)			  
//console.log(nodes);
//the links is like {source: , target:}. note that the source (and target) contains an object, rather a fixed value
// that object is the node, containing all attr of the node, such as it's idx, its name, etc. 
//console.log(links);
//!!!this is cool, as each element in the links array provides data to customize its color, layout, position in the chart, etc.


	// Redefine d.y position according to its depth in the arrary. 
	//for example, the child node has a depth of 1, set its d.y =180
	//the grandchild node has a depth of 2, set its d.y=360, etc
	nodes.forEach(function(d) { d.y = d.depth * 180; });
		//likewise, maybe we can also define the following:
			// !!! the min vertical distance between two nodes (currently it is auto calculated within the tree height)
			// !!! the new width/height required taking all nodes into account, that way, the size of the tree and the svg can be set dynamically

	// Binding data to html element
	//in the above, the var 'nodes' was created, it contains data from root, which in turn got data from treeData
	//in the following, the data elements in the array nodes will be assigned a new attribute: id. The first data element (which is indeed the last data element from root
		//remember, root is read into nodes in reverse order) will have the id of 1, the second having id of 2, etc
	//At the same time, the var 'node' will be created. This var is not for data, but for html shapes/elements. Here it is for the group elements ("g") 
			/*!!! the names 'nodes' and 'node' are too close. Actually they are quite different, one for data, one for html elements. They should be called like
				DataEleOfNodes (nodes) and shapeOfNodes (node), or htmlEleOfNodes
				Such names are pretty long, but easier to understand.
			*/
	//This is the brilliant step. Since here, the data elements (nodes) are bounded to the html elements (node)
	var node = svg.selectAll("g.nodeGroup") // note that it is to select all elements within g with the classname = nodeGroup
		.data(nodes, function(d) { return d.id || (d.id = ++i); });
//note that nodes contains data elements, while node contains html shapes/elements
//console.log(nodes);
//console.log(node);

	//Add the binded html elements
	/*
		in the above step, html elements in 'node' has been binded to data elements in 'nodes'. Imagining that these binded html elements are yet stashed in the warehouse.
			They are not yet placed in the web page. 
		The following is to add these elements into the webpage, within the defined svg
	*/
	var nodeEnter = node.enter().append("g")
		.attr("class", "nodeGroup")
		//at this stage, all elements (the "g"s) are placed in the same place, i.e., the y0 (horizontal) and x0 (vertical) position defined in 'source'
		//remember, source == root, and root is an object with attributes like 'idx', name, children array, etc)
		// the y0 and x0 is the first position of all nodes. The utmost node (idx='A' in this case will be kept there, the rest nodes will be pushed to right and down later)				
		.attr("transform", function(d) {
			//console.log(d.idx) ; // the d here is quite difficult to understand. It is some how the data elements (from 'nodes') binding to the html elements in 'node', and now in nodeEnter
			return "translate(" + source.y0 + "," + source.x0 + ")"; })
		//each "g" element is also enabled to be clicked, and to trigger a function 'click' to do something
		.on("click", click);
//the source is the root object, in which data are in hierrachical structure
//console.log(source);
//nodeEnter is an array of "g" elements, they are on the web page (unlike "g" elements in 'node' which are not placed on webpage, but in the warehouse)
//console.log(nodeEnter);

// within each "g"elements, further add a circle. The color of the circle is determined by whether the binded data (d) of "g" elements in nodeEnter contains children
//At this moment, it has a radius of almost 0 (so that it is unvisible)
//
	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", function(d) {
//console.log(d.idx); //again, d is the data elements (from 'nodes') binding to the html elements 'node', and 'nodeEnter'
			//the filling color is determined by whether are not the field '_children' of the binded data element contains sub elements.
			// the filed_children is like a secret house to hide children elements. If the current data element has children, but the children were hidden, these children will be saved as elements	
				//of an array in '_children'. If the childrens were unhidden, the _children will be empty 
			return d._children ? "lightsteelblue" : "#fff"; });

//the following shows for idx value of the data elements
//nodes.forEach(function(d){console.log(d.idx)});
//the following will return 'undefined' as attri/field of data elements cannot be found in the html elements (data elements are just binded to html)
//to get the values of fields of the data elements, one has to use append, select, update, etc.
//node.forEach(function(d){console.log(d.idx)});
//nodeEnter.forEach(function(d){console.log(d.idx)});

//however, this should work, it shows the first html element array's className (=nodeGroup as defined in line 51)
//nodeEnter.forEach(function(d){console.log(d[0].className)});
//similar for 'node
//node.forEach(function(d){console.log(d)});
	
		//within each "g" element, also add a text element, define it's x position, hight, and text alignment/anchor (start/middle/end)
		//display the binding data's value of the field 'name' in the text
				//!!! in my examples of CCDSS demo, the name values can be put into separate lines by tspan, check it out
	nodeEnter.append("text")
		.attr("x", function(d) { return d.children || d._children ? -13 : 13; })
		.attr("dy", ".35em")
		.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })

/******migration to D3V4 part 6, this is new */			
		//.text(function(d) { return d.name; }) //v3
		.text(function(d) { return d.data.name; }) //v4
/***end***migration to D3V4 part 6, this is new */			

		//hide the text by making its opacity = nearly 0
		.style("fill-opacity", 1e-6);



	
/******migration to D3V4 part 7, this is new */	
 	var nodeUpdate = nodeEnter.merge(node); // v4
/***end***migration to D3V4 part 7*/
// the merge method in D4 is beautifully explained in:
//https://medium.com/@mbostock/what-makes-software-good-943557f8a488
// also explained in 
// https://github.com/d3/d3/blob/master/CHANGES.md	


// translate / push each html element ("g") to the new location according to the d.x/d.y values of the binded data elements
	// like append, transition() also can be used to get binded data
	//the following is to get the value of .y and .x from the binded data of each html element ("g")
	//these values are determined by their depth (d.y), and the number of siblings in the same level (d.x)
	//d.y is calculated in line 23, d.x is secretly calculated by the tree function ?diaonal??? maybe (see the codes in the html sheet, not in this js file) 

/******migration to D3V4 part 8*/
	// var nodeUpdate = node.transition() // v3
	nodeUpdate.transition() //v4
//// var nodeUpdate = node.transition() //test
//// var nodeUpdate = nodeEnter.transition() //test
/***end***migration to D3V4 part 8*/

		.duration(duration)
		.attr("transform", function(d) { 
//console.log(d.x);
		return "translate(" + d.y + "," + d.x + ")"; });

// console.log('node=====')
// console.log(node)
// console.log('nodeEnter=====')
// console.log(nodeEnter)
// console.log('nodeUpdate=====')
// console.log(nodeUpdate)		

	/*Next, enlarge the circle radius, so that it is visible*/
	nodeUpdate.select("circle")
		.attr("r", 10)
		.style(
			"fill", 
			function(d) { 
				return d._children ? "lightsteelblue" : "#fff"; 
			}
		);
	
	//also make text visible
	nodeUpdate.select("text")
		.style("fill-opacity", 1);
		
		
	// if to exit, push the node to its parent's position
	// Transition exiting g elements to the parent's new position, and then remove them from the webpage
	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		.remove();

	//if to exit, make the radius of the circle nearly 0
	nodeExit.select("circle")
		.attr("r", 1e-6);
		
	//if to exit, make the	text opacity =0
	nodeExit.select("text")
		.style("fill-opacity", 1e-6);


	/*******************************make links *********************** */	

	// Similar to g elements, bind the link data (links) to the html elements (link), i.e., "path" elements 
	var link = svg.selectAll("path.link")

/******migration to D3V4 part 9 */
		//.data(links, function(d) { return d.target.id; });//v3
		.data(links, function(d) { return d.id; }); //v4
/***end***migration to D3V4 part 9 */


	//here insert "path" is similar to append "g", adding the path specification derived from the function 'diagonal'


/******migration to D3V4 part 10 */
	//link.enter().insert("path", "g") //v3
	var linkEnter = link.enter().insert('path', "g") //v4
/***end***migration to D3V4 part 10 */

		.attr("class", "link")
		.attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};

/******migration to D3V4 part 11 */
			//return diagonal({source: o, target: o});//v3
			return diagonal(o,o); //v4
/***end***migration to D3V4 part 11 */
			}
		);
//the function diagonal() returns the map specifications 
//console.log(diagonal);


/******migration to D3V4 part 12, this part is new in d3v4 */
	// UPDATE
	var linkUpdate = linkEnter.merge(link); //d3v4
	// Transition back to the parent element position // changed in d3v4
	linkUpdate.transition()
		.duration(duration)
////		.attr('d', function(d){ return diagonal(d, d.parent) });
		.attr('d', function(d){ return diagonal(d.parent, d) }); //test
		// the above two lines produce the same results, but the second line makes more sense to me
/***end***migration to D3V4 part 12 */


	// using the same path to display the transition
		// !!! check the transition for straight lines (using link.transition().attr("d", lineFunction) whereas varlinfuntion ... interpolate("linear") (https://bl.ocks.org/emmasaunders/f7178ed715a601c5b2c458a2c7093f78)
			//http://jsfiddle.net/cyril123/q1a6o1o8/
			// or https://stackoverflow.com/questions/35908428/d3-tree-graph-how-to-transition-links-when-using-straight-line-not-diagonal

// Because of the use of merge method, the following part is not required in V4
////	link.transition()
////		.duration(duration)

/******migration to D3V4 part 13*/		
		//.attr("d", diagonal); //v3
////		.attr('d', function(d){ return diagonal(d, d.parent) }); //v4
/***end***migration to D3V4 part 13 */


	// If to exit, make transition towards the parent node, and eventually remove the path lines
	link.exit().transition()
		.duration(duration)
		.attr("d", function(d) {
		var o = {x: source.x, y: source.y};

/******migration to D3V4 part 14*/		
		//return diagonal({source: o, target: o}); //v3
		return diagonal(o, o); // v4	
/***end ***migration to D3V4 part 14*/		

		})
		.remove();

	// for each data element, remember it's previous d.y, and d.x, so as to toggle between expansion/collaspe
	nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
	});
}



// the diagonal path
/******migration to D3V4 part 15*/
// var diagonal = d3.svg.diagonal().projection(function(d) {return [d.y, d.x];});//v3
// the diagonal() is no longer available, instead, make a diagonal function 
//diagnonal(s, d), i.e., s=source, d=destination.
function diagonal(s, d) {
	path = `M ${s.y} ${s.x}
			C ${(s.y + d.y) / 2} ${s.x},
			  ${(s.y + d.y) / 2} ${d.x},
			  ${d.y} ${d.x}`  
	return path
} // v4
/***end ***migration to D3V4 part 15*/


//the following console log shows the function diagnal;			
//console.log(diagonal);



// Toggle children on click.
function click(d) {
	//console.log("a node is clicked");
	//console.log(d);
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  update(d);
}	
	