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
  	var filtSections = sceneConstructor(sectionStuff);
  	// We now have filtered sections. Lets make some geometry based upon the scene!
  },
  // The update portion:
  update: async function () {
  	console.log('wiki update');
  	console.log(this.data);
  	console.log(this);
  	// Check and see if we have a scene to make:
  	if (this.data.sections != this.oldData.sections) {
  		console.log('NEW SCENE');
  		sceneConstructor(this.data.sections);
  	}
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

function sceneConstructor (sections) {
	// Use section data to make a scene structure. Pipes and lines, really!

	// Lets filter the scenes, removing the ones we don't care about:
  var filtScenes = sections.filter(x => sectionChecker(x.line));
  console.log('FILT', filtScenes);
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
