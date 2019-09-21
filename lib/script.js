var LSystem = (function(){

   return(
     function LSystem(config) {
       var axiom = config.axiom;
       var rules = config.rules;
       var states = [axiom];

       const applyRuleTo = variable => (
         rules[variable] || variable
       );


       function applyRulesTo(state) {
         return(
           state
            .split('')
            .map(applyRuleTo)
            .join('')
         );
       }

       function getState(n) {
         if(n < 0) {
           return axiom;
         }

         if(states[n]) {
           return states[n];
         }

         return(
           states[n] = applyRulesTo(getState(n - 1))
         );
       }

       function getStates() {
         return states;
       }

       function generateTo(n) {
         return(
           getState(n) && getStates()
         );
       }

       return({
        getState: getState,
        getStates: getStates,
        generateTo: generateTo
       });
     }
   );
})();

var TurtleGraphic = (function() {
  return function TurtleGraphic($, actions) {

    var self = {
      angle: 25
    };

    function draw(commands, n=1, color) {
      $.canvas.width = $.canvas.parentElement.clientWidth,
      $.canvas.height = $.canvas.parentElement.clientHeight;
      $.setTransform(1, 0, 0, 1, 0, 0);
      $.save();
      $.clearRect(0, 0, $.canvas.width,  $.canvas.width);

      $.fillStyle = 'rgba(10, 13, 47, 1)';
      $.fillRect(0, 0, $.canvas.width, $.canvas.height);
      $.translate($.canvas.width / 2, $.canvas.height);
      $.strokeStyle = color || '#1F1F1F';
      $.lineWidth = 3;
      self.length = $.canvas.height * 0.35 * Math.pow(0.5, n);
      commands.split('').forEach(command => {
        if(command in actions) {
          actions[command].call(self, $);
        } else {
          ;
        }
      });
    }

    return({
      draw: draw
    });
  }
})();

var Tree = (function() {
  return(
    function($) {
      function extend($) {
        $.beginPath();
        $.moveTo(0, 0);
        $.lineTo(0, -this.length);
        $.translate(0, -this.length);
        $.stroke();
      }

      function branchRight($) {
        $.rotate(-this.angle * Math.PI/180);
      }

      function branchLeft($) {
        $.rotate(this.angle * Math.PI/180);
      }

      function saveSpot($) {
        $.save();

      }

      function goBack($) {
        $.restore();
      }

      function doNothing() {
        ;
      }

      return TurtleGraphic($, {
        "F": extend,
        "+": branchRight,
        "-": branchLeft,
        "[": saveSpot,
        "]": goBack,
        "X": doNothing
      });
    }
  );
})();

function scrollToBio(clickEvent) {
  var bio = document.getElementById('bio');

  if(clickEvent) {
    clickEvent.preventDefault();
  }

  if(bio.scrollIntoView) {
    bio.scrollIntoView({behavior: 'smooth', block: 'center'});
  } else {
    window.location.hash = '#bio';
  }
}

requestAnimationFrame((function() {
  var finished = false;
  var last = 0;
  var alpha = 0;
  var n = 1;
  var k = 5;
  var series = LSystem({axiom: 'X', rules: {
    "X": "F+[[X]-X]-F[-FX]+X",
    "F": "FF"
  }}).generateTo(k);

  var ctx = document.getElementById('tree').getContext('2d');
  var tree = Tree(ctx);
  tree.draw(series[n], n);

  function easeIn(t, duration, start, delta) {
    t /= duration;
    return delta*t*t + start;
  }

  function easeOut(t, duration, start, delta) {
    t /= duration;
    return -delta * t*(t-2) + start;
  }

  return(
    function animate(now) {
      var since = now - last;

      if(n < k) {
        if (since >= 2000) {
          last = now;
          n += 1;
        }
      }


      if(n === k && alpha >= 1) {
        if(!finished) {
          setTimeout(function() {
            scrollToBio(false);
          }, 500);

          finished = true;
        }
      } else {
        alpha = since > 1500 ?
          easeOut(since - 1500, 500, 1, -1) :
          easeIn(since, 1000, 0, 1);
      }

       tree.draw(series[n], n,
        `rgba(245, 242, 208, ${alpha})`);

      requestAnimationFrame(animate);
    }
  );
})());

var button = document.getElementById('next-button');

button.addEventListener('click', scrollToBio);
