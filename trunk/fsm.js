var symbols = ['a','b','c'];
symbols[-1] = '<eps>';

function FSM( )
{
	var states = [];

	const E = 0;	// transitions
	const F = 1;	// final weight
	const I = 2;	// initial weight

	const EPS = -1;

	const ABSTRACT0 = 0;
	const ABSTRACT1 = 1;

/*
 * variable names:
 * p = source state
 * q = target state
 * r = next target state
 *
 * a = input symbol
 * b = output symbol
 *
 */

/*
	setE( 0, 1, EPS , EPS, 0.4 );
	setE( 1, 0, EPS , EPS, 0.5 );
*/
	
	//setE( 4, 3, EPS , EPS, 2);
	//setE( 3, 5, EPS , EPS, 3);
	//setE( 0, 0, EPS , EPS, 1/5);
	setE( 0, 1, 0 );
	setE( 0, 2, 1 );

	setI( 0 );
	setF( 1, 0.5 );
	setF( 2, 0.4 );
	
/*
	setE( 0, 1, 0, 0, 0.25 );
	setE( 0, 1, EPS, EPS, 0.5 );
	setE( 1, 1, EPS, EPS, 0.2 );
	setE( 1, 0, 1, 1, 0.5 );
	setI( 1, 1 );
	setF( 1, 0.3 );
	setF( 0, 0.25 );
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
		states[state][F] = ABSTRACT0;
		states[state][I] = ABSTRACT0;
	}

	function setE( p, q, a, b, weight ) 
	{
		if (! b ) b = a;
		if (! weight ) weight = ABSTRACT1;

		ensureState( p );
		ensureState( q );
		if (! states[p][E][q] ) states[p][E][q] = {}; 
		if (! states[p][E][q][a] ) states[p][E][q][a] = {}; 
		
		states[p][E][q][a][b] = weight;
	}

	function isE( p, q, a, b ) 
	{
		return (
			( states[p][E][q] != undefined ) &&
			( states[p][E][q][a] != undefined ) &&
			( states[p][E][q][a][b] != undefined )
		);
	}
	
	function unsetE( p, q, a, b ) 
	{
		if (! isE( p, q, a, b ) ) return;
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

	function getE( p, q, a, b ) 
	{
		/*
		if ( q == undefined ) return states[p][E]; 
		if ( a == undefined ) return states[p][E][q]; 
		if ( b == undefined ) return states[p][E][q][a];
		*/
		if (! isE( p, q, a, b ) ) return ABSTRACT0;
		return states[p][E][q][a][b];
	}

	function setI( state, weight ) 
	{
		if ( weight == undefined ) weight = ABSTRACT1;
		ensureState( state );
		states[state][I] = weight;
	}

	function unsetI( state ) 
	{
		ensureState( state );
		states[state][I] = ABSTRACT0;
	}

	function setF( state, weight ) 
	{
		if ( weight == undefined ) weight = ABSTRACT1;
		ensureState( state );
		states[state][F] = weight;
	}

	function getF( state ) 
	{
		ensureState( state );
		return states[state][F];
	}

	this.isInitial = function( state ) {
		return ( states[state][I] != ABSTRACT0 );
	}

	this.isFinal = function( state ) {
		return ( states[state][F] != ABSTRACT0 );
	}

	// semiring  --------------------------------------------------------------------

	this.abstractSum = function( weight1, weight2 )
	{
		return weight1 + weight2;
	}

	this.abstractProduct = function( weight1, weight2 )
	{
		return weight1 * weight2;
	}

	this.abstractProductClosure = function( weight )
	{
		if ( weight >= 1 ) {
			return undefined;
		}
		return 1 / ( 1 - weight );
	}

	// operations  --------------------------------------------------------------------

	this.plus = function()
	{
		for ( var finalState in states ) {
			if ( this.isFinal( finalState ) ) {
				for ( var initialState in states ) {
					if ( this.isInitial( initialState ) ) {
						setE( finalState, initialState, EPS, EPS, getF( finalState ) );
					}
				}
			}
		}
	}

	this.star = function()
	{
		this.plus();
		var newState = states.length;
		createState( newState );
		for ( var initialState in states ) {
			if ( this.isInitial( initialState ) ) {
				setE( newState, initialState, EPS );
				unsetI( initialState );
			}
		}
		setI( newState );
		setF( newState );
	}


	this.epsClosure = function( state, weightToState, epsClosure )
	{
		if ( weightToState == undefined ) var weightToState = ABSTRACT1;
		if ( epsClosure == undefined ) var epsClosure = {};
		//epsClosure[state] = ABSTRACT0;
		epsClosure[state] = weightToState;

		for ( var q in states[state][E] ) {
			for ( var a in states[state][E][q] ) {
				if ( a == EPS ) {
					for ( var b in states[state][E][q][a] ) {
						if ( b == EPS ) {
							// check if q already in closure
							if (! epsClosure[q] ) {
								epsClosure[q] = this.abstractProduct(
									weightToState,
									states[state][E][q][a][b]
								);
								extendObject( 
									epsClosure, 
									this.epsClosure( q, epsClosure[q], epsClosure ) 
								);
							} else {
								epsClosure[q] = this.abstractProduct(
									epsClosure[q],
									this.abstractProductClosure(
										this.abstractProduct(
											weightToState/epsClosure[q],
											states[state][E][q][a][b]
										)
									)
								);
							}
						}
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
						if ( a != EPS ) {
							for ( var b in states[q][E][r][a] ) {
								if ( b != EPS ) {
									setE( 
										p, r, a, b, 
										this.abstractProduct( 
											epsClosure[p][q], 
											getE( q, r, a, b ) 
										)
									);
									setF(
										p,
										this.abstractSum(
											( p != q ?  getF( p ) : ABSTRACT0 ),
											this.abstractProduct(
												epsClosure[p][q],
												getF( q )
											)
										)
									);
/*
									alert( 
										"p: " + p + 
										", target: " + q + 
										", next: " + r + 
										", E: " + getE( p, r, a, b ) +
										", F(" + p + "): " + getF( p )
									);
*/
								}
							}
						}
					}
				}
				unsetE( p, q, EPS, EPS );
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


fsm1 = new FSM();
//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );
fsm1.print();
fsm1.plus();
fsm1.print();

fsm1.removeEpsilon();
fsm1.print();
//fsm1.star();
//fsm1.print();

function dump( obj )
{
	var out = '';
	for ( var attr in obj ) {
		out += attr + ': ' + obj[attr] + "\n";
	}
	return out;
}
