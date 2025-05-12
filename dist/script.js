var plantedPlants = [];
const plantOptions = {
  sunflower: [
    "Sunflower",
    "https://g.tdchristian.ca/the-garden-game/dist/assets/GIRASOLE.png",
    30, // start size
    110, // max size
    10 // growth rate per day
  ],
  rose: [
    "Cherry",
    "https://g.tdchristian.ca/the-garden-game/dist/assets/CHERRY.png",
    20, // start size
    80, // max size
    10 // growth rate per day
  ],
  poppy: [
    "Walnut",
    "https://g.tdchristian.ca/the-garden-game/dist/assets/NOCE.png",
    50, // start size
    70, // max size
    5 // growth rate per day
  ],
  fancy: [
    "Peapod",
    "https://g.tdchristian.ca/the-garden-game/dist/assets/PEA%20(1).png",
    40, // start size
    100, // max size
    20 // growth rate per day
  ]
};

// clone the pots several times, procedurally
// jquery
function duplicateElement(holder, element, iterations) {
  for (let i = 0; i < iterations - 1; i++) {
    let clone = element.clone();
    clone.appendTo(holder);
  }
}

function createElementsFromDict(holder, dict) {
  for (const [key, value] of Object.entries(dict)) {
    let name = value[0];
    let image = value[1];
    
    var newElement = $(
      '<img class="plant" src="' + image + '" draggable="true" />'
    );
    newElement.appendTo(holder);
    
    newElement.attr("Name", name);
    newElement.attr("Image", image);
    newElement.attr("StartSize", value[2]);
    newElement.attr("MaxSize", value[3]);
    newElement.attr("GrowthRate", value[4]);
  }
}

//
duplicateElement($("#pots"), $(".pot-wrap"), 8);
createElementsFromDict($("#hotbar"), plantOptions);

$(".plant").draggable({
  helper: function() {
    let clone = $(this).clone();
    clone.addClass("dragging"); // add the transparency class
    
    return clone;
  },
  
  start: function() {
    $(".pot-img").addClass("highlight");
  },
  stop: function() {
    $(".pot-img").removeClass("highlight");
  },
});

$(".tool").draggable({
  helper: function() { // i hate repeating code but idc
    let clone = $(this).clone();
    clone.addClass("dragging");
    
    return clone;
  },
});

$(".plant-drop").droppable({
  accept: ".plant",
  
  over: function(event, ui) {
    $(this).addClass("highlight-hover");
  },
  out: function(event, ui) {
    $(this).removeClass("highlight-hover");
  },
  
  drop: function (event, ui) {
    $(this).removeClass("highlight-hover");
    
    if ($(this).attr("planted")) {
    } else {
      let name = ui.draggable.attr("Name");
      let image = ui.draggable.attr("Image");
      let startSize = ui.draggable.attr("StartSize")
      let maxSize = ui.draggable.attr("MaxSize")
      let growthRate = ui.draggable.attr("GrowthRate")
      
      var newElement = $(
        '<img class="planted" src="' + image + '" draggable="true" />'
      );
      
      newElement.addClass("unwatered")

      let pot = $(this);

      pot.append(newElement);
      pot.attr("planted", true);
      
      newElement.width(startSize)
      newElement.height(startSize)
      
      pot.addClass("planted");
      
      // prob should have a more efficient way of passing on data but whatever
      newElement.attr("MaxSize", maxSize);
      newElement.attr("GrowthRate", growthRate);
      
      plantedPlants.push(newElement);
      
      // handle tool droppables
      newElement.droppable({
        accept: "#wateringcan, #shovel",
        
        over: function(event, ui) {
          console.log('hovering...');
          $(this).addClass("highlight-hover");
        },
        out: function(event, ui) {
          console.log('nope nvm');
          $(this).removeClass("highlight-hover");
        },
        
        drop: function (event, ui) {
          $(this).removeClass("highlight-hover");
          let id = ui.draggable.attr("id");
          
          if (id == "wateringcan") {
            console.log("Water this plant");
            
            newElement.attr("watered", true);
            newElement.removeClass("unwatered");
          }
          
          if (id == "shovel") {
            console.log("Shovel this plant");
            let index = plantedPlants.indexOf(newElement);
            
            plantedPlants.splice(index, 1)
            
            newElement.remove();
            pot.removeClass("planted");
            pot.removeAttr("planted");
            
            
          }
        }
      });
    }
  }
});

function countSecond() {
  remainingTime--;
  
  $("#timer").text("Hour " + (24 - remainingTime));
  $("#days").text("Day " + dayCounter);

  if (remainingTime === 0) {
    // clearInterval(timer);
    remainingTime = dayLength;
    dayCounter++;
    
    for (let i = 0; i < plantedPlants.length; i++) {
      let element = $(plantedPlants[i]);
      
      if (element.attr("watered")) {
        let position = element.position();

        element.removeAttr("watered") // no longer watered
        element.addClass("unwatered")

        let growthRate = element.attr("GrowthRate");
        let maxSize = element.attr("MaxSize");

        console.log(maxSize);

        if (element.width() < maxSize) {
          element.animate({
            width: "+="+growthRate+"px",
            height: "+="+growthRate+"px",
            top: position.top - growthRate,
            left: position.left - (growthRate / 2)
          }, 500) // in millisecond
        };
      };
    };
    
    // you could define a function to happen when time runs out
    // and call it here
    // console.log("Time's up!");
  }
}

const dayLength = 24;
let remainingTime = dayLength;
let dayCounter = 1;

// setInterval makes a repeating event
// the first arg is the function to happen
// the second is the # of milliseconds (1_000 = 1 second)
const timer = setInterval(countSecond, 1_000);

// music/initialization thing

const startMusic = () => {
  jb = new Jukebox();
  jb.addByElement('bg', $('#bgMusic'));  
  jb.play('bg');
  jb.volume(10)
}

var jb;

$(document).ready(() => {
  startMusic();
});