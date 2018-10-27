// An aframe script to display a given section of a article!

// some images: 
const einsteinImages = [
  'https://upload.wikimedia.org/wikipedia/commons/a/ad/Albert_Einstein_as_a_child.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/10/Albert_Einstein_photo_1920.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d5/Niels_Bohr_Albert_Einstein_by_Ehrenfest.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a0/NYT_May_4%2C_1935.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e2/Albert_Einstein_and_Charlie_Chaplin_-_1931.jpg'
];

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
    this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
  	// Using sections, we can construct a scene:
  	await sceneConstructor(this.el,sectionStuff);
    
  },
  // The update portion:
  update: async function () {
  	console.log('wiki update');
  	console.log(this.data);
  	console.log(this);

    // BASICALLY, WE CHECK THE DATA AND SEE WHAT CHANGED...YES! 
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

async function sceneConstructor (el,sections) {
	// Use section data to make a scene structure. Pipes aboutnd lines, really!
  console.log('constructor!!!!!')
	// Lets filter the scenes, removing the ones we don't care about:
  var filtSections   = sections.filter(x => sectionChecker(x.line));

  if(filtSections.length == 0){
    // we need to make this work... 

  }
  else{
    // Using filt scenes. we add things to the scene. 
    var baseSections = filtSections.filter( x => x.toclevel == '1'); 
    var circGeo      = await new THREE.CircleGeometry(64, baseSections.length);
    // Using base sections, we make section buildings for each base section: 
    if(circGeo != null){
      for(let s = 0; s < baseSections.length; s++){
        var theta = 180 + s * (360 / baseSections.length);
        // we are doing this for each base. Let's
        constructSection(el,baseSections[s],filtSections,s,theta,circGeo); 
      }
    }
  }
}

async function constructSection(el,baseSection,sections,index,theta,circGeo){
  // Here we construct things using the section data: 
  console.log(circGeo)
  var newEntity = document.createElement('a-entity');

  // Construct column
  var cyl = makeColumn(3,30); 
  // We put a plane atop the column, too! 
  var plane = makePlatform(32,1); 
  // What about image boxes? 
  if(baseSection.fromtitle == 'Albert_Einstein'){
    // make box: 
    var imageBox = makeImageBox(index); 
    newEntity.appendChild(imageBox); 
  }
  

  // We have to loop through this many levels... 

  // And then we have to build it up! 
  newEntity.appendChild(cyl); 
  newEntity.appendChild(plane); 
  newEntity.setAttribute('position', {x: circGeo.vertices[index + 1].y, y: 0, z: circGeo.vertices[index + 1].x});
  el.appendChild(newEntity); 

  // Do more; This will work for now.. 
  // Filter sections to find children: 

  // Level by level, we build the section tower: 
}

// Function to make a cylinder: 
function makeColumn(radius,height){
  // We have a column container: 
  var column = document.createElement('a-entity'); 
  // Which contains 1: a cylinder: 
  var cylEl = document.createElement('a-cylinder');
  cylEl.setAttribute('color',"#00CE00");
  cylEl.setAttribute('radius',radius);
  cylEl.setAttribute('height',height);
  cylEl.setAttribute('segments-radial',12);
  cylEl.setAttribute('metalness',0.4);
  cylEl.setAttribute('roughness',0.8);
  cylEl.setAttribute('side','double');
  cylEl.setAttribute('position',{x:0,y:height/2,z:0});
  // and 2: A portal torus: 
  var torusEl = document.createElement('a-torus'); 
  torusEl.setAttribute('color',"#00CE22"); 
  torusEl.setAttribute('radius',radius);
  torusEl.setAttribute('segments-radial',16); 
  torusEl.setAttribute('segments-tubular',16); 
  torusEl.setAttribute('radius-tubular',0.6); 
  torusEl.setAttribute('position',{x:0,y:radius,z:-radius}); 
  torusEl.setAttribute('metalness',0.7); 
  // Put the cylinder and torus together to make the column!
  column.appendChild(cylEl); 
  column.appendChild(torusEl); 
  // return the column! 
  return column;
}

// Function to make a platform: 
function makePlatform(radius,level){
  var rep = 16 / (2 ** (level-1)); 
  var planeEl = document.createElement('a-circle'); 
  planeEl.setAttribute('radius',radius);
  planeEl.setAttribute('material',{src:"./assets/floorTexture.png",transparent:true,repeat:{x:rep,y:rep},side:'double',color:'#ccc'}); 
  if(level == 1){
     planeEl.setAttribute('rotation',{x:-90,y:0,z:0}); 
  }
  planeEl.setAttribute('position',{x:0,y:30,z:0});
  return planeEl; 
}

// A function to add image boxes to scene: 
function makeImageBox(i){
  var box = document.createElement('a-box');
  box.setAttribute('depth', 10);
  box.setAttribute('width', 10);
  box.setAttribute('height', 10);
    // box.setAttribute('color','#000');
  box.setAttribute('src', einsteinImages[i]);
  box.setAttribute('class', 'interactive');
  // elevate the box to plane height: 
  box.setAttribute('position',{x:0,y:30,z:0}); 
  return box
}

// Seeing how many levels we must assemble: 
function getLevels(currentSection,sections){
    var childrenSections = sections.filter(
    (x) =>  {
      if(x.number.startsWith(currentSection.number) == true && x.toclevel == currentSection.toclevel + 1){
        return true
      }
      else{
        return false
      }
    }
  ); 
  // determine the maximum level: 
  var levels = childrenSections.map( x => x.toclevel); 
  var maxLevel = Math.max(...levels); 
  return maxLevel; 
}

// To get children sections: 
function getChildrenSections(currentSection,sections){
  var childrenSections = sections.filter(
    (x) =>  {
      if(x.number.startsWith(currentSection.number) == true && x.toclevel == currentSection.toclevel + 1){
        return true
      }
      else{
        return false
      }
    }
  ); 
  // return them: 
  return childrenSections; 
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

// Get data into the container....then build up! #00ce00

// Think about what we need to do here....


  // We are going to put some children columns atop planeEl, if possible! 

  // var childrenSections = getChildrenSections(baseSection,sections); 
  // if(childrenSections.length > 0){
  //   if(childrenSections.length >= 3){
  //     var childCircle =  await new THREE.CircleGeometry(32, childrenSections.length);
  //     var verts = childCircle.vertices; 
  //   }
  //   else{
  //     var a = await new THREE.Vector3(0,0,0); 
  //     var b = await new THREE.Vector3(32,0,0); 
  //     var c = await new THREE.Vector3(-32,0,0); 
  //     var verts = [a,b,c]; 
  //   }
  //   for(let j = 0; j < childrenSections.length; j++){
  //     // We are adding to planeEl here! 
  //     var childCyl = makeColumn(3,30); 
  //     childCyl.setAttribute('rotation',{x:-90,y:0,z:0})
  //     var childPlane = makePlatform(16,2); 
  //     var childGroup = document.createElement('a-entity'); 
  //     childGroup.appendChild(childCyl); 
  //     childGroup.appendChild(childPlane); 
  //     childGroup.setAttribute('position', {x: verts[j+1].y, z: 30, y: verts[j+1].x});
  //     plane.appendChild(childGroup); 
  //   }
  // }

