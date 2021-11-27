function compareAlphaNum(a, b) {
	function isdigit(ch) {return '0' <= ch && ch <= '9';}
	let min = Math.min(a.length, b.length);
	let i;
	for (i = 0; i < min; i++) {
		if (a.charCodeAt(i) !== b.charCodeAt(i)) {break;}
	}
	if (i == min) {return a.length - b.length;}
	if (isdigit(a[i])) {
		if (isdigit(b[i])) {
			if (a[i] === '0' || b[i] === '0') {
				let z;
				for (z = i - 1; z > 0; z--) {
					if (a[z] !== '0') {break;}
				}
				if (!isdigit(a[z])) {z++;}
				if (a[z] === '0' || b[z] === '0') {
					let j;
					for (j = i; ; j++) {
						if (b[j] !== '0') {break;}
					}
					for (; ; i++) {
						if (a[i] !== '0') {break;}
					}
					if (!isdigit(a[i])) {
						if (isdigit(b[j])) {
							return -1;
						} else {
							return i - j;
						}
					} else if (!isdigit(b[j])) {
						return 1;
					} else {
						let cmp = a.charCodeAt(i) - b.charCodeAt(j);
						for (i++, j++; ; i++, j++) {
							if (!isdigit(a[i])) {
								if (isdigit(b[j])) {
									return -1;
								} else {
									if (cmp) {return cmp;}
									return i - j;
								}
							} else if (!isdigit(b[j])) {
								return 1;
							}
						}
					}
				}
			}

			let cmp = a.charCodeAt(i) - b.charCodeAt(i);
			for (i++; ; i++) {
				if (!isdigit(a[i])) {
					if (isdigit(b[i])) {
						return -1;
					} else {
						return cmp;
					}
				} else if (!isdigit(b[i])) {
					return 1;
				}
			}
		} else if (isdigit(a[i - 1])) {
			return 1;
		} else {
			return a.charCodeAt(i) - b.charCodeAt(i);
		}
	} else if (isdigit(b[i])) {
		if (isdigit(b[i - 1])) {
			return -1;
		} else {
			return a.charCodeAt(i) - b.charCodeAt(i);
		}
	} else {
		return a.charCodeAt(i) - b.charCodeAt(i);
	}
}

if (!String.prototype.repeat) {
	String.prototype.repeat = function( num ){
		return new Array( num + 1 ).join( this );
	}
}