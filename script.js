// https://api.jqueryui.com/draggable/
// https://jqueryui.com/droppable/

var plantedPlants = [];
const plantOptions = {
  sunflower: [
    "Sunflower",
    "assets/GIRASOLE.png",
    30, // start size
    110, // max size
    10 // growth rate per day
  ],
  rose: [
    "Cherry",
    "assets/CHERRY.png",
    20, // start size
    80, // max size
    10 // growth rate per day
  ],
  potato: [
    "Potato",
    "assets/POTATO.png",
    20, // start size
    90, // max size
    10 // growth rate per day
  ],
  poppy: [
    "Walnut",
    "assets/NOCE.png",
    50, // start size
    70, // max size
    10 // growth rate per day
  ],
  mushroom: [
    "Mushroom_Yellow",
    "assets/MUSHROOM.png",
    20, // start size
    70, // max size
    10 // growth rate per day
  ],
  fancy: [
    "Peapod",
    "assets/PEA.png",
    40, // start size
    100, // max size
    20 // growth rate per day
  ],
  purpleshroom: [
    "PurpleShroom",
    "assets/PURPLESHROOM.png",
    40, // start size
    100, // max size
    10 // growth rate per day
  ]
};

var menuHidden = false;

// clone the pots several times, procedurally
// jquery
function duplicateElement(holder, element, iterations) {
  for (let i = 0; i < iterations; i++) {
    let clone = element.clone();
    clone.attr("data-pot-n", i)
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

function destroyPlant(element) {
  let index = plantedPlants.indexOf(element);
  let pot = $(`.plant-drop[data-pot-n="${element.attr("data-pot-n")}"]`)
  
  plantedPlants.splice(index, 1)
  
  element.remove();
  
  pot.removeClass("planted");
  pot.removeAttr("planted");
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
      // do nothing atm
    } else {
      let name = ui.draggable.attr("Name");
      let image = ui.draggable.attr("Image");
      let startSize = ui.draggable.attr("StartSize")
      let maxSize = ui.draggable.attr("MaxSize")
      let growthRate = ui.draggable.attr("GrowthRate")
      
      var newElement = $(
        '<img class="planted" src="' + image + '" draggable="true" />'
      );

      let pot = $(this);
      
      newElement.addClass("unwatered");
      newElement.removeClass("watered");
      newElement.attr("data-pot-n", pot.attr("data-pot-n"))
      
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
            newElement.attr("watered", true);
            newElement.removeClass("unwatered");
            newElement.addClass("watered")
          };
          
          if (id == "shovel") {
            destroyPlant(newElement)
          }
        }
      });
    }
  }
});

function countSecond() {
  if (menuHidden == false) {
    return
  }
  
  remainingTime--;
  
  let hour = (24 - remainingTime);
  
  $("#timer").text("Hour " + (hour));
  $("#days").text("Day " + dayCounter);
  
  let degree = (hour * (360 / 12)) + 90
  
  document.getElementById("second-hand").style.transform = `rotate(${degree}deg)`;
  
  if (remainingTime === 0) {
    // clearInterval(timer);
    remainingTime = dayLength;
    dayCounter++;
    
    for (let i = 0; i < plantedPlants.length; i++) {
      let element = $(plantedPlants[i]);
      
      if (element.attr("watered")) {
        let position = element.position();
        
        let growthRate = element.attr("GrowthRate");
        let maxSize = element.attr("MaxSize");
        
        if (element.width() < maxSize) {
          element.animate({
            width: "+="+growthRate+"px",
            height: "+="+growthRate+"px",
            top: position.top - growthRate,
            left: position.left - (growthRate / 2)
          }, 500) // in millisecond
        };
      } else {
        destroyPlant(element)
      };
      
      element.attr("watered", false); // no longer watered
      element.addClass("unwatered");
      element.removeClass("watered");
    };
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

var jb = new Jukebox();
jb.addByElement('bg', $('#bgMusic')); 

$("#play-button").click(function() { 
  jb.play('bg');
  console.log("playing background music...")
 
  $(".main-menu").remove()
  
  menuHidden = true;
})

// slider thingy
// we'll use vanilla JS because i cant be bothered to learn the jQuery version
var slider = document.getElementById("volume-slider")
var output = document.getElementById("slide-text")
output.innerHTML = slider.value

slider.oninput = function() {
  console.log("Changing...")
  output.innerHTML = this.value
  jb.volume(this.value);
};