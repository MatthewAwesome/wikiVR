// a script that's associated with Einstein...

AFRAME.registerComponent('einstein', {
  /**
  Basically we can have an HTML <--> JS bridge. Elements can be accessed accordingly.
   * Code within this function will be called when everything in <a-scene> is ready and loaded.
   */
  init: async function () {
    // Set event handlers for enter/leave VR:
    var sceneEl = document.querySelector('a-scene');
    this.intoVR = AFRAME.utils.bind(this.intoVR, this);
    this.outOfVR = AFRAME.utils.bind(this.outOfVR, this);
    this.el.addEventListener('enter-vr', this.intoVR);
    this.el.addEventListener('exit-vr', this.outOfVR);
    var wikiEl = document.querySelector('#wikiscene'); 
    wikiEl.setAttribute('title','dude')
  },
  update: function () {
  	console.log('update');
  },

  intoVR: function () {
  	// Make visible the daydream cursor,
  	console.log('in VR');
  	// Make visible the daydream cursor,
  	var daydreamController = this.el.querySelector('#lasers');
  	daydreamController.setAttribute('visible', true);
  	// Hide the camera cursor:
  	// var camera = this.el.querySelector('#non-vr-camera');
  	// camera.setAttribute('active',false);
  	// var cursor = this.el.querySelector('#acc-camera');
  	// cursor.setAttribute('visible',false);
  },
  outOfVR: function () {
  	console.log('out of VR');
  	// Make visible the daydream cursor,
  	var daydreamController = this.el.querySelector('#lasers');
  	daydreamcontroller.setAttribute('visible', false);
  	// Hide the camera cursor:
  	// var camera = this.el.querySelector('#non-vr-camera');
  	// camera.setAttribute('active',true);
  	// var cursor = this.el.querySelector('#acc-camera');
  	// cursor.setAttribute('visible',true);
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

      // var newModel = document.createElement('a-torus-knot');
      // newModel.setAttribute('color',"#01FF40");
      // newModel.setAttribute('arc',360);
      // newModel.setAttribute('p',3);
      // newModel.setAttribute('q',5);
      // newModel.setAttribute('radius',0.8);
      // newModel.setAttribute('radius-tubular',0.05);
      // newModel.setAttribute('segments-radial',32);
      // newModel.setAttribute('segments-tubular',120);
      // newModel.setAttribute('metalness',0.2);
      // newModel.setAttribute('roughness',0.8);

