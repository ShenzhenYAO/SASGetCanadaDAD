/**initiation and settings */


/**global vars */
var currentURL =  window.location.href
if (currentURL.startsWith("http://localhost:")){
    var treejsonURL = 'data/canadadpd_SAS_20191212.json';//'data/ULtraSound_20191221';// 'data/treedata.json', //'data/An apology for Raymond Sebond v1',     // the url of the external json file with tree data
    var thejsonstrnameinjs =treejsonURL.substring(treejsonURL.lastIndexOf('/')+1)
    sessionStorage.setItem('thejsonstrname', thejsonstrnameinjs);
 };
    
userid=2; // for the type being, let the user id =2.
sessionStorage.setItem('theuserid', userid);

var 
    gitcommitversion = '159a',

    treeData,   // to hold the tree data 
    treeJSON,   // to hold the tree JSON from treeData
    i = 0,  // no need
    showhidedescendants_duration = 1750,     //duration of transition (1000 = 1 second)
    // rootdatapoint, //the root data point and its descendants in hierarchical structure
    flatterneddatapoints, // an array of flattered datapoints from rootdatapoint
    flatterneddatapoints_sortedrowscols, // adding sorted rows and cols (to be put in a tree) of points in flatterneddatapoints
    treemaxrowscols, // the maxrows and cols in an array 
    
    pseudoNodeG, pseudoNodeCircle, pseudoNodeText,
    
    thetextbox,thehintbox
;

/** for zooming and pan
 * from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box * 
*/
var w = window;
var doc = document;
var el = doc.documentElement;
var bodyEle = doc.getElementsByTagName('body')[0];
var width_body = w.innerWidth || el.clientWidth || bodyEle.clientWidth;
var height_body = w.innerHeight|| el.clientHeight|| bodyEle.clientHeight;
var centeredNode;
var zoomSettings = {
    duration: 1000,
    ease: d3.easeCubicOut, 
    zoomLevel: 2
  };

var zoomLevel=1; // the level of zoomming (scale, i.e., the times to enlarge/shrink), by default=1; 

/** viewbox width (two boxes side by side, left for text, right for diagram) */
var width_textviewbox = width_body *.9,
    height_textviewbox = height_body,
    width_treeviewbox = width_textviewbox * .9//width_body, // leave 5% for padding
    height_treeviewbox = height_body,

    borderweight_viewbox = 1
    ;
/**tree making method: size() or nodeSize() */
//https://stackoverflow.com/questions/17558649/d3-tree-layout-separation-between-nodes-using-nodesize
// tree().nodeSize() makes flexible size trees, tree().size() makes fixed-size trees. The two cannot be used at the same time
var newtreeMethod='bysize'; //bynodesize or bysize


/*define the svg box and padding, and properties of the tree*/
var 
	TreeMarginToSvg = {top: 20, right: 120, bottom: 20, left: 120},
	// width_tree = width_body - TreeMarginToSvg.right - TreeMarginToSvg.left,
    // height_tree = height_body - TreeMarginToSvg.top - TreeMarginToSvg.bottom,
    width_tree,
    height_tree,
    between_nodes_horizontal = 180,
    between_nodes_vertical = 65,
    center_tree, //it is never used
    focus=center_tree //never used
    // center_tree = [width_tree / 2, height_tree /2] //for zooming from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box
    // focus=center_tree
;
var offsetshiftup= TreeMarginToSvg.top;

var treeData;
var flatterneddatapoints_sortedrowscols;
var rootdatapoint_sortedrowscols;
var treeinstance; // important: treeinstance has to be defined outside the function
var updateTree;

var svg, thetreeG, thetreerect;


/**about tree elements*/
var 
    nodecircle_border_width = 3,
    nodecircle_border_color='slateblue',
    nodecircle_fill_hidedescendants_color = 'lightsteelblue',
    nodecircle_fill_showdescendants_color = 'lightyellow',
    nodecircle_fill_dragover_color = 'green',
    nodecircle_radius=10,

    nodetext_font_size = '1em', // xhtml div has to use 1em (=12 px) instead of units in pixels
    pseudonodetext_offsetdown=10
;

var makechangetreeresult={}; // this is to save features produced by makechangetree

// for drag and drop
var mouseoverObj; //,theParentToChangeObj;
var theSrcD3Obj, theTgtD3Obj;

// for modals
var theParentToAppendChild;
var theNodeToRename,theNodetoRenameElm;
var currentDataEle, theInputMainDiv, nicEditor, NicEditInputInstance;
var quillcssloaded=0; //check whether the quill css script has been written into the index.html

//for textview box
var locknode = 0 ; // the node lock status (1 or 0). if locknode =1, when mouse is out of the selected text span, 
        // no further actions will take (on tree map the focus will stay on the selected node)


// right click menu for nodes
var nodemenu = [
    {
        title: 'Rename node',
        action: function(elm, d, i) {
            makemodal('theModal', 'Rename a node', 'Node name', 'renameNode()')
            // console.log('Rename node');
            theNodeToRename=d; //
            theNodetoRenameElm=elm;
            showRenameForm(); //showRenameForm();
            //show the current node name
            $('#ModalInput').val(d.data.name); //d3v4
            $('#ModalInput').focus();

            //$('#theModal').remove(); //!!! cannot put it here, as the modal will open and close, nothing can be seen on the screen
        }
    },
    {
        title: 'Delete node',
        action: function(elm, d, i) {

            //confirm the delete action
            var confirmdel=confirmDelete();
            if (confirmdel===true && d.parent !== null & d.parent !== undefined ){
                //console.log('Delete node');
                // console.log(d)
            
                deleteNode(d);

                var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
                //   console.log(proposedTreesize.width, proposedTreesize.height)
                rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
                
                // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
                treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
                updateTree= MakeChangeTree(rootdatapoint_sortedrowscols) 
                pan ()
                custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate )
            }                    
        }
    },
    {
        title: 'New node',
        action: function(elm, d, i) {
                
            // create the modal
            makemodal('theModal', 'Append a new node', 'Node name', 'createNode()')

            //console.log('Create child node');
            theParentToAppendChild = d;
            // console.log(theParentToAppendChild)
            showCreateForm();
            //create_node_modal_active = true;
            //$('#CreateNodeModal').foundation('reveal', 'open');
            $('#ModalInput').val("New"); //by default, the name of the new node is 'New'
            $('#ModalInput').focus(); 
        
        }
    },
    { // check this for better rich-text editors https://www.webdesignerdepot.com/2008/12/20-excellent-free-rich-text-editors/
      // https://handsontable.com/blog/articles/2017/8/11-best-rich-text-editors  
        title: 'Edit description',
        action: function(elm, d, i) {
            //console.log('Edit description');
            currentDataEle = d;

            makemodal('theModal', 'Description', null, null)
            /** This is an asynchoronous issue
             * 
             * wait for 0.1 second to allow the makemodal() done, and then carry on to run showInputTextForm...
                the idea is that the modal has to be built first. 
                
                This is an asynchoronous issue. niceEdit app should be loaded when running makemodal. However, before it is
            loaded, the program carries on and run showInputTextForm(). As there is no nicEdit instance to work 
            with (i.e., the nicEdit formated text app is not working, there is no nicEdit app working, 
            the program will stop and report error.

                Waiting for 0.1 sec won't let users feel that they are waiting, but it is long enough for nicEdit app to load.
            */
            setTimeout (function (){
                    //wait for 100 ms and to the following:
                    showInputTextForm();
                    $('#myInputBox').focus();
                }, 500 // 100 is too fast for Netlify
            );

            // showInputTextForm();
            // //create_node_modal_active = true;
            // //$('#CreateNodeModal').foundation('reveal', 'open');
            // $('#myInputBox').focus();
        }
    }
    ,
    {
        title: 'Expand descendants',
        action: function(elm, d, i) {
        //currentDataEle = d;
        expandAll(d);
        //create_node_modal_active = true;
        //$('#CreateNodeModal').foundation('reveal', 'open');
        //$('#CreateNodeName').focus();
        }
    }
    ,
    {
        title: 'Collapes descendants',
        action: function(elm, d, i) {
        //currentDataEle = d;
        //console.log(elm);
        //console.log(d)
        collapseAll(d) //check if the function exists
        }
    }
    ,
    {
        title: 'ZoomIn',
        action: function(elm, d, i) {
        //currentDataEle = d;
        //console.log(elm);
        //console.log(d)
        ZoomInOutSelectedNode(d) //check if the function exists
        }
    },
    {
        title: 'Show/hide substeps',
        action: function(elm, d, i) {

            //check if the current note data has a child named 'substeps'
            var childnames=[]
            if (d.data.children ){
                d.data.children.forEach( c=>{
                    childnames.push(c.name)
                })
            }
            if (childnames.includes('substeps')){ //if the name substeps exists, hide the substeps in .data._substeps
                d.data._substeps = d.data.children[childnames.indexOf('substeps')]
                d.data.children.splice(childnames.indexOf('substeps'),1) // delete the children named 'substeps'
            } else if (d.data._substeps){ //if data._substeps exists, unhide the substeps
                d.data.children.push(d.data._substeps) // ?unshift to put it as the first children
                delete d.data._substeps     
            } else {
                //console.log('Show subtree');
                addSubSteps(d.data)
            }           

            // console.log('show subtree====')
            // console.log(treeJSON)
            // console.log(rootdatapoint_sortedrowscols.data)
            treeJSON=rootdatapoint_sortedrowscols.data
            NewTree(treeJSON)
            
        }
    },
    {
        title: 'Manage subtree',
        action: function(elm, d, i) {
        currentDataEle = d;
        // showMangeSubtreeForm();
        //create_node_modal_active = true;
        //$('#CreateNodeModal').foundation('reveal', 'open');
        //$('#CreateNodeName').focus();
        }
    },
    {
        title: 'AddNodesFromFile',
        action: function(elm, d, i) {
            // currentDataEle = d;
            addnodesfromfile(d);
        }
    },
    {
        title: 'Copy',
        action: function(elm, d, i) {
            var copiedtreedatastr = JSON.stringify(d.data);
            //remember the selected tree data
            localStorage.setItem('copiedtreedatastr', copiedtreedatastr); // localStorage allows copy paste across webpages
            // console.log(sessionStorage.getItem('copiedtreedatastr'))
        }
    },
    {
        title: 'Paste',
        action: function(elm, d, i) {
            currentDataEle = d;
            if (localStorage.getItem('copiedtreedatastr')){
                var copiedtreedata=JSON.parse(localStorage.getItem('copiedtreedatastr'))
                PasteTreeData(d, copiedtreedata)
            }
        }
    },
    {
        title: 'ExportNodesAsJSON',
        action: function(elm, d, i) {
            // get the data
            var thenodejson = d.data
            //remove the custparents
            // console.log(thenodejson)
            var fileName = "myData";
            //save it to local disk
            saveData(thenodejson, fileName); 
        }
    },
    {   // show data and element information of the selected note in console.log
        title: 'Show node info in console.log',
        action: function(elm, d, i) {
            // get the data
            console.log(d)
            console.log(elm)
        }
    }

] // end nodemenu


// menu of custlink when a custlink is right clicked
var custlinkmenu = [
    {
        title: 'delete link',
        action: function(elm, d, i) {
            // console.log (elm)
            deletecustlink(elm, d)
        }
    }
]










