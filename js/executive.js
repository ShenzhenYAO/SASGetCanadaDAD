//change from d3v3 to d3v4 can be found at
//https://github.com/d3/d3/blob/master/CHANGES.md		
//http://bl.ocks.org/d3noob/8375092

var d3body=d3.select('body');
var currentURL = window.location.href
if (currentURL.startsWith("http://localhost:")){
    var titletext='D3 try ' + currentURL;
    var gitcommitver = gitcommitversion;
    var githuburl ="https://github.com/ShenzhenYAO/simple_d3tree_v3tov4.io";
    addtitledesc (titletext, gitcommitver, githuburl)

} else {

    // var titletext='';
    // var gitcommitver = '';
    // var githuburl ="";
    // addtitledesc (titletext, gitcommitver, githuburl)

//     var titletext=sessionStorage.getItem('thejsonstrname');
//     //remove epg.json
//     titletext= titletext.replace(' egp', '')
//     titletext= titletext.replace('.json', '')
//     var gitcommitver = gitcommitversion;
//     addtitledesc (titletext, gitcommitver, githuburl)

//     // How to view the diagram? Watch it
//     d3body.append('p')
//         .styles({'font-size': '20px', 'font-weight': 'normal', 'font-family': "Georgia"})
//         .text('How to view the diagram? Watch it.')

    //Embedded youtube video 
    // var videoURL='https://www.youtube.com/embed/rMzxW6R2Eno';
    var videoURL= "https://www.youtube.com/embed/p5cOh6Q10w4"; 
    function embedvideohowtouse (videoURL){
        var iframe = document.createElement('iframe');
        iframe.frameBorder = "0"; 
        iframe.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.src = videoURL;
        iframe.allowFullscreen = 'true';
        document.body.appendChild(iframe);
    }
    embedvideohowtouse(videoURL)

    //Disclaim
    // d3body.append('p')
    //     .append('b')
    //     .styles({
    //         // 'font-family': "monospace",
    //         'font-weight':"bold",
    //         'font-size': "15px"
    //     })
    //     .text('Confidentiality Notice:')
    //     .append('b')
    //     .styles({
    //         'font-family': "SFMono-Regliar,Consolas,Liberation Mono,Menlo,monospace",
    //         'font-weight':"normal",
    //         'font-size': "12px"
    //     })
    //     .text('  information on this page is for the sole use of the intended recipient(s) with explicit consent from the author Shenzhen YAO. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.');


}



//event listeners and buttons, and slides, and other gadgets https://www.d3-graph-gallery.com/graph/interactivity_button.html
// 0.2 add buttons
// 0.2.1 new diagram (use jquery)
var buttonsdiv = d3body.append('div').attrs({'class': 'buttonsdiv'})
if (currentURL.startsWith("http://localhost:")){
    buttonsdiv.append('button').attrs({'onclick': 'CreateNewGrandTree()'}).text('New diagram')
    // buttonsdiv.append('button').attrs({'onclick': 'ImportFromEGPAfterReloading()'}).text('Import EGP')
    // buttonsdiv.append('input').attrs({'type': 'file', 'id':'egp_input'})
    buttonsdiv.append('input').attrs({'type': 'file', 'id':'file_input'})
    buttonsdiv.append('button').attrs({'onclick': 'exportData_local_d3v4()'}).text('ExportJSON').styles({'margin-right':'20px'})
    buttonsdiv.append('button').attrs({'onclick': 'exportTextBox2WordDoc()'}).text('Export Text to Word Doc').styles({'margin-left':'100px'})
    buttonsdiv.append('p')
    buttonsdiv.append('button').attrs({'onclick': 'jsonstr_js2php2mysql()'}).text('to MySQL').styles({'margin-left':'100px'}).styles({'margin-left':'0px'})
    buttonsdiv.append('button').attrs({'onclick': 'jsonstr_mysql2php2js()'}).text('from MySQL').styles({'margin-left':'100px'}).styles({'margin-left':'0px'})
    buttonsdiv.append('button').attrs({'onclick': 'postbinstr2php()'}).text('save JSON as hex tmphexstr.txt').styles({'margin-left':'100px'}).styles({'margin-left':'0px'})
    buttonsdiv.append('button').attrs({'onclick': 'removeit()'}).text('remove surfix').styles({'margin-left':'100px'}).styles({'margin-left':'20px'})

    //postbinstr2php()
}
buttonsdiv.append('button').attrs({'onclick': 'collapseAll(rootdatapoint_sortedrowscols)'}).text('collapse all nodes').styles({'margin-left':'100px'}).styles({'margin-left':'20px'})

if (currentURL.startsWith("http://localhost:")){
    buttonsdiv.append('p')
    buttonsdiv.append('button').attrs({'onclick': 'showSentences()'}).text('showTextBox')
    buttonsdiv.append('button').attrs({'onclick': 'hideSentences()'}).text('hideTextBox')
    buttonsdiv.append('button').attrs({'onclick': 'showSearch()', 'id':'showSearchBtn'}).text('Search')
}
// 0.3 add modals
//0.3.1 new node modal

//0.2 add two boxes
var bodyd3=d3.select('body');
var bigdiv= bodyd3.append('div')
.attr('class', 'bigdiv')
.styles({
    'width':(width_body*2) + 'px',
    'height':height_body + 'px',
    'float':'left',
    'border-width': borderweight_viewbox + 'px'
    // 'white-space':'nowrap' // to prevent wrap, but seems unecessary
})

//the box to hold text
var textviewbox=bigdiv.append('div')
    .attr('class', 'textviewbox')
    .styles({
        'width':(0) + 'px', // by default, not showing the textview box
        'height':height_body + 'px',
        'float':'left',
        // 'border-style':'solid',
        'border-width': borderweight_viewbox + 'px',
        // to make it resizable:
        'resize':'both',
        'overflow': 'auto'
    })
// the box to hold the tree diagram
var treeviewbox = bigdiv.append('div')
    .attr('class', 'treeviewbox')
    .attr('id', 'treeviewbox')
    .styles({
        'width':(width_treeviewbox) + 'px',
        'height':height_body + 'px',
        'float':'left',
        'border-style':'solid',
        'border-width': '1px',
        // to make it resizable:
        'resize':'both',
        'overflow': 'auto'
    })
 


    
/**The following is to show textbox and link text to treenode *************************** */

//build a textBox:
thetextbox=textviewbox.append('div')
    .attrs({'id': 'textBox', 'contenteditable': 'true'})
    .styles({
        "width":'98%', 
        'height':'80%',
        'font-family': "Consolas", //Helvetica, sans-serif
        // 'max-height':height_textviewbox + 'px',
        'max-height':'80%',
        'font-size':'25px',
        // 'float':'left',
        'overflow': 'auto',
        'background-color': 'lightgrey',
        'padding' :'5px',
        'margin':'2px',
        'line-height': '1.6',
        'display':'none',
        // to make it resizable:
        'resize':'both',
        'overflow': 'auto'
    })
;

//build a text hint box:
thehintbox=textviewbox.append('div')
    .attrs({'id': 'hintBox', 'class': 'hintBox', 'contenteditable': 'true'})
    .styles({
        "width":'98%', 
        'height':'18%', 
        'max-height':'18%',
        'font-size':'20px',
        // 'float':'left',
        'overflow': 'auto',
        'background-color': 'lightblue',
        'padding' :'5px',
        'margin':'2px',
        'line-height': '1.6',
        'display':'none',
        // to make it resizable:
        'resize':'both',
        'overflow': 'auto'
    })
;

//the following steps are wrapped into one function, in case the whole process need to be repeated.
function makeSvgRectGTree(){

    /**0.3 Add a svg, tree rect, and treeg in body **********************************/

    /**0.3.1.1 determine the svg */
    // var svgwidth = width_tree + TreeMarginToSvg.left + TreeMarginToSvg.right,
    //     svgheight = height_tree + TreeMarginToSvg.top + TreeMarginToSvg.bottom
    //     ; // by tree size
    // svgwidth = Math.max(svgwidth, width_treeviewbox); // the tree size or the viewbox size, which ever is larger
    // svgheight = Math.max(svgheight, height_treeviewbox);

    // modified! do not change the svg and the rect's size
    svgwidth = width_treeviewbox - borderweight_viewbox *2; 
    svgheight = height_treeviewbox - borderweight_viewbox*2;

    svg = addnewEle(svgwidth, svgheight, null, 'thebigsvg', treeviewbox, null, 'svg', null );

    /**0.3.1.2 add a mouse position tip. Note: not used as it isjsut for illustration */
    // This trick is learned from https://github.com/Matt-Dionis/d3-map
    // var themousepositiontip = svg.append('g')
    //     .attr('class', 'mousepositiontip')
    // var mousetiptext=themousepositiontip.append('text')
    //     .attr('class', 'mousepositiontiptext')
    //     .style('opacity', '0')
    // ;



    /**0.3.1.3 enable zooming and pan, from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box
     * Note: not used because of its poor performance
    */
    // svg.call(
    //     d3.zoom()
    //         .scaleExtent([1 / 2, 12])
    //         .on("zoom", zoomed) 
    // )


    /**0.3.2, append a rect to allow click on blank. From F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box */
    //insert a rect, so that we can click on the blank area, to zoom out
    thetreerect=svg.append('rect')
        .attrs({
        'class': 'treerect',
        'width': svgwidth,
        'height': svgheight,
        'id': 'I created'
        // 'stroke': 'black'
        })
        // .style('pointer-events', 'all')
        // .classed ('background', true)
        .on('contextmenu', ZoomInOutSelectedNode)
        // on mouse over, show mouse position
        // .on('mouseover', showmouseposition)
    ; 


    /**0.3.3 Add a g in svg */
    var transfm= "translate(" + TreeMarginToSvg.left + "," + TreeMarginToSvg.top + ")";
    thetreeG = addnewEle(null, null, null, 'thetreeg', svg, null, 'g', transfm );
    //!!!! here thetreeG.on('mousedown') does not work
    // thetreeG.on('mousedown', pan)

    /** add zoom in and out buttons in treeG ************************************/
    var zoombuttonsG = svg.append('g').attr('class','zoombuttonsG');
    zoombuttonsG.attr('transform', 'translate(0, 100)')
    var zoominBtnG = zoombuttonsG.append('g').attr('class','zooming')
        .append('foreignObject').attr('width', 30).attr('height', '30')
            .append('xhtml:div')
            .text('+')
            .styles({
                "width":'80%', 
                'height':'80%', 
                'font-size':'25px',
                'text-align': 'center',
                'vertical-align': 'middle',
                // 'float':'left',
                // 'overflow': 'auto',
                // 'background-color': 'lightblue',
                // 'padding' :'5px',
                'margin':'2px',
                'border-style':'solid',
                'border-width': '1px'
            })
    var zoomoutBtnG = zoombuttonsG.append('g').attr('class','zoomoutg').attr('transform', 'translate(0,35)')
        .append('foreignObject').attr('width', 30).attr('height', '30')
            .append('xhtml:div')
            .text('-')
            .styles({
                "width":'80%', 
                'height':'80%', 
                'font-size':'25px',
                'text-align': 'center',
                'vertical-align': 'middle',
                // 'float':'left',
                // 'overflow': 'auto',
                // 'background-color': 'lightblue',
                // 'padding' :'5px',
                'margin':'2px',
                'border-style':'solid',
                'border-width': '1px'
            })

    zoominBtnG.on('click', ZoomInTree)
    zoomoutBtnG.on('click', ZoomOutTree)
    /** add zoom in and out buttons in treeG ************************************/

    /**A. load tree Data as a json obj from an external json file 
     * Note: getJsonFromsessionStorage is results from a IFFE function getting results from sessionStorage items.
     * Such arrangement solves asynchronous issues (i.e., treeJSON does not waiting for d3.json(), and carries on with null). 
    */
    // the original method before this version are repalced with the following newTreebyJsonfromURL(). 
    // The new one does not require sessionStorge
    // treeData = getJsonFromsessionStorage;
    // NewTree (treeData)
    

    //when running on local host:
    // if (currentURL.startsWith("http://localhost:")){

        // load the default tree data stored in the data folder (which is set in init.js)
        newTreebyJsonfromURL(treejsonURL)

    // } else {
    //     //when running online, load the default json either from workaround (on netlify) or from a json str hidden in PHP
    //     var loadedjsonstr = sessionStorage.getItem("thejsonstr");
    //     treeData = JSON.parse(loadedjsonstr)
    //     NewTree (treeData)
    // }

    // // the following illustrates the timing of loading json, making tree, and the value of treeData, and root data point 
    // // initially it cannot be seen because of the asynchoronous settings.
    // console.log('before the tree is made')
    // console.log(treeData)

    // // after 5 seconds, they are all saved
    // setTimeout (function (){
    //     console.log('five seconds after the tree is made')
    //     console.log(treeData)
    //     console.log(rootdatapoint_sortedrowscols)
    //     thetreeG.select('g.nodeGs').attr('fakeattr', function(d){
    //             console.log(d)
    //         })
    //     }, 5000
    // );

}// makeSvgRectGTree

makeSvgRectGTree()

// monitor the size changes
observetreeviewboxsize()


// when testing on local host, switch on autosave
if (currentURL.startsWith("http://localhost:")){
    //check json data change every 60 sec
    checkJSONPeriodically(60);
} else {
    setTimeout(() => {
        collapseAll(rootdatapoint_sortedrowscols)
    }, 3000)
}

// //Disclaim
// d3.select('body')
// .append('div')
// .append('p')
// .styles({
//     // 'font-family': "monospace",
//     'font-weight':"bold",
//     'font-size': "15px"
// })
// .text('Confidentiality Notice:')
// .append('b')
// .styles({
//     'font-family': "SFMono-Regliar,Consolas,Liberation Mono,Menlo,monospace",
//     'font-weight':"normal",
//     'font-size': "12px"
// })
// .text('  information on this page is for the sole use of the intended recipient(s) with explicit consent from the author Shenzhen YAO. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.');






