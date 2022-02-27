
const smap = [
	[ "..-..", "─"],
	[ "..|..", "│"],

	[ "-|+..", "┐"],
	[ ".|+.-", "┌"],
	[ ".|+|-", "├"],
	[ "-|+|.", "┤"],
	[ "-.+|.", "┘"],
	[ "..+|-", "└"],
	[ "-|+.-", "┬"],
	[ "-.+|-", "┴"],
	[ "-|+|-", "┼"],

	[ "..<.-", "\u25C0"],
	[ "-.>..", "\u25B6"],
	[ ".|^..", "\u25B2"],
	[ "..v|.", "\u25Bc"],
];

const simmap = [
	[ "+", "-|+|-" ],
	[ "v", ".|v.." ],
	[ "^", "..^|." ],
	[ "<", "-.<.." ],
	[ ">", "..>.-" ],
];

function findmap(rawstr) {
	const str = rawstr.split("").map((c, i) => {
		const m = simmap.find((x) => x[0][0] == c);
		return m ? m[1][i] : c;
	}).join('');
	return smap.reduce((best, rule) => {
		const score = rule[0].split("").map((c, i) => 
			Math.max(
				2 * (c == str[i]),
				1 * (c == '.')))
		.reduce((a, b) => a * b);
		return score <= best[1] ? best : [rule[1], score];
	}, [str[2], 1])[0];
}

function asciidrawing(text) {
	let a = text.split("\n");
	let drawing = false;
	let makecut = false;
	let curdraw = [];

	a = a.map((cur, i, a) => {
		if (!drawing) {
			if (cur.startsWith("```asciidrawing")) {
				drawing = true;
				const s = cur.split(" ");
				makecut = s[1] == "cut";
				return undefined;
			}
			return cur;
		}

		if (cur != "```") {
			curdraw.push(cur);
			return undefined;
		}

		drawing = false;
		curdraw = curdraw.map(function(cur, i, a) {
			let p = a[i-1] || "";
			let n = a[i+1] || "";
			return cur.replace(/[-\+v^<>|]/g, (c, i, s) => {
				const h = s[i-1] || "X";
				const j = n[i]   || "X";
				const k = p[i]   || "X";
				const l = s[i+1] || "X";
				return findmap(h + j + c + k + l)
			});
		});

		if (makecut) {
			hcut = curdraw.reduce((cut, line, i) => 
				line[0] == 'X' ? cut.concat(i) : cut, 
			[]);
			vcut = curdraw[0].split("").reduce((cut, c, i) =>
				c == 'X' ? cut.concat(i) : cut, 
			[]);

			curdraw = curdraw.filter((x, i) => 
				hcut.indexOf(i) < 0
			);
			curdraw = curdraw.map((x) => 
				x.split("").filter((c, i) => 
					vcut.indexOf(i) < 0)
				.join(""));
		}

		curdraw = [ "```" ].concat(curdraw).concat([ "```" ]);
		const ret = curdraw.join("\n");
		curdraw = [];
		return ret;
	});

	a = a.filter((x) => x !== undefined);
	return a.join("\n");
}

var e = document.getElementById('source');
e.textContent = asciidrawing(e.textContent);

var slideshow = remark.create({
    slideNumberFormat: '%current%',
    highlightLines: true,
    highlightSpans: true,
});

