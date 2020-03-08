simple d3 v4 tree diagram.
Commit A special instance for GetCandaDPDSAS

Commit 159a
1. Remember the current setting for hide/show children nodes??

To do: Update the x0 y0 position of the _children nodes?
check the d3mapleaflet instance, might help to bring forward the custlinks

git remote set-url origin https://github.com/ShenzhenYAO/simple_d3tree_v3tov4.io.git

Commit 158a

1. Add a folder pix (icons, e.g., video, info, code, etc.)
2. Add icons around the circle node to indicate whether there are video, code, etc in the description

Question:
would it help to update the current node positions? (check the current position of the element, 
    and save it into the x y of the node)

Commit 157a
1. change the substeps symbol to a circle


Commit 156a
1. add a mark to indicate whether there is a hidden substep

Commit 155a
1. work around as netlify does not support php. 
2. Add a new function to rename node data names, removing the sufix _copy (function removeit())
3. Change the description text font to time new roman, black, fontize 25 ( In function 'showInputTextForm(), part: editorbox_modal.styles))
4. add a function for enter as click ok. see
https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
5. add a function in right click menu to display node info (the node, data, binded elements, etc) in the console.log


Commit 154a

1. add a function to save the current tree json as a tmphexstr.txt [postbinstr2php()]
2. replace index. now for local host, directly load the json file specified in init.js; for online
versions, load the Ultrasound project which is hidden in a php


Commit 153a-h

1. add a button for collaspe all nodes
2. fix the bug of wrong thejsonstrname by default 
3. Show different buttons and titles if it is on netlify (or other sites) 

Commit 152a

Fixed the bug: when copy/paste subnodes, the custlinks are lost
The function PasteTreeData() (in components.js) is updated

Bug to fix:
1. when rename/adding a new node, the name of the new node and other nodes are messed up


Commit 151a

1. When online, 1) autocollapse all nodes; 2) do not automatically save.

To do:
fix bugs:
1. When copy/paste subnodes, the custlinks are lost
2. when rename/adding a new node, the name of the new node and other nodes are messed up




Commit 150a

1. Add export node and descendants as a separate json

Commit 149a
1. Add a child from a local egp or json

Commit 148a

1. Copy and paste subdata as a child

Bug rename and mess up issues?

commit 147a

Add quill blot formatter to resize images.
Remove the folder  imageresize and its components. from tools/quill/addon

commit 146a

Enable table editing
Quilljs using 2.0.0-dev.3 which is downloaded from: https://github.com/quilljs/cdn
    this version allows inserting tables. A demo can be found at:
    https://codepen.io/quill/pen/QxypzX

Quill-image-resize is outdated now, and is take out in this version. 


commit 145a
1. Autosave the tree json to server's data/ folder

The current Quilljs (1.3.6) does not support table.
In the next commit (146a), a newer version will be used:
    Quilljs using 2.0.0-dev.3 which is downloaded from: https://github.com/quilljs/cdn
    this version allows inserting tables. A demo can be found at:
    https://codepen.io/quill/pen/QxypzX
    However, the quill-image-resize is outdated
    The replacement would be:
    https://github.com/Fandom-OSS/quill-blot-formatter
    a demo of which can be found at:
    https://codesandbox.io/s/4wnwllnnl9


commit 144a

1. Using JQuery $.POST to send JSONstr from JS to PHP, then to MySQL (save JSONstr to MySQL databases)
2. Automatically (every 60 secondes) save the current tree JSON data as string to MySQL databases
3. Using JQuery $.POST to fetch JSONstr from JS to PHP, to MySQL, then return result to PHP, and to JS (load JSON from MYSQL database)

commit 143a-c

1. Periodically check whether the tree data has changed
2. Parsing JSON to PHP, then MySQL Table, and bring back

commit 142a
1. Fixed the bug: now sentences from the following node can stay in the same line with sentences of the previous node
2. Hide the textview box on loading a new diagram or load a new json/egp file
3. Image resizable (add link to image-resize.min.js) To make it work properly:
    1) In showInputTextForm() (component.js), set editorbox_modal.styles({"position": "relative"})
        This will cause other quill tool tips position improperly.
    To make up:
    2) In  toosl/quill/quill.snow.css, change from  
        .ql-snow .ql-tooltip { position: absolute;} 
        to 
         .ql-snow .ql-tooltip { position: fixed;} 

Links for export to docx:
//additional info output to docx
//https://github.com/quilljs/quill/issues/1996
//https://vbraun.github.io/QuillDesktop/quill.exporter.pdf.html
 

commit 141a

1. Test getting text and html from quill (test6_parsehtmlquill.html)
The test6 html (in the bottom of the body part also contains links on exporting to docx, or pdf)
2. Replacing nicEdit with Quill in D3 tree


commit 140a

Testing quill format app (in test5_quill.html, and testquill.js in tools/quill)
https://quilljs.com/docs/download/


To do:
Log in to MySQL
Send JSON to MySQL
instant saving to MySQL
Undo


commit 139a

Fix bugs: 
1. hide substeps causing error. The problem is caused by the remaining nodes, primarylinks, custlinks, and pseudolinks from the last tree. Add lines to delete the elements from the last run.(function 'NewTree' in components.js) 
2. remove remmaining pseudolinks in makechangetree()


commit 138a

1. Export to word doc
2. Fixed the bug that losing the selected node when drag and drop to the same parent (see comments after the line 'var originalParentData = theSelectedObjData.parent' in components.js)

commit 137a

Bugs fixed:
1. Every time changing parents, the relationship should be updated in custparents
2. For newly added nodes, the parent-child relatitonship should also be added into custparents


commit 136a
1. Right click to show/hide/add substeps (if hiding, the substeps are saved as .data._substeps)
2. Fix the bug of ;;;; (should be tab) in original nodedescript. (Maybe it is made by niceEit...)
3. Fixed the bug that substeps are not exported (add ._substeps into the function selectCopy(), which is a function for cleaning the data json before export)

Potential bug:
There could be a bug (adding substeps to the wrong node, but could not repeat...)

commit 135a

1. Automatically identify contents between PROC RUN or PROC QUIT
2. Make subnodes (For text in NodeDescription, the <br/>, &nbsp... should be replaced by \n, ' '
    so as to be treated by the two functions in 134a), Restore values (need to pay attention to the transformation of line breakers, spaces...within the replacements....)
3. When load egp files, automatically add substeps for each node. However, it took too many resources and the system blows up!


commit 134a
1. In work.js, two functions to breaked down codes in an EGP program into blocks. The functions are codeToObj(), and PickupMatched()



commit 133a
1. Sort task by name, default link takes the .to task's name which is of the lowest alphabetic order (in getDefaultCustLinks())
2. Check and update the text box width (showsentences()). So that it won't return to default width every time running showsentences()

commit 132a
1. After open, and close the edit node description modal. If the textbox is visible, it'll scroll down to the text corresponding to the edited node.


commit 131a
1. Textviewbox, textbox, and hintbox are all resizable


commit 130a

1. The custlinks now contains all links from the egp file, including the default links. That way, none of the links would be lost when changing parent in tree diagram. 
2. Click the text area to lock the tree on the focused node
3. Treeviewbox resizable by observetreeboxsize()
4. In excutive.js, making svg, rect, g, and the tree is wrapped in one function makeSvgRectGTree(). That way, it'll be convenient to repeat the whole process if needed. 
5. Fixed bugs in ZoomInOutSelectedNode(), and in CentralNode_selectedText


commit 129a
***********************************
GREAT MILESONE!
**********************************
Open local egp file and draw tree automatically (2) (Loading code in each task into tree nodes)
(a sample egp file is in data/egpsimple.egp)

commit 128a
Open local egp file, and draw tree automatically (1) (Not loading code in each node yet)

commit 127a
1. add functions to read html or txt and turn into treeJSON of sentences delimited by '.'
(a sample txt is at data/chapter12.txt. Or load it from URL as specified in function getHtmlAsTreeJSON )

commit 126a
1. Add right click on custlinks to show link context menu in which users can select to delete custlink 


commit 125a

1. Testing using d3v4 and jquery js in local file seems fine
2. testing d3v5 (The only proeblem is that the loading of js from URL is not correct. )
3. Fixed the bug: prevent the underneathe treeG moving when the mouse is down and moving in the modal area (in modaldialogbox())
4. Adding shift-drag/drop to add custlink and update custparents (next is to right click and delete cust links??)

commit 124a
*********************************************************
GREAT MILESONE!
******************************************************

1. add buttons to zoom in and out the treemap
2. rearranged the textviewbox and the treeviewbox


commit 123a
1. Show hint box, on hint text input update the NodeDescription. Replace old tag (////clue ////) with new tags(///h h///)
2. Show/hind textview box on clicking the buttons

To do:
1. search
2. lock the selected node
3. the nicEdit bug
4. separately zoom in and out the text box, and the tree box

commit 122a

1. Add TextBox, and hintBox in the textviewbox
2. Selecting description text in textbox, the corresponding node will show up at the middle left of the tree map
3. Changes of description in textbox will be updated in nodes' description. Also, change in node's description will be updated into the text box if hitting the showTextBox button



commit 121a
1. change circle color if containing descriptions
2. turn label red if containing to do
3. debug of nicEdit.js. The original link is using http:// which is not allowed by netlify (has to be https://)
    therefore the nicEdit.js was downloaded and put in '/tool/nicEdit'. Two files are placed there. the gif must be there (for display icons).
    for makemodal() in components.js, the link to nicEdit.js was changed to 'tools/nicEdit/niceEdit.js
    also in nicEdit.js change was made to customize the gif path (change to: iconsPath : 'tools/nicEdit/nicEditorIcons.gif',)

to do:
1. Text link to nodes
2. text search , etc

Bugs: 
1) after bringing up the description modal, the nicEdit js is loaded, and when right click on the treerect it cause nicEdit to report error. 
2) when editing descript or renaming a node, the tree under the modal moves as mouse moves (how about when listening to mousedown/move, if a modal is open, do not move the treeG...)
3) nicEdit hyperlink not added, the hyperlink is always 'javascript:nicTemp()';


commit 120a
#########################################################
great milestone: having most functions ready!
#########################################################

1. Changed collapseAll(), collapse. If collapse to root, simulate a right click on the treerect to return to the default view of the root node
2. Enable expandAll() in the right click menu
3. Add description, fix the bug that description text cannot be edited.
    In function mousedown_pan(), disable the line:
        //////d3.event.preventDefault(); //!!! must have! to avoid text dragging
        // well it causes the description input modal stop working, do not use it!!!!)
4. In function inputTextChangeUpdate(), change the line to:
    var theDivs=d3.selectAll("div")['_groups'][0]; // d3v4, [0][0] does not work!
5. Bugs: 
1) after bringing up the description modal, the nicEdit js is loaded, and when right click on the treerect it cause nicEdit to report error.
2) when editing descript or renaming a node, the tree under the modal moves as mouse moves


commit 119a
1. debug doctype root node, right click collapse does not work (not a bug, just take time)
2. click elsewhere than the right click menu, the pan stop working
3. click x to close modal, pan stops
4. keep loading the same tree despite of changing source of local file to load


commit 118a
1. Rename node
2. Use the same function (makemodal() in work.js) to make modals

commit 117a

1. Us JavaScript to create the 'add new node 'modal, instead of using html

commit 116a
1. Right click menu
2. Collapse nodes when click the item 'collapse' in the right click menu
3. Delete a node when click the item 'delete node' in the right click menu
4. Build modals
5. Append a new node when click the item 'add node' in the right click menu
6. fixed the bug that after right click, the mouse is sticked for moving (the bug is fixed in 'd3.contextMenu' by adding 'd3.select(window).on('mousedown', null)') 

commit 115a

Export as an JSON to a local file

commit 114a

Create a new tree

commit 113a

Load file from URL and from local by functions readlocalfile(), and newTreebyJsonfromURL() in components.js

commit 19: 112a

1. simplify the executive.js, put the tree creating steps into NewTree() and move it to component.js
2. move estTreesize() into component.js. It is indepedent of NewTree()


commit 18: 111a

1. Fix bug: cross update .children._children for their depth (recursively), as well as ._children.children in the dragdrop function in component.js



*********************************************************************************************
commit 17:110a

$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$  Important milestone: The tree is now enabled for:
$    - zoom in and out
$    - pan
$    - drag and drop to change node relationships
$    - draw customized links
$    - tree size updated as show/hide nodes or relationship of notes changed
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
1. Change localStorage back to sessionStorage, still works properly. The keeping refreshing issue is rather caused by document.location.reload(), which should be stopped after reloading. (see the function document_reload() in components.js)
2. Automatically change the tree size as changes are made (e.g., show/hide nodes, drag and drop to change parents). Specifically, the automation is achieved by new lines before MakeChangeTree() to recalculate the treesize, redefine the vertical middle point of the first node, and update the tree instance with newly proposed tree size. 




commit 16:109a
1. add setTimeout to wait for 3 seconds, and get the final treeG size after waiting for all jobs are done
2. add tests of different tree() method settings (with/without specifying tree width and height) in executive.js
3. fixed the size of the svg and the treerect. Let the size be the same as the treeview box - borderweight
4. using localStorage items instead of sessionStorage items to save loaded json. That way, the constant refreshing issue    disappears. 


commit 15:108a
1. make customized link (custlink() in component.js) 
2. make changes in MakeChangeTree(), return nodeUpdate (an d3 obj of nodes shown in the tree not including those hidden)

commit 14:107a

1. two boxes, left for text, right for tree diagram. The tree diagram zoom in/out function is adapted
2. fix the bug: update depth for hidden children (in _children of the selected node object in drag and drop)
3. add pan [function pan()]
4. add stopPropagation() in function dragdrop (in component.js)

commit 13:106a

Debug, in components.js:
1. change pseudonodeG property setting using parameters set in init.js
2. put mouseover, null setting after running makechangetree()
3. when mouse out, set circle fill color according to whether show/hide descendants
4. make change tree use rootdatapoint_sortdrowscols

commit 12:105a
put all parameter settings in init.js
instead of <text>, use foreignObject, and div which is more flexible for multiple lines and text formating
 (an test page is created: test2_foreignobj.html)


commit 11:100c04
add a test1_mousedownmove.html to show how to trigger events when mouse is down, move, and up; show coordinates when  
 mouse is moved. 
add function getmousekey() to listen to and display the keys and mouse buttons
add function dragdrop() to drap and drop a node to change its parent. This is cool! Add '.on("mousedown", dragdrop)' when entering nodes [see MakeChangeTree() in components.js] to call back.  


commit 10:100c03
change names: ZoomInOutSelectedNode() instead of click2(), MakeChangeTree() instead of update()
add an option in executive.js, newtreeMethod, to select size() or nodeSize() methods 

commit 9: 100c02
use tree().nodeSize() method, adjust for error shift up of the nodeSize() method.

commit 8: 100c01
right click to center and enlarge the selected node (by the function click2)
add d3v4 build-in zooming and pan functions:
svg.call(
    d3.zoom()
        .scaleExtent([1 / 2, 12])
        .on("zoom", zoomed) 
)

commit 7: 100b02
split into 3 js files: init, components, and executive, loading in that order.
add transition to text fontsize and fill-opacity transition
add 

commit 6: 100b01
import JSON obj from external files

commit 1-5: 100_simpleV4
Copy from 100a and modify

