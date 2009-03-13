var symbols = ['a','b','c'];
symbols[-1] = '<eps>';
const EPS = -1;


var realSemiring = {
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
	var states = [];

	const E = 0;	// transitions
	const F = 1;	// final w
	const I = 2;	// initial w


	var s = realSemiring;

/*
 * variable names:
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
		if (! states[state] ) {
			createState( state );
		}
	}

	function createState( state )
	{
		states[state] = [];
		states[state][E] = {};
		states[state][F] = s.a0;
		states[state][I] = s.a0;
	}

	this.setE = function( p, q, a, b, w ) 
	{
		if (! b ) b = a;
		if (! w ) w = s.a1;

		ensureState( p );
		ensureState( q );
		if (! states[p][E][q] ) states[p][E][q] = {}; 
		if (! states[p][E][q][a] ) states[p][E][q][a] = {}; 
		
		states[p][E][q][a][b] = w;
	}

	this.isE = function( p, q, a, b ) 
	{
		return (
			( states[p][E][q] != undefined ) &&
			( states[p][E][q][a] != undefined ) &&
			( states[p][E][q][a][b] != undefined )
		);
	}
	
	this.unsetE = function( p, q, a, b ) 
	{
		if (! this.isE( p, q, a, b ) ) return;
		delete states[p][E][q][a][b];
		/*
		if ( a == undefined ) {
			delete states[p][E][q];
			return;
		}
		if ( b == undefined ) {
			delete states[p][E][q][a];
			return;
		}
		delete states[p][E][q][a][b];
		*/
	}

	this.getE = function( p, q, a, b ) 
	{
		/*
		if ( q == undefined ) return states[p][E]; 
		if ( a == undefined ) return states[p][E][q]; 
		if ( b == undefined ) return states[p][E][q][a];
		*/
		if (! this.isE( p, q, a, b ) ) return s.a0;
		return states[p][E][q][a][b];
	}

	this.setI = function( state, w ) 
	{
		if ( w == undefined ) w = s.a1;
		ensureState( state );
		states[state][I] = w;
	}

	this.unsetI = function( state ) 
	{
		ensureState( state );
		states[state][I] = s.a0;
	}

	this.setF = function( state, w ) 
	{
		if ( w == undefined ) w = s.a1;
		ensureState( state );
		states[state][F] = w;
	}

	this.getF = function( state ) 
	{
		ensureState( state );
		return states[state][F];
	}

	this.isInitial = function( state ) {
		return ( states[state][I] != s.a0 );
	}

	this.isFinal = function( state ) {
		return ( states[state][F] != s.a0 );
	}

	/*
	// semiring  --------------------------------------------------------------------

	s.aSum = function( w1, w2 )
	{
		return w1 + w2;
	}

	s.aProduct = function( w1, w2 )
	{
		return w1 * w2;
	}

	s.aProductClosure = function( w )
	{
		if ( w >= 1 ) {
			return undefined;
		}
		return 1 / ( 1 - w );
	}
*/
	// operations  --------------------------------------------------------------------

	this.plusClosure = function()
	{
		for ( var finalState in states ) {
			if ( this.isFinal( finalState ) ) {
				for ( var initialState in states ) {
					if ( this.isInitial( initialState ) ) {
						this.setE( finalState, initialState, EPS, EPS, this.getF(finalState) );
					}
				}
			}
		}
	}

	this.starClosure = function()
	{
		this.plusClosure();
		var newState = states.length;
		createState( newState );
		for ( var initialState in states ) {
			if ( this.isInitial( initialState ) ) {
				this.setE( newState, initialState, EPS );
				this.unsetI( initialState );
			}
		}
		this.setI( newState );
		this.setF( newState );
	}


	this.epsClosure = function( state, wToState, epsClosure )
	{
		if ( wToState == undefined ) var wToState = s.a1;
		if ( epsClosure == undefined ) var epsClosure = {};
		//epsClosure[state] = s.a0;
		epsClosure[state] = wToState;

		for ( var q in states[state][E] ) {
			for ( var a in states[state][E][q] ) {
				if ( a != EPS ) continue;
				for ( var b in states[state][E][q][a] ) {
					if ( b != EPS ) continue;
					// check if q already in closure
					if (! epsClosure[q] ) {
						epsClosure[q] = s.aProduct(
							wToState,
							states[state][E][q][a][b]
						);
						extendObject( 
							epsClosure, 
							this.epsClosure( q, epsClosure[q], epsClosure ) 
						);
					} else {
						epsClosure[q] = s.aProduct(
							epsClosure[q],
							s.aProductClosure(
								s.aProduct(
									wToState/epsClosure[q],
									states[state][E][q][a][b]
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
		for ( p in states ) {
			epsClosure[p] = this.epsClosure( p ); 
		}

		for ( p in states ) {
			for ( var q in epsClosure[p] ) {
				for ( var r in states[q][E] ) {
					for ( var a in states[q][E][r] ) {
						if ( a == EPS ) continue;
						for ( var b in states[q][E][r][a] ) {
							if ( b == EPS ) continue;
							this.setE( 
								p, r, a, b, 
								s.aProduct( 
									epsClosure[p][q], 
									this.getE( q, r, a, b ) 
								)
							);
							this.setF(
								p,
								s.aSum(
									( p != q ?  this.getF( p ) : s.a0 ),
									s.aProduct(
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
		for ( var p in states ) {
			for ( var q in states[p][E] ) {
				for ( var a in states[p][E][q] ) {
					for ( var b in states[p][E][q][a] ) {
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
							states[p][E][q][a][b] + 
							"\" ] \n" ;
					}
				}
			}
		}
		for ( var state in states ) {
			if ( this.isFinal( state ) ) {
				code += state + " [ shape=\"doublecircle\" ]\n";	
			} else {
				code += state + " [ shape=\"circle\" ]\n";	
			}
			if ( this.isInitial( state ) ) {
				code += state + " [ style=\"bold\" ]\n";
			} 
			code += state + " [ label=\"" + state + "\\nI=" + states[state][I] + "\\nF=" + states[state][F] + "\" ]\n";	
		}
		code += "rankdir=LR\n" ;	
		code += "}" ;	

		document.write( '<textarea cols="40" rows="20">' + code + "</textarea>" );	
		document.write( "<img src='fsm.gif.php?code=" + code + "'>" );	
		document.write( '<br>' );	
	}

}

function exampleWeightedEpsClosure( fsm )
{
	fsm.setE( 0, 1, 0, 0, 0.25 );
	fsm.setE( 0, 1, EPS, EPS, 0.5 );
	fsm.setE( 1, 1, EPS, EPS, 0.2 );
	fsm.setE( 1, 0, 1, 1, 0.5 );
	fsm.setI( 1, 1 );
	fsm.setF( 1, 0.3 );
	fsm.setF( 0, 0.25 );
}

function exampleSimple( fsm )
{
	fsm.setE( 0, 1, 0 );
	fsm.setE( 0, 2, 1 );
	fsm.setI( 0 );
	fsm.setF( 1, 0.5 );
	fsm.setF( 2, 0.4 );
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
	

fsm1 = new FSM();
//exampleWeightedEpsClosure( fsm1 );
exampleSimple( fsm1 );
//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );
fsm1.print();
fsm1.starClosure();
fsm1.print();

fsm1.removeEpsilon();
fsm1.print();
//fsm1.starClosure();
//fsm1.print();

function dump( obj )
{
	var out = '';
	for ( var attr in obj ) {
		out += attr + ': ' + obj[attr] + "\n";
	}
	return out;
}
