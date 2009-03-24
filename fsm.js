var symbols = ['a', 'b', 'c', 'd', 'e'];
const EPS = -1;
const EPS1 = -2;
const EPS2 = -3;
symbols[EPS] = '<eps>';
symbols[EPS1] = '<eps1>';
symbols[EPS2] = '<eps2>';


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
		if ( w1 == "+inf" || w2 == "+inf" ) return "+inf";
		return w1 + w2;
	},
	aProduct: function( w1, w2 ) {
		if ( w1 == this.a0 || w2 == this.a0 ) return this.a0;
		if ( w1 == "+inf" || w2 == "+inf" ) return "+inf";
		return w1 * w2;
	},
	a0: 0,
	a1: 1,
	aProductClosure: function ( w ) {
		if ( w > 1 ) return "+inf";
		if ( w == 1 ) return 1;
		return 1 / ( 1 - w ) ;
	}
}

function FSM( )
{
/*
 * variable names:
 *
 * Q = states
 * E = transitions
 * F = final weight
 * I = initial weight
 * N = name (optional)
 *
 * p = source state
 * q = target state
 * r = next target state
 *
 * a = input symbol
 * b = output symbol
 * w = weight
 *
 * sr = semiring
 *
 */

	var fsm = this;

	var Q = [];
	fsm.Q = Q;

	const E = 0;	// transitions
	const F = 1;	// final weight
	const I = 2;	// initial weight
	const N = 3;	// name

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

	fsm.isFSA = true;

	// general helpers  --------------------------------------------------------------------

	// extends obj1 with obj2
	// returns void
	function extendObject( obj1, obj2 )
	{
		for (attrname in obj2) { 
			obj1[attrname] = obj2[attrname]; 
		}
	}

	// fsm helpers  --------------------------------------------------------------------

	// calculates index for a new q
	// as "cross-product" out of q1 and q2
	// returns q
	fsm.pairQ = function( q1, q2, q2Length )
	{
		var q = q1 * q2Length + parseInt( q2 );
		fsm.setN( q, q1 + "," + q2 );
		return q;
	}

	// gets name of q
	// returns n
	fsm.getN = function( q )
	{
		fsm.ensureQ( q );
		if ( Q[q][N] == undefined ) return q;
		return Q[q][N];
	}

	// sets name of w with n
	// returns void
	fsm.setN = function( q, n )
	{
		fsm.ensureQ( q );
		Q[q][N] = n;
	}

	// checks if q exists
	// if not: creates q
	// returns void
	fsm.ensureQ = function ( q )
	{
		if (! Q[q] ) {
			fsm.setQ( q );
		}
	}

	// sets q
	// returns void
	fsm.setQ = function ( q )
	{
		Q[q] = [];
		Q[q][E] = {};
		Q[q][F] = sr.a0;
		Q[q][I] = sr.a0;
	}

	// unsets q
	// returns void
	fsm.unsetQ = function ( q )
	{
		Q[q] = undefined;
	}

	// checks if q is defined
	// returns bool
	fsm.isQ = function ( q )
	{
		return ( Q[q] != undefined );
	}

	// deletes all undefined states in Q array
	// returns void
	fsm.shrink = function()
	{
		var count = 0;
		var newIndices = {};
		for ( var q in Q ) {
			if ( Q[q] != undefined ) {
				newIndices[q] = count;
				count++
			}
		}
		q = 0;
		while ( q < Q.length ) {
			if ( Q[q] == undefined ) {
				Q.splice(q, 1);
			} else {
				fsm.adjustE( q, newIndices );
				q++;
			}
		}
	}

	// sets transition between p and q with a:b and weight w
	// returns void
	fsm.setE = function( p, q, a, b, w ) 
	{
		if ( w == sr.a0 ) {
			fsm.unsetE( p, q, a, b, w );
			return;
		}

		if ( w == undefined ) w = sr.a1;	// weight trivially
		if ( b == undefined ) b = a;

		if ( a != b ) fsm.isFSA = false;

		fsm.ensureQ( p );
		fsm.ensureQ( q );

		if (! Q[p][E][q] ) Q[p][E][q] = {}; 
		if (! Q[p][E][q][a] ) Q[p][E][q][a] = {}; 
		
		Q[p][E][q][a][b] = sr.aSum( 
			fsm.getE( p, q, a, b ),
			w
		);
	}

	// checks if p has outgoing transition with a:b
	// returns bool
	fsm.hasE = function( p, a, b ) 
	{
		//if ( b == undefined ) b = a;
		for ( q in Q[p][E] ) {
			for ( ai in Q[p][E][q] ) {
				if ( ( a != undefined ) && ( a != ai ) ) continue;
				for ( bi in Q[p][E][q][ai] ) {
					if ( ( b != undefined ) && ( b != bi ) ) continue;
					return true;
				}
			}
		}
		return false;
	}
	
	// checks if transition exists
	// returns bool
	fsm.isE = function( p, q, a, b ) 
	{
		if ( b == undefined ) b = a;
		return (
			( Q[p][E][q] != undefined ) &&
			( Q[p][E][q][a] != undefined ) &&
			( Q[p][E][q][a][b] != undefined )
		);
	}
	
	// deletes transition
	// returns void
	fsm.unsetE = function( p, q, a, b ) 
	{
		if ( b == undefined ) b = a;
		if (! fsm.isE( p, q, a, b ) ) return;
		delete Q[p][E][q][a][b];
	}

	// gets weight of transition
	// returns w
	fsm.getE = function( p, q, a, b ) 
	{
		if ( b == undefined ) b = a;
		if (! fsm.isE( p, q, a, b ) ) return sr.a0;
		return Q[p][E][q][a][b];
	}

	// sets initial weight to w
	// returns void
	fsm.setI = function( q, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		fsm.ensureQ( q );
		Q[q][I] = w;
	}

	// sets initial weight to a0
	// returns void
	fsm.unsetI = function( q ) 
	{
		fsm.ensureQ( q );
		Q[q][I] = sr.a0;
	}

	// gets initial weight
	// returns w
	fsm.getI = function( q ) 
	{
		fsm.ensureQ( q );
		return Q[q][I];
	}

	// checks if q is an initial state
	// returns bool
	fsm.isI = function( q ) 
	{
		return ( Q[q][I] != sr.a0 );
	}

	// sets final weight to w
	// returns void
	fsm.setF = function( q, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		fsm.ensureQ( q );
		Q[q][F] = w;
	}

	// sets final weight to a0
	// returns void
	fsm.unsetF = function( q ) 
	{
		fsm.ensureQ( q );
		Q[q][F] = sr.a0;
	}

	// gets final weight
	// returns w
	fsm.getF = function( q ) 
	{
		fsm.ensureQ( q );
		return Q[q][F];
	}

	// checks if q is a final state
	// returns bool
	fsm.isF = function( q ) 
	{
		return ( Q[q][F] != sr.a0 );
	}

	// map all state indicies in Q[p][E] to new ones
	// returns void
	fsm.adjustE = function( p, newIndices )
	{
			var E2 = {};
			for ( var q in Q[p][E] ) {
				E2[newIndices[q]] = Q[p][E][q];
			}
			Q[p][E] = E2;
	}

	// increase all state indicies in Q[p][E] by offset
	// returns void
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
	// returns void
	fsm.swapI = function()
	{
		var q0 = Q.length;
		fsm.setQ( q0 );
		for ( var q in Q ) {
			if (! fsm.isI( q ) ) continue;
			fsm.setE( q0, q, EPS, EPS, fsm.getI( q ) );
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
			fsm.setE( q0, q, EPS, EPS, fsm.getI( q ) );
			fsm.unsetI( q );
		}
		fsm.isFSA = fsm.isFSA && fsm2.isFSA;
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
		fsm.isFSA = fsm.isFSA && fsm2.isFSA;
	}

	fsm.intersect = function( fsm1, fsm2 )
	{
		if (! fsm1.isFSA ) throw "fsm1 must be a FSA.";
		if (! fsm2.isFSA ) throw "fsm2 must be a FSA.";

		fsm.composeDo( fsm1, fsm2 );
	}

	fsm.renameE = function( abOld, abNew )
	{
		for ( var p in fsm.Q ) {
			for ( var q in fsm.Q[p][E] ) {
				for ( var a in fsm.Q[p][E][q] ) {
					for ( var b in fsm.Q[p][E][q][a] ) {
						if ( b != abOld ) continue;
						fsm.Q[p][E][q][a][abNew] = fsm.Q[p][E][q][a][abOld]; 
						delete fsm.Q[p][E][q][a][abOld]; 
					}
					if ( a != abOld ) continue;
					fsm.Q[p][E][q][abNew] = fsm.Q[p][E][q][abOld]; 
					delete fsm.Q[p][E][q][abOld]; 
				}
			}
		}
	}

	fsm.compose = function( fsm1, fsm2 )
	{
		fsm1.renameE( EPS, EPS1 );
		for ( q in fsm1.Q ) {
			fsm1.setE( q, q, EPS2, EPS2 );
		}
		fsm1.print();	

		fsm2.renameE( EPS, EPS2 );
		for ( q in fsm2.Q ) {
			fsm2.setE( q, q, EPS1, EPS1 );
		}
		fsm2.print();	

		fsmEpsFilter = new FSM();
		for ( var ab in symbols ) {
			if ( ab < 0 ) continue;
			fsmEpsFilter.setE( 0, 0, ab );
			fsmEpsFilter.setE( 1, 0, ab );
			fsmEpsFilter.setE( 2, 0, ab );
		}

		fsmEpsFilter.setE( 0, 1, EPS1, EPS1 );
		fsmEpsFilter.setE( 0, 2, EPS2, EPS2 );
		fsmEpsFilter.setE( 0, 0, EPS1, EPS2 );
		fsmEpsFilter.setE( 1, 1, EPS1, EPS1 );
		fsmEpsFilter.setE( 2, 2, EPS2, EPS2 );

		fsmEpsFilter.setI( 0 );
		fsmEpsFilter.setF( 0 );
		fsmEpsFilter.setF( 1 );
		fsmEpsFilter.setF( 2 );

		//fsmEpsFilter.print();

		fsm1Filtered = new FSM();
		fsm1Filtered.composeDo( fsm1, fsmEpsFilter );

		fsm1Filtered.connect();
		fsm1Filtered.shrink();
		//fsm1Filtered.print();

		fsm.composeDo( fsm1Filtered, fsm2 );
		fsm.print();
		fsm.connect();
		fsm.shrink();
		fsm.print();
		fsm.renameE( EPS1, EPS );
		fsm.renameE( EPS2, EPS );
	}

	fsm.composeDo = function( fsm1, fsm2 )
	{
		for ( var p1 in fsm1.Q ) {
			for ( var p2 in fsm2.Q ) {
				var p = fsm.pairQ( p1, p2, fsm2.Q.length );
				fsm.setI( p, sr.aProduct( fsm1.getI( p1 ), fsm2.getI( p2 ) ) );
				fsm.setF( p, sr.aProduct( fsm1.getF( p1 ), fsm2.getF( p2 ) ) ); 
				// epsilon transitions
				for ( var q1 in fsm1.Q[p1][E] ) {
					for ( var a1 in fsm1.Q[p1][E][q1] ) {
						for ( var b1 in fsm1.Q[p1][E][q1][a1] ) {
							if ( b1 != EPS ) continue;
							var q = fsm.pairQ( q1, p2, fsm2.Q.length );
							fsm.setE( 
								p, q, a1, b1,
								fsm1.getE( p1, q1, a1, b1 )
							);
						}
					}
				}
				for ( var q2 in fsm2.Q[p2][E] ) {
					var a2 = EPS;
					for ( var b2 in fsm2.Q[p2][E][q2][a2] ) {
						var q = fsm.pairQ( p1, q2, fsm2.Q.length );
						fsm.setE( 
							p, q, a2, b2,
							fsm2.getE( p2, q2, a2, b2 )
						);
					}
				}
				for ( var q1 in fsm1.Q[p1][E] ) {
					for ( var q2 in fsm2.Q[p2][E] ) {
						for ( var a1 in fsm1.Q[p1][E][q1] ) {
							for ( var b1a2 in fsm1.Q[p1][E][q1][a1] ) {
								for ( var b2 in fsm2.Q[p2][E][q2][b1a2] ) {
									//alert(p1 + " " + q1 + " " + p2 + " " + q2 + " " + a1 );
									var q = fsm.pairQ( q1, q2, fsm2.Q.length );
									fsm.setE( 
										p, q, a1, b2,
										sr.aProduct(
											fsm1.getE( p1, q1, a1, b1a2 ),
											fsm2.getE( p2, q2, b1a2, b2 )
										)
									);
								}
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
			if (! fsm.isF( p ) ) continue;
			for ( var q in Q ) {
				if (! fsm.isI( q ) ) continue;
				fsm.setE( 
					p, q, EPS, EPS, 
					sr.aProduct(
						fsm.getF( p ),
						fsm.getI( q )
					)
				);
			}
		}
	}

	fsm.starClosure = function()
	{
		fsm.plusClosure();
		var q0 = fsm.swapI();
		fsm.setF( q0 );
	}

	// calculates all-pairs-distance
	// if symbols defined: only these symbols are considered
	// returns distance matrix
	fsm.distance = function( symbols )
	{
		var d = [];
		for ( var i in Q ) {
			d[i] = [];
			for ( var j in Q ) {
				d[i][j] = sr.a0; 
				for ( var a in Q[i][E][j] ) {
					if ( ( symbols != undefined ) && ( symbols.indexOf( parseInt( a ) ) == -1  ) ) continue;
					for ( var b in Q[i][E][j][a] ) {
						if ( ( symbols != undefined ) && ( symbols.indexOf( parseInt( b ) ) == -1  ) ) continue;
						d[i][j] = sr.aSum(
							d[i][j],
							fsm.getE( i, j, a, b )
						);
					}
				}
			}
		}
		//alert(dump(d));
		for ( var k in Q ) {
			for ( var i in Q ) {
				if ( i == k ) continue;
				for ( var j in Q ) {
					if ( j == k ) continue;
					//alert( "1) " + i + " -> " + k + " -> " + j + " : " + d[i][j] + " + " + d[i][k] + " x " + d[k][k] + "* x " + d[k][j] );
					d[i][j] = sr.aSum( 
						d[i][j],
						sr.aProduct(
							d[i][k],
							sr.aProduct(
								sr.aProductClosure( d[k][k] ),
								d[k][j]
							)
						)
					);
					//alert( d[i][j] );
					//alert("1) " + i + " -> " + k + " -> " + j + " : " + d[i][j] );
					//alert(k + ", " + d[k][k] + ", " + sr.aProductClosure( d[k][k] ) );
					//alert( nextd[i][j] );
				}
			}
			for ( var i in Q ) {
				if ( i == k ) continue;
				//alert( "2) " + k + " -> " + i + " : " + d[k][k] + "* x " + d[k][i] );
				d[k][i] = sr.aProduct(
					sr.aProductClosure( d[k][k] ),
					//d[k][k], 
					d[k][i]
				);
				//alert( d[k][i] );
				//alert( "3) " + i + " -> " + k + " : " + d[i][k] + " x " + d[k][k] + "*" );
				d[i][k] = sr.aProduct(
					d[i][k],
					sr.aProductClosure( d[k][k] )
					//d[k][k] 
				);
				//alert( d[i][k] );
			}
			d[k][k] = sr.aProductClosure( d[k][k] )
		}
		//alert(dump(d));
		return d;
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
		var epsClosure = fsm.distance( [EPS] );
		for ( p in Q ) {
			for ( var q in epsClosure[p] ) {
				if ( epsClosure[p][q] == sr.a0 ) continue;
				for ( var r in Q[q][E] ) {
					for ( var a in Q[q][E][r] ) {
						if ( a == EPS ) continue;
						for ( var b in Q[q][E][r][a] ) {
							if ( b == EPS ) continue;
							// remember old weight and delete it
							// so it won't get added to new one
							var w = fsm.getE( q, r, a, b );
							fsm.unsetE( p, r, a, b );
							fsm.setE( 
								p, r, a, b, 
								sr.aProduct( 
									epsClosure[p][q], 
									w
								)
							);
							fsm.setF(
								p,
								sr.aSum(
									( p != q ?  fsm.getF( p ) : sr.a0 ), // Mohri always uses here fsm.getF(p) here
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

	fsm.connect = function()
	{
		accessibleQ = {};
		for ( var q in Q ) {
			if (! fsm.isI( q ) ) continue;
			accessibleQ[q] = true;
		}

		var added = false;
		do {
			added = false;
			// it is actually unnecessary to iterate always over all accessibleQ 
			// only over the added ones would be enough
			for ( var p in accessibleQ ) {
				for ( var q in Q[p][E] ) {
					if ( accessibleQ[q] ) continue;
					accessibleQ[q] = true;
					added = true;
				}
			}
		} while( added );

		for ( var q in Q ) {
			if ( accessibleQ[q] ) continue;
			fsm.unsetQ( q );
		}
	}	

	fsm.print = function()
	{
		var code = "digraph {\n" ;	
		for ( var p in Q ) {
			if (! fsm.isQ( p ) ) continue;
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
			if (! fsm.isQ( q ) ) continue;
			code +=
				q + 
				" [ " +
				"label=\"" +
					fsm.getN( q ) +
					// print weights only if not a0 or a1
					( ( fsm.isI( q ) && fsm.getI( q ) != sr.a1 ) ? "\\nI=" + fsm.getI( q ) : "" ) + 
					( ( fsm.isF( q ) && fsm.getF( q ) != sr.a1 ) ? "\\nF=" + fsm.getF( q ) : "" ) + 
					"\" " + 
				"shape=\"" +
					( fsm.isF( q ) ? "doublecircle" : "circle" ) +
					"\" " +
				( fsm.isI( q ) ? "style=\"bold\"" : "" ) +
				"]\n";
		}
		code += "rankdir=LR\n" ;	
		code += "}" ;	

		document.write( '<textarea cols="40" rows="5">' + code + "</textarea>" );	
		document.write( "<img src='fsm.gif.php?code=" + code + "'>" );	
		document.write( '<hr>' );	
	}

}

runTests();

//exampleUnion();
//exampleConcat();
//exampleIntersect();
//exampleIntersectEpsilon();
exampleCompose();

//exampleRemoveEpsilon();
//exampleSimple();

//exampleClosure();
//exampleClosureTropical();

//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );

function runTests()
{
	var tests = {

	removeEpsilon: function () { // RemoveEpsilon

	fsm = new FSM();

	fsm.setE( 0, 1, 0, 0, 0.25 );
	fsm.setE( 0, 1, EPS, EPS, 0.5 );
	fsm.setE( 1, 1, EPS, EPS, 0.2 );
	fsm.setE( 1, 0, 1, 1, 0.5 );

	fsm.setI( 1, 1 );
	fsm.setF( 1, 0.3 );
	fsm.setF( 0, 0.25 );

	fsm.removeEpsilon();

	return ( serialize( fsm ) == 'a:2:{s:1:"Q";a:2:{i:0;a:3:{i:0;a:2:{i:1;a:2:{i:0;a:1:{i:0;d:0.25;}s:2:"-1";a:0:{}}i:0;a:1:{i:1;a:1:{i:1;d:0.3125;}}}i:1;d:0.4375;i:2;i:0;}i:1;a:3:{i:0;a:2:{i:1;a:1:{s:2:"-1";a:0:{}}i:0;a:1:{i:1;a:1:{i:1;d:0.625;}}}i:1;d:0.375;i:2;i:1;}}s:5:"isFSA";b:1;}' );
	},

	union: function () { 

	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0, 0.4 );
	fsm1.setF( 1 );
	fsm1.setF( 2 );

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.6 );
	fsm2.setF( 1 );

	fsm1.union( fsm2 );

	return ( serialize(fsm1) == 'a:2:{s:1:"Q";a:4:{i:0;a:3:{i:0;a:2:{i:1;a:1:{i:0;a:1:{i:0;i:1;}}i:2;a:1:{i:1;a:1:{i:1;i:1;}}}i:1;i:0;i:2;i:0;}i:1;a:3:{i:0;a:0:{}i:1;i:1;i:2;i:0;}i:2;a:3:{i:0;a:0:{}i:1;i:1;i:2;i:0;}i:3;a:3:{i:0;a:2:{i:0;a:1:{s:2:"-1";a:1:{s:2:"-1";d:0.4;}}i:4;a:1:{s:2:"-1";a:1:{s:2:"-1";d:0.6;}}}i:1;i:0;i:2;i:1;}}s:5:"isFSA";b:1;}' );
	},

	concat: function () { 

	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1 );

	fsm1.concat( fsm2 );

	return ( serialize(fsm1) == 'a:2:{s:1:"Q";a:3:{i:0;a:3:{i:0;a:2:{i:1;a:1:{i:0;a:1:{i:0;i:1;}}i:2;a:1:{i:1;a:1:{i:1;i:1;}}}i:1;i:0;i:2;i:1;}i:1;a:3:{i:0;a:1:{i:3;a:1:{s:2:"-1";a:1:{s:2:"-1";d:0.5;}}}i:1;i:0;i:2;i:0;}i:2;a:3:{i:0;a:1:{i:3;a:1:{s:2:"-1";a:1:{s:2:"-1";d:0.4;}}}i:1;i:0;i:2;i:0;}}s:5:"isFSA";b:1;}' );

	},

	intersect: function () { 

	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1, 1, 0.5 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 1, 1, 0.6 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1, 0.5 );

	fsm3 = new FSM();
	fsm3.intersect( fsm1, fsm2 );
	//return ( serialize( fsm3 ) == 'a:2:{s:1:"Q";a:6:{i:0;a:4:{i:0;a:1:{i:5;a:1:{i:1;a:1:{i:1;d:0.3;}}}i:1;i:0;i:2;d:0.5;i:3;s:3:"0,0";}i:1;a:4:{i:0;a:0:{}i:1;i:0;i:2;i:0;i:3;s:3:"0,1";}i:2;a:4:{i:0;a:0:{}i:1;i:0;i:2;i:0;i:3;s:3:"1,0";}i:3;a:4:{i:0;a:0:{}i:1;d:0.5;i:2;i:0;i:3;s:3:"1,1";}i:4;a:4:{i:0;a:0:{}i:1;i:0;i:2;i:0;i:3;s:3:"2,0";}i:5;a:4:{i:0;a:0:{}i:1;d:0.4;i:2;i:0;i:3;s:3:"2,1";}}s:5:"isFSA";b:1;}' );

	fsm3.connect();
	fsm3.shrink();

	return ( serialize( fsm3 ) == 'a:2:{s:1:"Q";a:2:{i:0;a:4:{i:0;a:1:{i:1;a:1:{i:1;a:1:{i:1;d:0.3;}}}i:1;i:0;i:2;d:0.5;i:3;s:3:"0,0";}i:1;a:4:{i:0;a:0:{}i:1;d:0.4;i:2;i:0;i:3;s:3:"2,1";}}s:5:"isFSA";b:1;}' );


	},

	closureTropical:  function () { 

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

	fsm.starClosure();

	return ( serialize( fsm ) == 'a:2:{s:1:"Q";a:5:{i:0;a:3:{i:0;a:1:{i:3;a:1:{s:2:"-1";a:1:{s:2:"-1";i:2;}}}i:1;i:2;i:2;s:4:"+inf";}i:1;a:3:{i:0;a:1:{i:2;a:1:{i:1;a:1:{i:1;i:0;}}}i:1;s:4:"+inf";i:2;s:4:"+inf";}i:2;a:3:{i:0;a:2:{i:1;a:1:{i:2;a:1:{i:2;i:1;}}i:3;a:1:{s:2:"-1";a:1:{s:2:"-1";i:1;}}}i:1;i:1;i:2;s:4:"+inf";}i:3;a:3:{i:0;a:2:{i:0;a:1:{i:0;a:1:{i:0;i:0;}}i:1;a:1:{i:2;a:1:{i:2;i:0;}}}i:1;s:4:"+inf";i:2;s:4:"+inf";}i:4;a:3:{i:0;a:1:{i:3;a:1:{s:2:"-1";a:1:{s:2:"-1";i:0;}}}i:1;i:0;i:2;i:0;}}s:5:"isFSA";b:1;}' );

	},

	_last: function(){ return true; } }

	for ( var i in tests ) {
		if (! tests[i]() ) {
			alert( "Test " + i + " failed." );
		}
	}
}

function exampleRemoveEpsilon()
{
	fsm = new FSM();

	fsm.setE( 0, 1, 0, 0, 0.25 );
	fsm.setE( 0, 1, EPS, EPS, 0.5 );
	fsm.setE( 1, 1, EPS, EPS, 0.2 );
	fsm.setE( 1, 0, 1, 1, 0.5 );

	fsm.setI( 1 );
	fsm.setF( 1, 0.3 );
	fsm.setF( 0, 0.25 );

	fsm.print();
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
	fsm3.shrink();
	fsm3.print();
}

function exampleIntersectEpsilon()
{
	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 1, 2, EPS, EPS, 0.8 );
	fsm1.setI( 0 );
	fsm1.setF( 2 );

	fsm1.print();

	fsm2 = new FSM();
	fsm2.setE( 0, 1, EPS, EPS, 0.8 );
	fsm2.setE( 1, 2, 0 );
	fsm2.setI( 0 );
	fsm2.setF( 2 );

	fsm2.print();

	fsm3 = new FSM();
	fsm3.intersect( fsm1, fsm2 );
	fsm3.print();
	fsm3.connect();
	fsm3.shrink();
	fsm3.print();
}

function exampleCompose()
{
	fsm1 = new FSM();
	fsm1.setE( 0, 1, 0, 0 );
	fsm1.setE( 1, 2, 1, EPS );
	fsm1.setE( 2, 3, 2, EPS );
	fsm1.setE( 3, 4, 3, 3 );
	fsm1.setI( 0 );
	fsm1.setF( 4 );

	fsm1.print();

	fsm2 = new FSM();
	fsm2.setE( 0, 1, 0, 3 );
	fsm2.setE( 1, 2, EPS, 4 );
	fsm2.setE( 2, 3, 3, 0 );
	fsm2.setI( 0 );
	fsm2.setF( 3 );

	fsm2.print();

	fsm3 = new FSM();
	fsm3.compose( fsm1, fsm2 );
	fsm3.print();
}

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


function serialize( mixed_value ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Arpad Ray (mailto:arpad@php.net)
    // +   improved by: Dino
    // +   bugfixed by: Andrej Pavlovic
    // +   bugfixed by: Garagoth
    // %          note: We feel the main purpose of this function should be to
    // ease the transport of data between php & js
    // %          note: Aiming for PHP-compatibility, we have to translate
    // objects to arrays
    // *     example 1: serialize(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1:
    // 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
    // *     example 2: serialize({firstName: 'Kevin', midName: 'van',
    // surName: 'Zonneveld'});
    // *     returns 2:
    // 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'
 
    var _getType = function( inp ) {
        var type = typeof inp, match;
        var key;
        if (type == 'object' && !inp) {
            return 'null';
        }
        if (type == "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            if (match = cons.match(/(\w+)\(/)) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = _getType(mixed_value);
    var val, ktype = '';
    
    switch (type) {
        case "function": 
            val = ""; 
            break;
        case "undefined":
            val = "N";
            break;
        case "boolean":
            val = "b:" + (mixed_value ? "1" : "0");
            break;
        case "number":
            val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" +
mixed_value;
            break;
        case "string":
            val = "s:" + mixed_value.length + ":\"" + mixed_value + "\"";
            break;
        case "array":
        case "object":
            val = "a";
            /*
            if (type == "object") {
                var objname =
mixed_value.constructor.toString().match(/(\w+)\(\)/);
                if (objname == undefined) {
                    return;
                }
                objname[1] = serialize(objname[1]);
                val = "O" + objname[1].substring(1, objname[1].length - 1);
            }
            */
            var count = 0;
            var vals = "";
            var okey;
            var key;
            for (key in mixed_value) {
                ktype = _getType(mixed_value[key]);
                if (ktype == "function") { 
                    continue; 
                }
                
                okey = (key.match(/^[0-9]+$/) ? parseInt(key) : key);
                vals += serialize(okey) +
                        serialize(mixed_value[key]);
                count++;
            }
            val += ":" + count + ":{" + vals + "}";
            break;
    }
    if (type != "object" && type != "array") val += ";";
    return val;
}
