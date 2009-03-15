var symbols = ['a','b','c'];
symbols[-1] = '<eps>';
const EPS = -1;


var tropicalSR = {
	// a = abstract
	aSum: function( w1, w2 ) {
		if ( w1 == this.a0 ) return w2;
		if ( w2 == this.a0 ) return w1;
		return Math.min(w1, w2);
	},
	aProduct: function( w1, w2 ) {
		if ( ( w1 == this.a0 ) || ( w2 == this.a0 ) ) return this.a0;
		return w1 + w2;
	},
	a0: "+inf",
	a1: 0,
	aProductClosure: function ( w ) {
		return this.a0;
	}
}

var realSR = {
	// a = abstract
	aSum: function( w1, w2 ) {
		return w1 + w2;
	},
	aProduct: function( w1, w2 ) {
		return w1 * w2;
	},
	a0: 0,
	a1: 1,
	aProductClosure: function ( w ) {
		if ( w > 1 ) return undefined;
		if ( w == 1 ) return 1;
		return 1 / ( 1 - w );
	}
}

function FSM( )
{
/*
 * variable names:
 *
 * Q = states
 * E = transitions
 * F = final weights
 * I = initial weights
 *
 * p = source state
 * q = target state
 * r = next target state
 *
 * a = input symbol
 * b = output symbol
 *
 * s = semiring
 *
 */

	var fsm = this;

	var Q = [];
	fsm.Q = Q;

	const E = 0;	// transitions
	const F = 1;	// final w
	const I = 2;	// initial w

/* example: 
 * state 1 with final weight 0.8 
 * and outgoing transition 
 * 	to state 2 
 * 	with input symbol 3 
 * 	and output symbol 4
 * 	and transitions weight 0.5
 * will look like
 *
 * Q[1][E][2][3][4] = 0.5
 * Q[1][F] = 0.8
 */

	var sr = realSR;
	
	fsm.setSR = function( semiring )
	{
		sr = semiring;
	}




	// general helpers  --------------------------------------------------------------------

	function extendObject( obj1, obj2 )
	{
		for (attrname in obj2) { 
			obj1[attrname] = obj2[attrname]; 
		}
	}

	// fsm helpers  --------------------------------------------------------------------

	function ensureQ( q )
	{
		if (! Q[q] ) {
			setQ( q );
		}
	}

	function setQ( q )
	{
		Q[q] = [];
		Q[q][E] = {};
		Q[q][F] = sr.a0;
		Q[q][I] = sr.a0;
	}

	fsm.setE = function( p, q, a, b, w ) 
	{
		if ( b == undefined ) b = a;
		if ( w == undefined ) w = sr.a1;	// weight trivially

		ensureQ( p );
		ensureQ( q );

		if (! Q[p][E][q] ) Q[p][E][q] = {}; 
		if (! Q[p][E][q][a] ) Q[p][E][q][a] = {}; 
		
		// if E already exists: add new weight to old weight
		Q[p][E][q][a][b] = w;
		return;

		//alert(w);
		//alert( fsm.getE( p, q, a, b ) + " + " + w );
		Q[p][E][q][a][b] = sr.aSum( 
			fsm.getE( p, q, a, b ),
			//Q[p][E][q][a][b],
			w
		);

		alert("p = " + p + ", q = " + q + ", w = " + Q[p][E][q][a][b] );
	}

	fsm.isE = function( p, q, a, b ) 
	{
		return (
			( Q[p][E][q] != undefined ) &&
			( Q[p][E][q][a] != undefined ) &&
			( Q[p][E][q][a][b] != undefined )
		);
	}
	
	fsm.unsetE = function( p, q, a, b ) 
	{
		if (! fsm.isE( p, q, a, b ) ) return;
		delete Q[p][E][q][a][b];
		/*
		if ( a == undefined ) {
			delete Q[p][E][q];
			return;
		}
		if ( b == undefined ) {
			delete Q[p][E][q][a];
			return;
		}
		delete Q[p][E][q][a][b];
		*/
	}

	fsm.getE = function( p, q, a, b ) 
	{
		/*
		if ( q == undefined ) return Q[p][E]; 
		if ( a == undefined ) return Q[p][E][q]; 
		if ( b == undefined ) return Q[p][E][q][a];
		*/
		if (! fsm.isE( p, q, a, b ) ) {
			if (
				( p == q ) &&
				( a == EPS ) &&
				( b == EPS )
			) {
				return sr.a1;
			} else {
				return sr.a0;
			}
		}
		return Q[p][E][q][a][b];
	}

	fsm.setI = function( q, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		ensureQ( q );
		Q[q][I] = w;
	}

	fsm.unsetI = function( q ) 
	{
		ensureQ( q );
		Q[q][I] = sr.a0;
	}
	fsm.getI = function( q ) 
	{
		ensureQ( q );
		return Q[q][I];
	}
	fsm.isI = function( q ) 
	{
		return ( Q[q][I] != sr.a0 );
	}


	fsm.setF = function( q, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		ensureQ( q );
		Q[q][F] = w;
	}
	fsm.unsetF = function( q ) 
	{
		ensureQ( q );
		Q[q][F] = sr.a0;
	}
	fsm.getF = function( q ) 
	{
		ensureQ( q );
		return Q[q][F];
	}
	fsm.isF = function( q ) 
	{
		return ( Q[q][F] != sr.a0 );
	}

	// increase all state indicies in Q[][E] by offset
	fsm.transposeE = function( p, offset )
	{
			var E2 = {};
			for ( var q in Q[p][E] ) {
				E2[parseInt( q ) + parseInt( offset )] = Q[p][E][q];
			}
			Q[p][E] = E2;
	}

	// create a new start state
	// connect it with all other ones
	// unset them
	fsm.swapI = function()
	{
		var q0 = Q.length;
		setQ( q0 );
		for ( var q in Q ) {
			if (! fsm.isI( q ) ) continue;
			fsm.setE( q0, q, EPS );
			fsm.unsetI( q );
		}
		fsm.setI( q0 );
		return q0;
	}


	// binary operations  --------------------------------------------------------------------

	fsm.union = function( fsm2 )	// destroys fsm2
	{
		var q0 = fsm.swapI();
		Q = Q.concat( fsm2.Q );

		for ( var q in Q ) {
			// transpose former fsm2 E targets
			if ( q <= q0 ) continue;
			fsm.transposeE( q, q0 + 1 );
			// connect q0 with fsm2 initial states
			if (! fsm.isI( q ) ) continue;
			fsm.setE( q0, q, EPS );
			fsm.unsetI( q );
		}
	}

	fsm.concat = function( fsm2 )	// destroys fsm2
	{
		var fsm1Length = Q.length;
		Q = Q.concat( fsm2.Q );

		fsm2I = {};
		for ( var q in Q ) {
			if ( q < fsm1Length ) continue;
			fsm.transposeE( q, fsm1Length );
			// remember all fsm2 start states
			if (! fsm.isI( q ) ) continue;
			fsm2I[q] = fsm.getI( q );
		}

		// connect fsm1 final states with fsm2 start states
		for ( var p in Q ) {
			if ( p >= fsm1Length ) continue;
			if (! fsm.isF( p ) ) continue;
			for ( var q in fsm2I ) {
				fsm.setE( 
					p, q, EPS, EPS, 
					sr.aProduct(
						fsm.getF( p ),
						fsm2I[q]
					)
				);
			}
			fsm.unsetF( p );
		}

		// unset fsm2 start states
		for ( var q in fsm2I ) {
			fsm.unsetI( q );
		}
	}

	fsm.intersect = function( fsm1, fsm2 )
	{
		for ( var p1 in fsm1.Q ) {
			for ( var p2 in fsm2.Q ) {
				var p3 = p1 * fsm2.Q.length + parseInt( p2 );
				if ( fsm1.isI( p1 ) && fsm2.isI( p2 ) ) {
					fsm.setI(
						p3,
						sr.aProduct(
							fsm1.getI( p1 ),
							fsm2.getI( p2 )
						)
					);
				}
				if ( fsm1.isF( p1 ) && fsm2.isF( p2 ) ) {
					fsm.setF(
						p3,
						sr.aProduct(
							fsm1.getF( p1 ),
							fsm2.getF( p2 )
						)
					);
				}
				for ( var q1 in fsm1.Q[p1][E] ) {
					for ( var q2 in fsm1.Q[p2][E] ) {
						var q3 = q1 * fsm2.Q.length + parseInt( q2 );
						for ( var a in fsm1.Q[p1][E][q1] ) {
							for ( var b in fsm1.Q[p1][E][q1][a] ) {
								if (! fsm2.isE( p2, q2, a, b ) ) continue;
								fsm.setE( 
									p3, q3, a, b,
									sr.aProduct(
										fsm1.getE( p1, q1, a, b ),
										fsm2.getE( p2, q2, a, b )
									)
								);
							}
						}
					}
				}
			}
		}
	}
	// unary operations  --------------------------------------------------------------------

	fsm.plusClosure = function()
	{
		for ( var p in Q ) {
			if ( fsm.isF( p ) ) {
				for ( var q in Q ) {
					if ( fsm.isI( q ) ) {
						fsm.setE( p, q, EPS, EPS, fsm.getF( p ) );
					}
				}
			}
		}
	}

	fsm.starClosure = function()
	{
		fsm.plusClosure();
		var q0 = fsm.swapI();
		fsm.setF( q0 );
	}

	fsm.distance = function()
	{
		var d = [];
		for ( var i in Q ) {
			d[i] = [];
			for ( var j in Q ) {
				d[i][j] = fsm.getE( i, j, EPS, EPS );
			}
		}
		//alert(dump(d));
		for ( var k in Q ) {
			var nextd = [];
			for ( var i in Q ) {
				nextd[i] = [];
				for ( var j in Q ) {
					//alert(i + " -> " + j + " = " + d[i][j] );
					nextd[i][j] = sr.aSum( 
						d[i][j],
						sr.aProduct(
							d[i][k],
							sr.aProduct(
								sr.aProductClosure( d[k][k] ),
								d[k][j]
							)
						)
					);
					alert(i + " -> " + k + " -> " + j + " : " + d[i][j] + " + " + d[i][k] + " * " + d[k][k] + " * " + d[k][j] + " = " + nextd[i][j] );
					//alert(k + ", " + d[k][k] + ", " + sr.aProductClosure( d[k][k] ) );
					//alert( nextd[i][j] );
				}
			}
			d = nextd;
		}
		alert(dump(d));
	}

	// equivalence operations  --------------------------------------------------------------------

	fsm.epsClosure = function( p, wToState, epsClosure )
	{
		if ( wToState == undefined ) var wToState = sr.a1;
		if ( epsClosure == undefined ) var epsClosure = {};
		//epsClosure[p] = sr.a0;
		epsClosure[p] = wToState;

		for ( var q in Q[p][E] ) {
			for ( var a in Q[p][E][q] ) {
				if ( a != EPS ) continue;
				for ( var b in Q[p][E][q][a] ) {
					if ( b != EPS ) continue;
					// check if q already in closure
					if (! epsClosure[q] ) {
						epsClosure[q] = sr.aProduct(
							wToState,
							Q[p][E][q][a][b]
						);
						extendObject( 
							epsClosure, 
							fsm.epsClosure( q, epsClosure[q], epsClosure ) 
						);
					} else {
						epsClosure[q] = sr.aProduct(
							epsClosure[q],
							sr.aProductClosure(
								sr.aProduct(
									wToState/epsClosure[q],
									Q[p][E][q][a][b]
								)
							)
						);
					}
				}
			}
		}
		return epsClosure;
	}

	fsm.removeEpsilon = function()
	{
		var epsClosure = [];
		for ( p in Q ) {
			epsClosure[p] = fsm.epsClosure( p ); 
		}

		for ( p in Q ) {
			for ( var q in epsClosure[p] ) {
				for ( var r in Q[q][E] ) {
					for ( var a in Q[q][E][r] ) {
						if ( a == EPS ) continue;
						for ( var b in Q[q][E][r][a] ) {
							if ( b == EPS ) continue;
							fsm.setE( 
								p, r, a, b, 
								sr.aProduct( 
									epsClosure[p][q], 
									fsm.getE( q, r, a, b ) 
								)
							);
							fsm.setF(
								p,
								sr.aSum(
									( p != q ?  fsm.getF( p ) : sr.a0 ),
									sr.aProduct(
										epsClosure[p][q],
										fsm.getF( q )
									)
								)
							);
/*
							alert( 
								"p: " + p + 
								", target: " + q + 
								", next: " + r + 
								", E: " + fsm.getE( p, r, a, b ) +
								", F(" + p + "): " + fsm.getF( p )
							);
*/
						}
					}
				}
				fsm.unsetE( p, q, EPS, EPS );
			}
		}
	}

	

	fsm.print = function()
	{
		var code = "digraph {\n" ;	
		for ( var p in Q ) {
			for ( var q in Q[p][E] ) {
				for ( var a in Q[p][E][q] ) {
					for ( var b in Q[p][E][q][a] ) {
						code += 
							p + 
							" -> " + 
							q + 
							" [ label=\"" + 
							symbols[a] + 
							( a != b ?  ":" + symbols[b] : "" ) +
							( fsm.getE( p, q, a, b ) != sr.a1 ? "/" + fsm.getE( p, q, a, b ) : "" ) + 
							"\" ] \n" ;
					}
				}
			}
		}
		for ( var q in Q ) {
			if ( fsm.isF( q ) ) {
				code += q + " [ shape=\"doublecircle\" ]\n";	
			} else {
				code += q + " [ shape=\"circle\" ]\n";	
			}
			if ( fsm.isI( q ) ) {
				code += q + " [ style=\"bold\" ]\n";
			} 
			code += q + 
				" [ label=\"" + q + 
				// print weights only if not a0 or a1
				( ( fsm.isI( q ) && fsm.getI( q ) != sr.a1 ) ? "\\nI=" + fsm.getI( q ) : "" ) + 
				( ( fsm.isF( q ) && fsm.getF( q ) != sr.a1 ) ? "\\nF=" + fsm.getF( q ) : "" ) + 
				"\" ]\n";	
		}
		code += "rankdir=LR\n" ;	
		code += "}" ;	

		document.write( '<textarea cols="40" rows="20">' + code + "</textarea>" );	
		document.write( "<img src='fsm.gif.php?code=" + code + "'>" );	
		document.write( '<br>' );	
	}

}

function exampleEpsRemoval()
{
	fsm = new FSM();

	fsm.setE( 0, 1, 0, 0, 0.25 );
	fsm.setE( 0, 1, EPS, EPS, 0.5 );
	fsm.setE( 1, 1, EPS, EPS, 0.2 );
	fsm.setE( 1, 0, 1, 1, 0.5 );

	fsm.setI( 1, 1 );
	fsm.setF( 1, 0.3 );
	fsm.setF( 0, 0.25 );

	fsm.print();
	//	fsm.distance();
	//return;
	fsm.removeEpsilon();
	fsm.print();
}

function exampleSimple()
{
	fsm = new FSM();
	fsm.setE( 0, 1, 0 );
	fsm.setE( 0, 2, 1 );

	fsm.setI( 0 );
	fsm.setF( 1, 0.5 );
	fsm.setF( 2, 0.4 );

	fsm.print();
	fsm.starClosure();
	fsm.print();
}

function exampleClosure()
{
	fsm = new FSM();

	fsm.setI( 0 );
	fsm.setF( 0, 0.5 );

	fsm.print();
	fsm.starClosure();
	fsm.print();
}

function exampleClosureTropical()
{
	fsm = new FSM();
	fsm.setSR( tropicalSR );

	fsm.setI( 3 );
	fsm.setE( 3, 0, 0 );
	fsm.setE( 3, 1, 2 );
	fsm.setE( 1, 2, 1 );
	fsm.setE( 2, 1, 2, 2, 1 );

	fsm.setI( 3 );
	fsm.setF( 0, 2 );
	fsm.setF( 2, 1 );

	fsm.print();
	fsm.starClosure();
	fsm.print();
	fsm.removeEpsilon();
	fsm.print();
}

function exampleUnion()
{
	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2 );

	fsm1.print();

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0 );
	fsm2.setF( 1 );

	fsm2.print();

	fsm1.union( fsm2 );
	fsm1.print();
}

function exampleConcat()
{
	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	fsm1.print();

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1 );

	fsm2.print();

	fsm1.concat( fsm2 );
	fsm1.print();
}

function exampleIntersect()
{
	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1, 1, 0.5 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	fsm1.print();

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 1, 1, 0.6 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1, 0.5 );

	fsm2.print();

	fsm3 = new FSM();
	fsm3.intersect( fsm1, fsm2 );
	fsm3.print();
}

//exampleUnion();
//exampleConcat();
exampleIntersect();

//exampleEpsRemoval();
//exampleSimple();

//exampleClosure();
//exampleClosureTropical();

//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );

/*
function dump( obj )
{
	var out = '';
	for ( var attr in obj ) {
		out += attr + ': ' + obj[attr] + "\n";
	}
	return out;
}
*/
/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}
