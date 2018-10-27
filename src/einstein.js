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
    // Pull data from Wikipedia API:
    var filteredSections = await getWikiData();

    var images = [
    	'https://upload.wikimedia.org/wikipedia/commons/a/ad/Albert_Einstein_as_a_child.jpg',
    	'https://upload.wikimedia.org/wikipedia/commons/1/10/Albert_Einstein_photo_1920.jpg',
    	'https://upload.wikimedia.org/wikipedia/commons/d/d5/Niels_Bohr_Albert_Einstein_by_Ehrenfest.jpg',
    	'https://upload.wikimedia.org/wikipedia/commons/a/a0/NYT_May_4%2C_1935.jpg',
    	'https://upload.wikimedia.org/wikipedia/commons/e/e2/Albert_Einstein_and_Charlie_Chaplin_-_1931.jpg'
    ];

    // Make circle geometry:
    var geometry = await new THREE.CircleGeometry(12, filteredSections.length);
    // Now we add a portal for each of the filtered sections:
    var portalGroup = this.el.querySelector('#portal-group');

    // WE CAN, AND SHOULD, PROBABLY WRITE A COMPONENT SUCH THAT WE CAN REALLY MAKE THE ARTICLE EXPLORATION COME ALIVE!
    for (let i = 0; i < filteredSections.length; i++) {
    	// The Group:
    	var newEntity = document.createElement('a-entity');
    	var theta = 180 + i * (360 / filteredSections.length);
  		var rotationDir = i % 2 == 0 ? 'normal' : 'reverse';
    	// Elements to denote article sections. Messing around with a few options here:

    	// The torus-knot option:

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

  		// The image-box-option:
    	var newModel = document.createElement('a-box');
  		newModel.setAttribute('depth', 3);
  		newModel.setAttribute('width', 3);
  		newModel.setAttribute('height', 3);
  			// newModel.setAttribute('color','#000');
  		newModel.setAttribute('src', images[i]);
  		newModel.setAttribute('class', 'interactive');
  		// The animations might make things pop a bit:
  		// newModel.setAttribute('animation',{property:'rotation',to:{x:0,y:360,z:0},loop:true,dur:16000,easing:'linear',direction:rotationDir});

  		// Text denoting the sections:
  		var textEl = createTextEl(filteredSections[i].line, theta);
    	newEntity.appendChild(newModel);
    	newEntity.appendChild(textEl);
    	newEntity.setAttribute('position', {x: geometry.vertices[i + 1].y, y: 1, z: geometry.vertices[i + 1].x});
    	portalGroup.appendChild(newEntity);
    }
    portalGroup.setAttribute('rotation', {x: 0, y: 180, z: 0});
    // We want to get the geometry of this badboy, and
    // plot things down at the vertices. The things being spinning wormholes.
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
  textEl.setAttribute('rotation', {x: 0, y: theta, z: 0});
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
  console.log(parsedImgs);
  return 'foo';
}
