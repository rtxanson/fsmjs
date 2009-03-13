var symbols = ['a','b','c'];
symbols[-1] = '<eps>';
const EPS = -1;


var tropicalSR = {
	// a = abstract
	aSum: function( w1, w2 ) 
		{
			return Math.min(w1, w2);
		},
	aProduct: function( w1, w2 ) 
		{
			return w1 + w2;
		},
	a0: 100,
	a1: 0,
	aProductClosure: function ( w ) 
	{
		return this.a0;
	}
}

var realSR = {
	// a = abstract
	aSum: function( w1, w2 ) 
		{
			return w1 + w2;
		},
	aProduct: function( w1, w2 ) 
		{
			return w1 * w2;
		},
	a0: 0,
	a1: 1,
	aProductClosure: function ( w ) 
	{
		if ( w >= 1 ) {
			return undefined;
		}
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

	var Q = [];

	const E = 0;	// transitions
	const F = 1;	// final w
	const I = 2;	// initial w

	var sr = realSR;
	var fsm = this;
	
	this.setSR = function( semiring )
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

	function ensureState( state )
	{
		if (! Q[state] ) {
			createState( state );
		}
	}

	function createState( state )
	{
		Q[state] = [];
		Q[state][E] = {};
		Q[state][F] = sr.a0;
		Q[state][I] = sr.a0;
	}

	this.setE = function( p, q, a, b, w ) 
	{
		if (! b ) b = a;
		if (! w ) w = sr.a1;

		ensureState( p );
		ensureState( q );
		if (! Q[p][E][q] ) Q[p][E][q] = {}; 
		if (! Q[p][E][q][a] ) Q[p][E][q][a] = {}; 
		
		Q[p][E][q][a][b] = w;
	}

	this.isE = function( p, q, a, b ) 
	{
		return (
			( Q[p][E][q] != undefined ) &&
			( Q[p][E][q][a] != undefined ) &&
			( Q[p][E][q][a][b] != undefined )
		);
	}
	
	this.unsetE = function( p, q, a, b ) 
	{
		if (! this.isE( p, q, a, b ) ) return;
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

	this.getE = function( p, q, a, b ) 
	{
		/*
		if ( q == undefined ) return Q[p][E]; 
		if ( a == undefined ) return Q[p][E][q]; 
		if ( b == undefined ) return Q[p][E][q][a];
		*/
		if (! this.isE( p, q, a, b ) ) return sr.a0;
		return Q[p][E][q][a][b];
	}

	this.setI = function( state, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		ensureState( state );
		Q[state][I] = w;
	}

	this.unsetI = function( state ) 
	{
		ensureState( state );
		Q[state][I] = sr.a0;
	}

	this.getI = function( state ) 
	{
		ensureState( state );
		return Q[state][I];
	}

	this.setF = function( state, w ) 
	{
		if ( w == undefined ) w = sr.a1;
		ensureState( state );
		Q[state][F] = w;
	}

	this.getF = function( state ) 
	{
		ensureState( state );
		return Q[state][F];
	}

	this.isI = function( state ) {
		return ( Q[state][I] != sr.a0 );
	}

	this.isF = function( state ) {
		return ( Q[state][F] != sr.a0 );
	}

	// operations  --------------------------------------------------------------------

	this.plusClosure = function()
	{
		for ( var finalState in Q ) {
			if ( this.isF( finalState ) ) {
				for ( var initialState in Q ) {
					if ( this.isI( initialState ) ) {
						this.setE( finalState, initialState, EPS, EPS, this.getF(finalState) );
					}
				}
			}
		}
	}

	this.starClosure = function()
	{
		this.plusClosure();
		var newState = Q.length;
		createState( newState );
		for ( var initialState in Q ) {
			if ( this.isI( initialState ) ) {
				this.setE( newState, initialState, EPS );
				this.unsetI( initialState );
			}
		}
		this.setI( newState );
		this.setF( newState );
	}


	this.epsClosure = function( state, wToState, epsClosure )
	{
		if ( wToState == undefined ) var wToState = sr.a1;
		if ( epsClosure == undefined ) var epsClosure = {};
		//epsClosure[state] = sr.a0;
		epsClosure[state] = wToState;

		for ( var q in Q[state][E] ) {
			for ( var a in Q[state][E][q] ) {
				if ( a != EPS ) continue;
				for ( var b in Q[state][E][q][a] ) {
					if ( b != EPS ) continue;
					// check if q already in closure
					if (! epsClosure[q] ) {
						epsClosure[q] = sr.aProduct(
							wToState,
							Q[state][E][q][a][b]
						);
						extendObject( 
							epsClosure, 
							this.epsClosure( q, epsClosure[q], epsClosure ) 
						);
					} else {
						epsClosure[q] = sr.aProduct(
							epsClosure[q],
							sr.aProductClosure(
								sr.aProduct(
									wToState/epsClosure[q],
									Q[state][E][q][a][b]
								)
							)
						);
					}
				}
			}
		}
		return epsClosure;
	}

	this.removeEpsilon = function()
	{
		var epsClosure = [];
		for ( p in Q ) {
			epsClosure[p] = this.epsClosure( p ); 
		}

		for ( p in Q ) {
			for ( var q in epsClosure[p] ) {
				for ( var r in Q[q][E] ) {
					for ( var a in Q[q][E][r] ) {
						if ( a == EPS ) continue;
						for ( var b in Q[q][E][r][a] ) {
							if ( b == EPS ) continue;
							this.setE( 
								p, r, a, b, 
								sr.aProduct( 
									epsClosure[p][q], 
									this.getE( q, r, a, b ) 
								)
							);
							this.setF(
								p,
								sr.aSum(
									( p != q ?  this.getF( p ) : sr.a0 ),
									sr.aProduct(
										epsClosure[p][q],
										this.getF( q )
									)
								)
							);
/*
							alert( 
								"p: " + p + 
								", tarthis.get: " + q + 
								", next: " + r + 
								", E: " + this.getE( p, r, a, b ) +
								", F(" + p + "): " + this.getF( p )
							);
*/
						}
					}
				}
				this.unsetE( p, q, EPS, EPS );
			}
		}
	}

	this.print = function()
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
							symbols[a];

						if ( a != b ) {
							code += 
								":" + 
								symbols[b];
						}
						code += 
							"/" + 
							Q[p][E][q][a][b] + 
							"\" ] \n" ;
					}
				}
			}
		}
		for ( var state in Q ) {
			if ( this.isF( state ) ) {
				code += state + " [ shape=\"doublecircle\" ]\n";	
			} else {
				code += state + " [ shape=\"circle\" ]\n";	
			}
			if ( this.isI( state ) ) {
				code += state + " [ style=\"bold\" ]\n";
			} 
			code += state + 
				" [ label=\"" + state + 
				( fsm.isI( state ) ? "\\nI=" + fsm.getI( state ) : "" ) + 
				( fsm.isF( state ) ? "\\nF=" + fsm.getF( state ) : "" ) + 
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
}

/*
	this.setE( 0, 1, EPS , EPS, 0.4 );
	this.setE( 1, 0, EPS , EPS, 0.5 );
*/
	/*
	//this.setE( 4, 3, EPS , EPS, 2);
	//this.setE( 3, 5, EPS , EPS, 3);
	//this.setE( 0, 0, EPS , EPS, 1/5);

*/
	

//exampleEpsRemoval();
exampleSimple();

//exampleClosure();
//exampleClosureTropical();

//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );

function dump( obj )
{
	var out = '';
	for ( var attr in obj ) {
		out += attr + ': ' + obj[attr] + "\n";
	}
	return out;
}
