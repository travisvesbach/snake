const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

// grid values and functions
var grid = {
	width: 40,
	height: 40,
	cells: [],
	snakelessCells: [],
	foodValue: '&#9967;',
	// initialized the grid
	initialize: function() {
		this.cells = [];
		for (var x = 0; x < this.width; x++) {
			this.cells.push([]);
			for (var y = 0; y < this.height; y++) {
				this.cells[x].push(' ');
			}
		}
	},
	// updates the grid for 
	update: function(target, filling) {
		let y = target[0];
		let x = target[1];
		this.cells[y][x] = filling;
	},
	// finds all the cells that don't contain part of the snake
	find_snakeless_cells: function() {
		this.snakelessCells = [];
		for (y=0;y<40;y++) {
			for (x=0;x<40;x++) {
				if (this.cells[y][x] !== snake.value) {
					this.snakelessCells.push([y,x]);
				}
			}
		}
	},
	// sets food on a random snakeless cell 
	set_food: function() {
		this.find_snakeless_cells();
		let freePosition = Math.floor(Math.random() * this.snakelessCells.length);
		let target = this.snakelessCells[freePosition];
		this.update(target, this.foodValue);
	},
	// outputs the grid in html
	draw: function(){
		$('.snake-container').html('');
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				let filling = this.cells[x][y]
				if (filling === snake.value || filling === snake.head_value()){
					$('.snake-container').append('<div class="cell snake">'+ filling + '</div>');
				} else if (filling === this.foodValue){
					$('.snake-container').append('<div class="cell food">'+ filling + '</div>');
				} else {
					$('.snake-container').append('<div class="cell">'+ filling + '</div>');
				}
			}
		}
	}
};

// sets the game container's heigh equal to its width
var container_css = function() {
	let containerWidth = $('.snake-container').width();
	$('.snake-container').css({'height': containerWidth + 'px'});
};

// snake values and functions
var snake = {
	value: '&#x26AB',
	startPosition: [20,20],
	startDirection: RIGHT,
	startLength: 1,
	startSpeed: 200,
	currentPosition: [],
	length: 1,
	direction: RIGHT,
	speed: 200,
	// initializes the snake
	initialize: function() {
		this.currentPosition = [];
		this.currentPosition.push(this.startPosition);
		this.length = this.startLength;
		this.direction = this.startDirection;
		this.speed = this.startSpeed;
		this.send_to_grid();
	},
	// sends the snakes coordinates to the grid
	send_to_grid: function() {
		for (var n = 0; n < this.currentPosition.length; n++) {
			if (n === 0) {
				grid.update(this.currentPosition[n], this.head_value());
			} else {
				grid.update(this.currentPosition[n], this.value);
			}
		}
	},
	// increases the snakes length and speed when entering a cell that contains food
	eat_food: function(target) {
		this.currentPosition.unshift(target);
		this.length++;
		this.speed = this.speed * .8;
	},
	// sets the character that is to be the snakes head based on the direction that the snake is heading
	head_value: function() {
		switch (this.direction) {
			case UP:
				return '&#9650;';
			case RIGHT:
				return '&#9658;';
			case DOWN:
				return '&#9660;';
			case LEFT:
				return '&#9668;';
		}
	}, 
	// changes the snakes's direction based on key input
	change_direction: function(key) {
		if (key === LEFT && this.direction !== LEFT && this.direction !== RIGHT) { 
			this.direction = LEFT; 
		} else if (key === UP && this.direction !== UP && this.direction !== DOWN) { 
			this.direction = UP; 
		} else if (key === RIGHT && this.direction !== RIGHT && this.direction !== LEFT) { 
			this.direction = RIGHT; 
		} else if (key === DOWN && this.direction !== DOWN && this.direction !== UP) { 
			this.direction = DOWN; 
		} else {
			return false;
		}
		this.send_to_grid();
		grid.draw();
	}
};

// score values and functions
var score = {
	startScore: 0,
	startScoreModifier: 50,
	score: 0,
	scoreModifier: 50,
	// initializes the score
	initialize: function() {
		this.score = this.startScore;
		this.scoreModifier = this.startScoreModifier;
		$('.score').html('Score: ' + this.score);
	},
	// increases the score and increases how much the score will go up next time 
	increase: function() {
		this.score = this.score + this.scoreModifier;
		this.scoreModifier = this.scoreModifier + 50;
		$('.score').html('Score: ' + this.score);
	}
}

// sets up the game 
function render() {
	container_css();
	grid.initialize();
	snake.initialize();
	score.initialize();
	grid.set_food();
	grid.draw();
}

// checks to see if the snake hit a wall or itself
function check_game_over(target) {
	if (target[0] < 0 || target[0] > 39 || target[1] < 0 || target[1] > 39 || grid.cells[target[0]][target[1]] === snake.value) {
		return true;
	}
	return false;
}

// moves the snake one space in the direction it is facing
function move() {
	var target = []
	switch (snake.direction) { 
		case UP:
			target = [snake.currentPosition[0][0] - 1, snake.currentPosition[0][1]];
			break;
		case RIGHT:
			target = [snake.currentPosition[0][0], snake.currentPosition[0][1] + 1];
			break;
		case DOWN:
			target = [snake.currentPosition[0][0] + 1, snake.currentPosition[0][1]];
			break;
		case LEFT:
			target = [snake.currentPosition[0][0], snake.currentPosition[0][1] - 1];
			break;
	}
	if (check_game_over(target)) {
		return false;
	}
	if (grid.cells[target[0]][target[1]] === grid.foodValue) {
		snake.eat_food(target);
		grid.set_food();
		score.increase();
	} else {
		snake.currentPosition.unshift(target);
		grid.update(snake.currentPosition[snake.currentPosition.length-1], ' ');
		snake.currentPosition.pop();
	}
	snake.send_to_grid();
}

// gets input and calls to change the snake's direction.  If success, it removes the keydown event listener for the round.
var input = function(){
	if(snake.change_direction(event.keyCode) !== false) {
		document.removeEventListener('keydown', input);
	}
}

// askes if the user wants to play again after getting game over
var play_again = function() {
	let playAgain = confirm("Game over! Play again?");
	if (playAgain) {
		window.location.reload(false);
	} else {
		return false;
	}
}

// main game engine for each round
function game() {
	document.addEventListener('keydown', input);
	if (move() === false) {
		play_again();
		return;
	}
	grid.draw();
	setTimeout(function() { game() }, snake.speed);
}

// starts a new game
function new_game() {
	render();
	game();
}

$(document).ready(function(){
	new_game(); 
});