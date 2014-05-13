'use strict';

function Terrain(detail) {
	this.size = Math.pow(2, detail) + 1;
	this.max = this.size - 1;
	this.map = new Float32Array(this.size * this.size);
}

Terrain.prototype.generate = function(roughness) {
	var self = this;

	// set the corners to a "seed" value 
	// this starts all corners halfway up the cube
	this.set(0, 0, self.max / 2);
	this.set(this.max, 0, self.max / 2);
	this.set(this.max, this.max, self.max / 2);
	this.set(0, this.max, self.max / 2);

	// look at smaller and smaller divisions of the height map
	divide(this.max);

	function divide(size) {
		var x, y,
			half = size / 2,
			scale = roughness * size;

		// exit once we get too small
		if (half < 1) {
			return;
		}

		for (y = half; y < self.max; y += size) {
			for (x = half; x < self.max; x += size) {
				square(x, y, half, Math.random() * scale * 2 - scale);
			}
		}
		for (y = 0; y <= self.max; y += half) {
			for(x = (y + half) % size; x <= self.max; x += size) {
				diamond(x, y, half, Math.random() * scale * 2 - scale);
			}
		}

		// recursively call the function
		divide(size / 2);
	}

	function average(values) {
		var valid = values.filter(function(val) { return val !== -1; });
		var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
		return total / valid.length;
	}

	function square(x, y, size, offset) {
		var ave = average([
			self.get(x - size, y - size),	// upper left
			self.get(x + size, y - size),	// upper right
			self.get(x + size, y + size),   // lower right
			self.get(x - size, y + size)    // lower left			
		]);
		self.set(x, y, ave + offset);
	}

	function diamond(x, y, size, offset) {
		var ave = average([
			self.get(x, y - size),	// top
			self.get(x + size, y),	// right
			self.get(x, y + size),  // bottom
			self.get(x - size, y)   // left
		]);
		self.set(x, y, ave + offset);
	}
};

Terrain.prototype.draw = function(ctx, width, height) {
	var self = this;
	var waterVal = this.size * 0.3;

	for (var y = 0; y < this.size; y += 1) {
		for (var x = 0; x < this.size; x += 1) {
			var val = this.get(x, y),
				top = project(x, y, val),
				bottom = project(x + 1, y, 0),
				water = project(x, y, waterVal),
				style = brightness(x, y, this.get(x + 1, y) - val);

			rect(top, bottom, style);
			rect(water, bottom, 'rgba(50, 150, 200, 0.15');
		}
	}

	function rect(a, b, style) {
		if (b.y < a.y) { return; }
		ctx.fillStyle = style;
		ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
	}

	function brightness(x, y, slope) {
		if (y === self.max || x === self.max) {
			return '#000';
		}

		var b = ~~(slope * 50) + 128;
		return ['rgba(', b, ',', b, ',', b, ',1)'].join('');
	}

};