// An aframe script to display a given section of a article!

AFRAME.registerComponent('wiki', {
  dependencies: ['raycaster', 'daydream-controls'],
  schema: {
  	title: {default: 'Albert_Einstein'},
  	sections: {default: []},
  	currentSection: {default: ''},
  	level: {default: 0}
  },
  // insert a schema here:

  // Then what? init and update architecture:
  init: async function () {
  	console.log('wiki init');
  	// This all takes places with the default data:
  	var sectionStuff = await getWikiStuff(this.data.title);
  	// The section array will get filled in.
  	this.el.setAttribute('wiki', {sections: sectionStuff});
  	// Using sections, we can construct a scene:
  	sceneConstructor(this.el,sectionStuff);
    this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
  },
  // The update portion:
  update: async function () {
  	console.log('wiki update');
  	console.log(this.data);
  	console.log(this);
  	// // Check and see if we have a scene to make:
  	// if (this.data.sections != this.oldData.sections) {
  	// 	console.log('NEW SCENE');
  	// 	sceneConstructor(this.data.sections);
  	// }
  	// Now, we can update the scene accordingly:

  	// Filter sections according to current section/level...

  	// plop stuff in the scene

  	// move the camera (if necessary)

  	// do it!
  }
});

async function getWikiStuff (title) {
	// Okay. Let's get sections in general!
  let queryUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${title}&redirects=1&prop=sections`;
	// fetch the data:
  let pageData = await fetch(queryUrl);
	// turn the response into a json object:
  let jsonData = await pageData.json();
	// get all sections:
  let sections = jsonData.parse.sections;
	// And return 'em:
  return sections;
}

function sceneConstructor (el,sections) {
	// Use section data to make a scene structure. Pipes aboutnd lines, really!
  console.log('constructor!!!!!')
	// Lets filter the scenes, removing the ones we don't care about:
  var filtSections   = sections.filter(x => sectionChecker(x.line));
  // Using filt scenes. we add things to the scene. 
  var baseSections = filtSections.filter( x => x.toclevel == '1'); 
  var circGeo      = await new THREE.CircleGeometry(12, baseSections.length);
  // Using base sections, we make section buildings for each base section: 
  for(var s in baseSections){
    var theta = 180 + s * (360 / filtSections.length);
    constructSection(el,baseSections[s],filtSections,s,theta,circGeo); 
  }
}

function constructSection(el,baseSection,sections,index,theta,circGeo){
  // Here we construct things using the section data: 
  var newEntity = document.createElement('a-entity');
  // Construct base: 
  var newModel = document.createElement('a-torus-knot');
  newModel.setAttribute('color',"#01FF40");
  newModel.setAttribute('arc',360);
  newModel.setAttribute('p',3);
  newModel.setAttribute('q',5);
  newModel.setAttribute('radius',8);
  newModel.setAttribute('radius-tubular',0.05);
  newModel.setAttribute('segments-radial',32);
  newModel.setAttribute('segments-tubular',120);
  newModel.setAttribute('metalness',0.2);
  newModel.setAttribute('roughness',0.8);
  newEntity.appendChild(newModel); 
  newEntity.setAttribute('position', {x: circGeo.vertices[s + 1].y, y: 1, z: circGeo.vertices[s + 1].x});
  el.appendChild(newEntity); 

  console.log('constructSection')
  // Do more; This will work for now.. 
  // Filter sections to find children: 

  // Level by level, we build the section tower: 
}

// A function to check sections; I'm only about the ones that have links and such. Makin' a maze...
// The function below is a function that will contribute to filtering

function sectionChecker (sectTitle) {
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

// We can do this agnostic to display right now!

// Get data into the container....then build up!

// Think about what we need to do here....
