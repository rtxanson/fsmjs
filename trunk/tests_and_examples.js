
//runTests();
//exampleRemoveEpsilon2();
exampleClosure();
exampleClosureTropical();

exampleUnion();
exampleConcat();
exampleIntersect();
exampleIntersectEpsilon();
exampleCompose();
exampleReverse();

exampleRemoveEpsilon();
exampleDeterminize();

examplePushWeights();
exampleMinimize();

exampleSingleSourceDistance();
//alert( dump( fsm1.epsClosure(0) ) );
//alert( dump( fsm1.epsClosure(1) ) );

function exampleRemoveEpsilon2()
{
	document.write( "<h3> Remove Epsilon 2</h3>");
	fsm = new FSM();

	fsm.setE( 0, 0, EPS, EPS, 0.2 );

	fsm.setI( 0 );
	fsm.setF( 0, 0.3 );

	fsm.print();
	fsm.removeEpsilon();
	fsm.print();
}

function exampleRemoveEpsilon()
{
	document.write( "<h3> Remove Epsilon </h3>");
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

function exampleClosure()
{
	document.write( "<h3> Star Closure </h3>");
	fsm = new FSM();

	fsm.setI( 0 );
	fsm.setF( 0, 0.5 );

	fsm.print();
	fsm.starClosure();
	fsm.print();
}

function exampleClosureTropical()
{
	document.write( "<h3> Star Closure in Tropical SR</h3>");
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
	document.write( "<h3> Union </h3>");
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
	document.write( "<h3> Concat </h3>");
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
	document.write( "<h3> Intersect </h3>");
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
	fsm3.trim();
	fsm3.shrink();
	fsm3.print();
}

function exampleIntersectEpsilon()
{
	document.write( "<h3> Intersect with Epsilon</h3>");
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
	fsm3.print();
}

function exampleCompose()
{
	document.write( "<h3> Compose </h3>");
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

function exampleReverse()
{
	document.write( "<h3> Reverse </h3>");
	fsm = new FSM();
	fsm.setE( 0, 1, 0 );
	fsm.setE( 1, 2, 1 );
	fsm.setI( 0, 0.5 );
	fsm.setF( 2, 0.8 );
	fsm.print();
	fsm.reverse();
	fsm.print();
}

function examplePushWeights()
{
	document.write( "<h3> Push Weights </h3>");
	fsm = new FSM();
	fsm.setI( 0 );
	fsm.setE( 0, 1, 0, 0, 2 );
	fsm.setE( 1, 15, 1, 1, 1 );
	fsm.setE( 15, 16, 0, 0, 0.5 );
	fsm.setE( 15, 17, 1, 1, 0.5 );
	fsm.setF( 16, 0.1 );
	fsm.setF( 17, 0.12 );

	fsm.setE( 0, 2, 1, 1, 2 );
	fsm.setE( 2, 11, 0, 0, 0.5 );
	fsm.setE( 11, 14, 2, 2, 1 );
	fsm.setE( 2, 12, 1, 1, 0.5 );
	fsm.setE( 12, 13, 2, 2, 1 );
	fsm.setF( 14, 0.3 );
	fsm.setF( 13, 0.02 );

	fsm.setE( 0, 3, 2, 2, 4 );
	fsm.setE( 3, 4, 0, 0, 0.25 );
	fsm.setE( 4, 10, 1, 1, 1 );
	fsm.setE( 3, 5, 1, 1, 0.5 );
	fsm.setE( 5, 8, 0, 0, 0.5 );
	fsm.setE( 5, 9, 1, 1, 0.5 );
	fsm.setE( 3, 6, 2, 2, 0.25 );
	fsm.setE( 6, 7, 0, 0, 1 );
	fsm.setF( 10, 0.03 );
	fsm.setF( 8, 0.18 );
	fsm.setF( 9, 0.07 );
	fsm.setF( 7, 0.18 );

	fsm.print();
	fsm.pushWeights();
	fsm.print();

}

function exampleDeterminize()
{
	document.write( "<h3> Determinize </h3>");
	fsm = new FSM();
	fsm.setE( 0, 1, 0, 0, 0.3 );
	fsm.setE( 1, 1, 1, 1, 0.4 );
	fsm.setE( 1, 3, 2, 2, 0.6 );
	fsm.setE( 0, 2, 0, 0, 0.7 );
	fsm.setE( 2, 2, 1, 1, 0.4 );
	fsm.setE( 2, 3, 3, 3, 0.6 );
	fsm.setI( 0 );
	fsm.setF( 3 );

  fsm.print();
	fsm.determinize();
  fsm.print();
}

function exampleMinimize()
{
	document.write( "<h3> Minimize </h3>");
	fsm = new FSM;
	fsm.setE( 0, 1, 0, 0 );
	fsm.setE( 1, 2, 1, 1 );
	fsm.setE( 0, 3, 0, 0 );
	fsm.setE( 3, 4, 1, 1 );
	fsm.setI( 0 );
	fsm.setF( 2 );
	fsm.setF( 4 );
	fsm.print();
	fsm.minimize();
	fsm.print();
}

function exampleSingleSourceDistance()
{
	document.write( "<h3> Single Source Distance </h3>");
	fsm = new FSM;
	fsm.setE( 0, 1, 0, 0, 0.5 );
	fsm.setE( 1, 3, 0, 0, 0.1 );
	fsm.setE( 0, 1, 1, 1, 0.4 );
	fsm.setE( 0, 2, 2, 2, 0.2 );
	fsm.setE( 2, 2, 2, 2, 0.2 );
	fsm.print();
	document.write( '<textarea cols="30" rows="10">' );
	document.write( "Distances from state 0:\n" );
	document.write( dump ( fsm.singleSourceDistance( 0 ) ) );
	document.write( "</textarea>" );
}

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

	pushWeights:  function () { 

	fsm = new FSM();
	fsm.setI( 0 );
	fsm.setE( 0, 1, 0, 0, 2 );
	fsm.setE( 1, 15, 1, 1, 1 );
	fsm.setE( 15, 16, 0, 0, 0.5 );
	fsm.setE( 15, 17, 1, 1, 0.5 );
	fsm.setF( 16, 0.1 );
	fsm.setF( 17, 0.12 );

	fsm.setE( 0, 2, 1, 1, 2 );
	fsm.setE( 2, 11, 0, 0, 0.5 );
	fsm.setE( 11, 14, 2, 2, 1 );
	fsm.setE( 2, 12, 1, 1, 0.5 );
	fsm.setE( 12, 13, 2, 2, 1 );
	fsm.setF( 14, 0.3 );
	fsm.setF( 13, 0.02 );

	fsm.setE( 0, 3, 2, 2, 4 );
	fsm.setE( 3, 4, 0, 0, 0.25 );
	fsm.setE( 4, 10, 1, 1, 1 );
	fsm.setE( 3, 5, 1, 1, 0.5 );
	fsm.setE( 5, 8, 0, 0, 0.5 );
	fsm.setE( 5, 9, 1, 1, 0.5 );
	fsm.setE( 3, 6, 2, 2, 0.25 );
	fsm.setE( 6, 7, 0, 0, 1 );
	fsm.setF( 10, 0.03 );
	fsm.setF( 8, 0.18 );
	fsm.setF( 9, 0.07 );
	fsm.setF( 7, 0.18 );

	return  ( serialize( fsm ) == 'a:2:{s:1:"Q";a:18:{i:0;a:3:{i:0;a:3:{i:1;a:1:{i:0;a:1:{i:0;i:2;}}i:2;a:1:{i:1;a:1:{i:1;i:2;}}i:3;a:1:{i:2;a:1:{i:2;i:4;}}}i:1;i:0;i:2;i:1;}i:1;a:3:{i:0;a:1:{i:15;a:1:{i:1;a:1:{i:1;i:1;}}}i:1;i:0;i:2;i:0;}i:2;a:3:{i:0;a:2:{i:11;a:1:{i:0;a:1:{i:0;d:0.5;}}i:12;a:1:{i:1;a:1:{i:1;d:0.5;}}}i:1;i:0;i:2;i:0;}i:3;a:3:{i:0;a:3:{i:4;a:1:{i:0;a:1:{i:0;d:0.25;}}i:5;a:1:{i:1;a:1:{i:1;d:0.5;}}i:6;a:1:{i:2;a:1:{i:2;d:0.25;}}}i:1;i:0;i:2;i:0;}i:4;a:3:{i:0;a:1:{i:10;a:1:{i:1;a:1:{i:1;i:1;}}}i:1;i:0;i:2;i:0;}i:5;a:3:{i:0;a:2:{i:8;a:1:{i:0;a:1:{i:0;d:0.5;}}i:9;a:1:{i:1;a:1:{i:1;d:0.5;}}}i:1;i:0;i:2;i:0;}i:6;a:3:{i:0;a:1:{i:7;a:1:{i:0;a:1:{i:0;i:1;}}}i:1;i:0;i:2;i:0;}i:7;a:3:{i:0;a:0:{}i:1;d:0.18;i:2;i:0;}i:8;a:3:{i:0;a:0:{}i:1;d:0.18;i:2;i:0;}i:9;a:3:{i:0;a:0:{}i:1;d:0.07;i:2;i:0;}i:10;a:3:{i:0;a:0:{}i:1;d:0.03;i:2;i:0;}i:11;a:3:{i:0;a:1:{i:14;a:1:{i:2;a:1:{i:2;i:1;}}}i:1;i:0;i:2;i:0;}i:12;a:3:{i:0;a:1:{i:13;a:1:{i:2;a:1:{i:2;i:1;}}}i:1;i:0;i:2;i:0;}i:13;a:3:{i:0;a:0:{}i:1;d:0.02;i:2;i:0;}i:14;a:3:{i:0;a:0:{}i:1;d:0.3;i:2;i:0;}i:15;a:3:{i:0;a:2:{i:16;a:1:{i:0;a:1:{i:0;d:0.5;}}i:17;a:1:{i:1;a:1:{i:1;d:0.5;}}}i:1;i:0;i:2;i:0;}i:16;a:3:{i:0;a:0:{}i:1;d:0.1;i:2;i:0;}i:17;a:3:{i:0;a:0:{}i:1;d:0.12;i:2;i:0;}}s:5:"isFSA";b:1;}' );
	

	},

	determinize:  function () { 

	fsm = new FSM();
	fsm.setE( 0, 1, 0, 0, 0.3 );
	fsm.setE( 1, 1, 1, 1, 0.4 );
	fsm.setE( 1, 3, 2, 2, 0.6 );
	fsm.setE( 0, 2, 0, 0, 0.7 );
	fsm.setE( 2, 2, 1, 1, 0.4 );
	fsm.setE( 2, 3, 3, 3, 0.6 );
	fsm.setI( 0 );
	fsm.setF( 3 );

	fsm.determinize();
	
	return ( serialize( fsm ) == 'a:2:{s:1:"Q";a:4:{i:0;a:3:{i:0;a:1:{i:1;a:1:{i:0;a:1:{i:0;i:1;}}}i:1;i:0;i:2;i:1;}s:3:"0,1";a:4:{i:0;a:0:{}i:1;i:0;i:2;i:0;i:3;N;}i:1;a:4:{i:0;a:2:{i:1;a:1:{i:1;a:1:{i:1;d:0.4;}}i:2;a:2:{i:2;a:1:{i:2;d:0.18;}i:3;a:1:{i:3;d:0.42;}}}i:1;i:0;i:2;i:0;i:3;s:13:"1,0.3 / 2,0.7";}i:2;a:4:{i:0;a:0:{}i:1;i:1;i:2;i:0;i:3;s:3:"3,1";}}s:5:"isFSA";b:1;}' );

	},

	minimize: function() {

	fsm = new FSM;
	fsm.setE( 0, 1, 0, 0 );
	fsm.setE( 1, 2, 1, 1 );
	fsm.setE( 0, 3, 0, 0 );
	fsm.setE( 3, 4, 1, 1 );
	fsm.setI( 0 );
	fsm.setF( 2 );
	fsm.setF( 4 );
	fsm.minimize();

	return ( serialize( fsm ) == 'a:2:{s:1:"Q";a:3:{i:0;a:3:{i:0;a:1:{i:1;a:1:{i:0;a:1:{i:0;i:2;}}}i:1;i:0;i:2;i:1;}i:1;a:3:{i:0;a:1:{i:2;a:1:{i:1;a:1:{i:1;i:2;}}}i:1;i:0;i:2;i:0;}i:2;a:3:{i:0;a:0:{}i:1;i:1;i:2;i:0;}}s:5:"isFSA";b:1;}' );

	},

	_last: function(){ return true; } }

	for ( var i in tests ) {
		if (! tests[i]() ) {
			alert( "Test " + i + " failed." );
		}
	}
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


