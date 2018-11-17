/***************************************************************
****************************************************************
****************************************************************

Part of WIKIVR, a Wikipedia-based virtual reality experiment. 

Author: Matthew Ellis 
   
All rights reserved, 2018. 

****************************************************************
***************************************************************
***************************************************************/

/**********
This is an umbrella component that handles into and out-of VR events. That's really it. 
**********/

// Would an armModel help? 

AFRAME.registerComponent('einstein', {
  /**
  Basically we can have an HTML <--> JS bridge. Elements can be accessed accordingly.
   * Code within this function will be called when everything in <a-scene> is ready and loaded.
   */
  init: function () {
    // Set event handlers for enter/leave VR:
    this.intoVR  = AFRAME.utils.bind(this.intoVR,this);
    this.outOfVR = AFRAME.utils.bind(this.outOfVR,this);
    this.el.addEventListener('enter-vr', this.intoVR);
    this.el.addEventListener('exit-vr', this.outOfVR);
  },
  // Handling the transisition to VR:
  intoVR: async function () {
    // Get the entity of interest: 
    let daydreamController = this.el.querySelector('#lasers');
    // we want to add a light to our raycaster, and remove that cursor since we're in VR. 
    var sceneCamera = this.el.sceneEl.querySelector("#scenecam");
    var cursor = await sceneCamera.querySelector('[cursor]'); 
    if(cursor){
      cursor.parentNode.removeChild(cursor); 
    }
    daydreamController.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,}); 
    // set user component as intoVR = true; 
    daydreamController.setAttribute('user',{inVR:true});
  },
  // Transition out of VR: 
  outOfVR: function () {
    // Essentially doing the opposite of intoVR(). 
    var cursor = document.createElement('a-entity'); 
    var sceneCamera = this.el.sceneEl.querySelector("#scenecam");
    var camera = sceneCamera.querySelector('[camera]'); 
    var cursor = document.createElement('a-entity'); 
    // Set the attributes:
    cursor.setAttribute('id','camera-cursor'); 
    cursor.setAttribute('position',{x:0,y:0,z:-1}); 
    cursor.setAttribute('geometry',{primitive:'ring',radiusInner:0.02,radiusOuter:0.03}); 
    cursor.setAttribute('material',{color:'#ccc',shader:'flat'}) 
    cursor.setAttribute('cursor',{fuse:true,fuseTimeout:500}); 
    // Make the light:
    var light = document.createElement('a-entity'); 
    light.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,}); 
    // Package 'em together:
    cursor.appendChild(light);
    camera.appendChild(cursor); 
    // Reset some things on daydreamController: (remove light and set inVR as false)
  	let daydreamController = this.el.querySelector('#lasers');
    daydreamController.setAttribute('user',{inVR:false}); 
    daydreamController.removeAttribute('light'); 
  }
});




async function getWikiData () {
	// define query string:
  let title = 'Albert_Einstein';
	// CHANGE: We can use this to grab section data!
	// Okay. Let's get sections in general!
  let queryUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${title}&redirects=1&prop=sections`;
	// let queryUrl  = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=revisions%7Cinfo&titles=${title}&rvprop=content&rvlimit=1&inprop=url`;
	// fetch the data:
  let pageData = await fetch(queryUrl);
	// turn the response into a json object:
  let jsonData = await pageData.json();
	//  Now, lets grab the sections we car about:
  var filteredSections = jsonData.parse.sections.filter((x) => {
  		var check = sectionCheck(x.line);
  		if (x.toclevel == 1 && check == true) {
  			return true;
  		}  		else {
  			return false;
  		}
  	}
  );
  // Getting images from the sections that survived filtering:
  for (var s in filteredSections) {
  	var imgURL = await imageGrabber(filteredSections[s]);
  	filteredSections[s].foo = 'bar';
  }
	// return the response:
  return filteredSections;
	// console.log(jsonData);
}

function createTextEl (str, theta) {
  var textEl = document.createElement('a-text');
  textEl.setAttribute('value', str);
  textEl.setAttribute('align', 'center');
  textEl.setAttribute('anchor', 'center');
  textEl.setAttribute('baseline', 'bottom');
  textEl.setAttribute('scale', {x: 7, y: 7, z: 7});
  textEl.setAttribute('side', 'double');
  textEl.setAttribute('position', {x: 0, y: 2, z: 0});
  // textEl.setAttribute('rotation', {x: 0, y: theta, z: 0});
  textEl.setAttribute('font', 'dejavu');
  textEl.setAttribute('color','white')
  return textEl;
}

function sectionCheck (sectTitle) {
  const badHeadings = ['content', 'See also', 'Notes', 'References', 'External links', 'Further reading', 'Sources'];
  const badStrings = [/publications/gi, /notes/gi, /references/gi, /citations/gi, /sources/gi];
  var index = badHeadings.indexOf(sectTitle);
  var searches = true;
  if (index != -1) {
		// We've matched a bad heading
    return false;
  } else {
		// we check further:
    var result;
    for (var s in badStrings) {
      result = sectTitle.search(badStrings[s]);
      if (result != -1) {
        break;
      }
    }
    if (result == -1) {
      return true;
    } else {
      return false;
    }
  }
}

async function imageGrabber (sectionObj) {
  let imgQuery = `https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${sectionObj.fromtitle}&redirects=1&prop=images&section=${sectionObj.index}`;
  let imgResp = await fetch(imgQuery);
  let parsedImgs = await imgResp.json();
  // console.log(parsedImgs);
  return 'foo';
}


